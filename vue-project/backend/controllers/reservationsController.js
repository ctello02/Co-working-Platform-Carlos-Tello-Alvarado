const Reservation = require('../models/reservation');
const PeriodicReservation = require('../models/periodicReservation');
const mongoose = require('mongoose');

exports.createReservation = async (req, res) => {
  try {
    const { spaceId, materialId, seatsReserved, userId, startTime, endTime } =
      req.body;

    if (spaceId == 'null') req.body.spaceId = null;
    if (materialId == 'null') req.body.materialId = null;
    if (seatsReserved == 'null') req.body.seatsReserved = null;

    if (!userId || !startTime || !endTime) {
      return res.status(400).json({ message: 'Campos requeridos' });
    }

    const newReservation = new Reservation(req.body);

    const savedReservation = await newReservation.save();
    res.status(201).json({
      savedReservation,
      message: 'Reserva creada con éxito',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createPeriodicReservation = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      spaceId,
      materialId,
      userId,
      startTime,
      endTime,
      seatsReserved,
      periodicity,
      lastOccurrenceGenerated,
    } = req.body;

    if (spaceId == 'null') req.body.spaceId = null;
    if (materialId == 'null') req.body.materialId = null;
    if (seatsReserved == 'null') req.body.seatsReserved = null;

    console.log(req.body);

    if (
      !userId ||
      !startTime ||
      !endTime ||
      !periodicity ||
      !lastOccurrenceGenerated
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Campos requeridos' });
    }

    const newPeriodicReservation = new PeriodicReservation(req.body);

    const savedPeriodicReservation = await newPeriodicReservation.save({
      session,
    });

    let currentStart = new Date(startTime);
    let currentEnd = new Date(endTime);
    const limitDate = new Date(lastOccurrenceGenerated);

    // Establecemos el umbral de conflictos según la periodicidad
    const conflictThreshold = periodicity === 'monthly' ? 6 : 15;
    let conflictCounter = 0;
    let conflictObjects = [];

    // Función para avanzar la fecha según la periodicidad
    const incrementDates = () => {
      if (periodicity === 'daily') {
        currentStart.setDate(currentStart.getDate() + 1);
        currentEnd.setDate(currentEnd.getDate() + 1);
      } else if (periodicity === 'weekly') {
        currentStart.setDate(currentStart.getDate() + 7);
        currentEnd.setDate(currentEnd.getDate() + 7);
      } else if (periodicity === 'monthly') {
        currentStart.setMonth(currentStart.getMonth() + 1);
        currentEnd.setMonth(currentEnd.getMonth() + 1);
      }
    };

    const idSearched = req.body.spaceId
      ? req.body.spaceId
      : req.body.materialId;

    // Bucle para generar las ocurrencias
    while (currentStart <= limitDate) {
      // Buscamos si existe alguna reserva que se solape en ese espacio y rango horario
      const conflict = await Reservation.findOne({
        idSearched,
        $or: [
          { startTime: { $lt: currentEnd }, endTime: { $gt: currentStart } },
        ],
      }).session(session);

      const newObject = {
        ...req.body,
        startTime: currentStart,
        endTime: currentEnd,
        periodicReservationId: savedPeriodicReservation._id,
      };

      console.log('newObject', newObject);

      if (conflict) {
        conflictCounter++;
        conflictObjects.push(newObject);

        if (conflictCounter > conflictThreshold) {
          // Si se supera el umbral de conflictos, abortamos la operación
          await session.abortTransaction();
          session.endSession();
          return res.status(409).json({
            errorCode: 'TOO_MANY_CONFLICTS',
            message: 'Demasiados conflictos. Intente con otra franja horaria.',
          });
        }
      } else {
        // Si no hay conflictos, creamos la reserva
        await new Reservation(newObject).save({ session });
      }

      incrementDates();
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: 'Reserva periódica creada con éxito',
      periodicReservation: savedPeriodicReservation,
      conflictCount: conflictCounter || null,
      conflictObjects: conflictObjects || null,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.getPeriodicReservations = async (req, res) => {
  try {
    const periodicReservations = await PeriodicReservation.find().sort({
      startTime: 1,
    });

    if (!periodicReservations || periodicReservations.length === 0) {
      return res
        .status(404)
        .json({ message: 'No se han encontrado reservas periódicas' });
    }
    res.json({ periodicReservations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserReservations = async (req, res) => {
  try {
    const now = new Date();

    // Obtenemos todas las reservas
    const reservations = await Reservation.find({ userId: req.params.id })
      .populate('spaceId')
      .populate('materialId')
      .populate('periodicReservationId')
      .sort({ startTime: 1 });

    if (!reservations || reservations.length === 0) {
      return res.status(404).json({ message: 'No se han encontrado reservas' });
    }

    // Filtramos según endTime
    const pastReservations = reservations.filter((r) => r.endTime < now);
    const nextReservations = reservations.filter((r) => r.endTime >= now);

    res.json({
      reservations, // todas las reservas
      pastReservations, // terminadas (endTime < now)
      nextReservations, // en curso o futuras (endTime >= now)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReservationsByDate = async (req, res) => {
  try {
    const date = req.params.date; // Recibir la fecha como parámetro en formato YYYY-MM-DD

    if (!date) {
      return res.status(400).json({ message: 'Se necesita una fecha' });
    }

    // Crear los límites del día seleccionado
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Buscar reservas que ocurren dentro de la fecha seleccionada
    const reservations = await Reservation.find({
      startTime: { $lt: endOfDay },
      endTime: { $gt: startOfDay },
    }).sort({ spaceId: 1, startTime: 1 });

    res.json({ reservations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateReservation = async (req, res) => {
  try {
    let reservation = await Reservation.findOne({ _id: req.body._id });
    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    reservation.set(req.body);

    await reservation.save();
    res.json({ message: 'Reserva actualizada con éxito' });
  } catch (error) {
    console.error('Error al actualizar la reserva:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updatePeriodicReservation = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let periodicReservation = await PeriodicReservation.findOne({
      _id: req.body._id,
    }).session(session);

    if (!periodicReservation) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ message: 'Reserva periódica no encontrada' });
    }

    const { startTime, endTime, seatsReserved } = req.body;
    const newStart = new Date(startTime);
    const newEnd = new Date(endTime);
    periodicReservation.startTime = newStart;
    periodicReservation.endTime = newEnd;
    periodicReservation.seatsReserved = seatsReserved;

    await periodicReservation.save({ session });

    // Calculamos duración del evento (en ms)
    const durationMs = newEnd.getTime() - newStart.getTime();

    const newStartDay = new Date(newStart);
    newStartDay.setHours(0, 0, 0, 0);

    // 2) Recuperamos todas las Occurrences existentes
    const children = await Reservation.find({
      periodicReservationId: periodicReservation._id,
      startTime: { $gte: newStartDay },
    }).session(session);

    // 3) Preparamos la lógica de conflictos
    const conflictThreshold =
      periodicReservation.periodicity === 'monthly' ? 6 : 15;
    let conflictCounter = 0;

    // 4) Recorremos cada reserva hija
    for (let child of children) {
      // Calculamos sus nuevos start/end combinando fecha original con la nueva hora
      const origDate = child.startTime;
      const updatedStart = new Date(origDate);
      updatedStart.setHours(
        newStart.getHours(),
        newStart.getMinutes(),
        newStart.getSeconds(),
        newStart.getMilliseconds()
      );
      const updatedEnd = new Date(updatedStart.getTime() + durationMs);

      // Buscamos conflictos (excluyendo la propia reserva child)
      const conflict = await Reservation.findOne({
        _id: { $ne: child._id },
        spaceId: periodicReservation.spaceId,
        startTime: { $lt: updatedEnd },
        endTime: { $gt: updatedStart },
      }).session(session);

      if (conflict) {
        // Hay solapamiento: acumulamos y no tocamos esta ocurrencia
        conflictCounter++;

        // Si superamos el umbral, abortamos
        if (conflictCounter > conflictThreshold) {
          await session.abortTransaction();
          session.endSession();
          return res.status(409).json({
            errorCode: 'TOO_MANY_CONFLICTS',
            message: 'Demasiados conflictos. Intenta con otra franja horaria.',
            conflictCount: conflictCounter,
          });
        }
      } else {
        // No hay conflicto: aplicamos los cambios
        child.startTime = updatedStart;
        child.endTime = updatedEnd;
        child.seatsReserved = seatsReserved;
        await child.save({ session });
      }
    }

    // 5) Commit de la transacción
    await session.commitTransaction();
    session.endSession();

    return res.json({
      message:
        'La reserva periódica y sus ocurrencias se han actualizado correctamente',
      conflictCount: conflictCounter > 0 ? conflictCounter : null,
    });
  } catch (error) {
    // Rollback en caso de error inesperado
    await session.abortTransaction();
    console.error('Error actualizando reserva periódica:', error);
    return res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

exports.deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findOne({ _id: req.params.id });
    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    } else {
      await Reservation.deleteOne({ _id: req.params.id });
      res.json({ message: 'Reserva eliminada con éxito' });
    }
  } catch (error) {
    console.error('Error al eliminar la reserva:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deletePeriodicReservation = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await Reservation.deleteMany({
      periodicReservationId: req.params.id,
    }).session(session);
    await PeriodicReservation.deleteOne({ _id: req.params.id }).session(
      session
    );
    await session.commitTransaction();
    res.status(200).json({ message: 'Reserva periódica eliminada con éxito' });
  } catch (error) {
    await session.abortTransaction();
    console.log('Error al eliminar la reserva periódica:', error);
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// payReservation

// markPaidReservation

// getTodayReservations
