const Reservation = require('../models/reservation');
const PeriodicReservation = require('../models/periodicReservation');
const mongoose = require('mongoose');

exports.createReservation = async (req, res) => {
  try {
    const {
      spaceId,
      userId,
      startTime,
      endTime,
      seatsReserved,
      periodicReservationId,
    } = req.body;

    if (!spaceId || !userId || !startTime || !endTime || !seatsReserved) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const newReservation = new Reservation({
      spaceId,
      userId,
      startTime,
      endTime,
      seatsReserved,
      periodicReservationId,
    });

    const savedReservation = await newReservation.save();
    res.status(201).json(savedReservation);
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
      userId,
      startTime,
      endTime,
      seatsReserved,
      periodicity,
      lastOccurrenceGenerated,
    } = req.body;

    //console.log(req.body);

    if (
      !spaceId ||
      !userId ||
      !startTime ||
      !endTime ||
      !seatsReserved ||
      !periodicity ||
      !lastOccurrenceGenerated
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const newPeriodicReservation = new PeriodicReservation({
      spaceId,
      userId,
      startTime,
      endTime,
      seatsReserved,
      periodicity,
      lastOccurrenceGenerated,
    });

    const savedPeriodicReservation = await newPeriodicReservation.save({
      session,
    });

    let currentStart = new Date(startTime);
    let currentEnd = new Date(endTime);
    const limitDate = new Date(lastOccurrenceGenerated);

    // Establecemos el umbral de conflictos según la periodicidad
    const conflictThreshold = periodicity === 'monthly' ? 6 : 15;
    let conflictCounter = 0;

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

    // Bucle para generar las ocurrencias
    while (currentStart <= limitDate) {
      // Buscamos si existe alguna reserva que se solape en ese espacio y rango horario
      const conflict = await Reservation.findOne({
        spaceId,
        $or: [
          { startTime: { $lt: currentEnd }, endTime: { $gt: currentStart } },
        ],
      }).session(session);

      if (conflict) {
        conflictCounter++;
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
        // Crear la ocurrencia en Reservation y relacionarla con el periodicReservation
        const newReservation = new Reservation({
          spaceId,
          userId,
          startTime: new Date(currentStart),
          endTime: new Date(currentEnd),
          seatsReserved,
          periodicReservationId: savedPeriodicReservation._id,
        });
        await newReservation.save({ session });
      }

      incrementDates();
    }

    await session.commitTransaction();
    session.endSession();
    return res.status(201).json({
      message: 'Periodic reservation created successfully',
      periodicReservation: savedPeriodicReservation,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ startTime: 1 });
    if (!reservations || reservations.length === 0) {
      return res.status(404).json({ message: 'No reservations found' });
    }
    res.json({ reservations });
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
      .sort({ startTime: 1 });

    if (!reservations || reservations.length === 0) {
      return res.status(404).json({ message: 'No reservations found' });
    }

    // Filtramos según endTime
    const pastReservations = reservations.filter((r) => r.endTime < now);
    const nextReservations = reservations.filter((r) => r.endTime >= now);

    /*  
    // También se pueden hacer las siguientes consultas en la BD para no sobrecargar la API
    // Reservas pasadas
    const pastReservations = await Reservation.find({
      userId: req.params.id,
      endTime: { $lt: now },
    })
      .populate("spaceId")
      .sort({ startTime: 1 });

    // Reservas siguientes (en curso o futuras)
    const nextReservations = await Reservation.find({
      userId: req.params.id,
      endTime: { $gte: now },
    })
      .populate("spaceId")
      .sort({ startTime: 1 });
    */

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
      return res.status(400).json({ message: 'Date is required' });
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
