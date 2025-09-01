const Reservation = require('../models/reservation');
const PeriodicReservation = require('../models/periodicReservation');
const Space = require('../models/space');
const checkout = require('@paypal/checkout-server-sdk');
const { client } = require('../utils/paypalClient');

const mongoose = require('mongoose');

const User = require('../models/user');
const {
  sendReservationConfirmationEmail,
} = require('../services/emailService');

// Función de validación
async function validateAvailability({
  spaceId,
  materialId,
  startTime,
  endTime,
  seatsReserved = 1,
  excludeReservationId = null,
}) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (
    !(start instanceof Date) ||
    !(end instanceof Date) ||
    isNaN(start) ||
    isNaN(end) ||
    start >= end
  ) {
    return { ok: false, status: 400, message: 'Rango horario inválido' };
  }
  if (!spaceId && !materialId) {
    return {
      ok: false,
      status: 400,
      message: 'Debe indicarse espacio o material',
    };
  }

  const resourceFilter = spaceId ? { spaceId } : { materialId };
  const overlapFilter = {
    ...resourceFilter,
    startTime: { $lt: end },
    endTime: { $gt: start },
    ...(excludeReservationId ? { _id: { $ne: excludeReservationId } } : {}),
  };

  const overlapping = await Reservation.find(overlapFilter)
    .select('seatsReserved')
    .lean();

  // Materials (cualquier solapamiento rechaza la reserva)
  if (materialId) {
    if (overlapping.length > 0) {
      return {
        ok: false,
        status: 409,
        message: 'El material ya está reservado en ese horario',
      };
    }
    return { ok: true };
  }

  // Espacios (hay que mirar las sumas de asientos reservados)
  const space = await Space.findById(spaceId).select('seats').lean();
  if (!space)
    return { ok: false, status: 404, message: 'Espacio no encontrado' };

  const occuped = overlapping.reduce(
    (acc, r) => acc + (Number(r.seatsReserved) || 0),
    0
  );
  const solicited = Number(seatsReserved) || 0;

  if (occuped >= space.seats) {
    return {
      ok: false,
      status: 409,
      message: 'No quedan asientos disponibles en ese horario',
    };
  }
  if (occuped + solicited > space.seats) {
    return {
      ok: false,
      status: 409,
      message: `Solo quedan ${space.seats - occuped} asientos disponibles`,
    };
  }
  return { ok: true };
}

exports.createReservation = async (req, res) => {
  try {
    if (!process.env.GOOGLE_APP_EMAIL || !process.env.GOOGLE_APP_PW) {
      return res.status(400).json({
        error: 'No hay configuración de Google Apps para enviar emails',
      });
    }

    const fieldsToMaybeNull = [
      'spaceId',
      'spaceName',
      'materialId',
      'materialName',
      'price',
      'seatsReserved',
      'paypalOrderId',
      'paypalCaptureId',
      'paymentStatus',
      'periodicity',
      'lastOccurrenceGenerated',
    ];
    for (const f of fieldsToMaybeNull) {
      if (req.body[f] === 'null') req.body[f] = null;
    }

    const { userId, startTime, endTime } = req.body;
    if (!userId || !startTime || !endTime) {
      return res.status(400).json({ message: 'Campos requeridos' });
    }

    const { spaceId, materialId, seatsReserved } = req.body;

    const check = await validateAvailability({
      spaceId,
      materialId,
      startTime,
      endTime,
      seatsReserved,
    });
    if (!check.ok)
      return res.status(check.status).json({ message: check.message });

    const newReservation = new Reservation(req.body);
    const savedReservation = await newReservation.save();

    res.status(201).json({
      savedReservation,
      message: req.body.paypalCaptureId
        ? 'Reserva creada y pagada con éxito'
        : 'Reserva creada con éxito',
    });

    // Enviar email de confirmación
    try {
      const user = await User.findById(userId);
      if (user?.email) {
        await sendReservationConfirmationEmail({
          to: user.email,
          isSeries: false,
          data: {
            spaceId: req.body.spaceId,
            spaceName: req.body.spaceName,
            materialId: req.body.materialId,
            materialName: req.body.materialName,
            price: req.body.price,
            userId: req.body.userId,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            seatsReserved: req.body.seatsReserved,
            paypalOrderId: req.body.paypalOrderId,
            paypalCaptureId: req.body.paypalCaptureId,
            paymentStatus: req.body.paymentStatus,
            isPaid: req.body.isPaid,
          },
        });
      }
    } catch (mailErr) {
      console.error('Fallo al enviar email de reserva:', mailErr);
    }
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
      spaceName,
      materialId,
      materialName,
      price,
      userId,
      startTime,
      endTime,
      seatsReserved,
      periodicity,
      lastOccurrenceGenerated,
    } = req.body;

    if (spaceId == 'null') req.body.spaceId = null;
    if (spaceName == 'null') req.body.spaceName = null;
    if (materialId == 'null') req.body.materialId = null;
    if (materialName == 'null') req.body.materialName = null;
    if (seatsReserved == 'null') req.body.seatsReserved = null;
    if (price == 'null') req.body.price = null;

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

    const savedPeriodicReservation = await new PeriodicReservation(
      req.body
    ).save({ session });

    // Rango que va a iterar
    let currentStart = new Date(startTime);
    let currentEnd = new Date(endTime);
    const limitDate = new Date(lastOccurrenceGenerated);

    // Umbral de conflictos según la periodicidad
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
      const check = await validateAvailability({
        spaceId,
        materialId,
        startTime: currentStart,
        endTime: currentEnd,
        seatsReserved,
      });

      if (!check.ok) {
        conflictCounter += 1;
        if (conflictCounter > conflictThreshold) {
          await session.abortTransaction();
          session.endSession();
          return res.status(409).json({
            errorCode: 'TOO_MANY_CONFLICTS',
            message: 'Demasiados conflictos. Intenta con otra franja horaria.',
          });
        }
      } else {
        // Crear occurrence
        const occurrence = {
          ...req.body,
          startTime: new Date(currentStart),
          endTime: new Date(currentEnd),
          periodicReservationId: savedPeriodicReservation._id,
        };
        await new Reservation(occurrence).save({ session });
      }

      incrementDates();
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: 'Reserva periódica creada con éxito',
      periodicReservation: savedPeriodicReservation,
      conflictCount: conflictCounter || null,
    });

    try {
      const user = await User.findById(userId);
      if (user?.email) {
        await sendReservationConfirmationEmail({
          to: user.email,
          isSeries: true,
          data: {
            spaceId,
            spaceName,
            materialId,
            materialName,
            price,
            userId,
            startTime,
            endTime,
            seatsReserved,
            periodicity,
            lastOccurrenceGenerated,
          },
        });
      }
    } catch (mailErr) {
      console.error('Fallo al enviar email de reserva periódica:', mailErr);
    }
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

    // Se obtienen todas las reservas del usuario
    const reservations = await Reservation.find({
      userId: req.params.id,
    })
      .populate('spaceId')
      .populate('materialId')
      .populate('periodicReservationId')
      .sort({ startTime: 1 });

    if (!reservations || reservations.length === 0) {
      return res.status(404).json({ message: 'No se han encontrado reservas' });
    }

    // Se filtran según endTime
    const pastReservations = reservations.filter((r) => r.endTime < now);
    const nextReservations = reservations.filter((r) => r.endTime >= now);

    res.json({
      reservations,
      pastReservations,
      nextReservations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTodayReservations = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // buscamos cualquier reserva que empiece antes de mañana
    // y termine después de hoy
    const reservations = await Reservation.find({
      startTime: { $lt: tomorrow },
      endTime: { $gte: today },
    })
      .populate('userId')
      .populate('spaceId')
      .populate('materialId')
      .sort({ startTime: 1 });

    if (reservations.length === 0) {
      return res.status(404).json({ message: 'No se han encontrado reservas' });
    }

    return res.json({ reservations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReservationsByDate = async (req, res) => {
  try {
    const date = req.params.date;

    if (!date) {
      return res.status(400).json({ message: 'Se necesita una fecha' });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const reservations = await Reservation.find({
      startTime: { $lt: endOfDay },
      endTime: { $gt: startOfDay },
    }).sort({ spaceId: 1, startTime: 1 });

    res.json({ reservations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserByReservationId = async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.id,
    }).populate('userId');

    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }
    res.json({ reservation });
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

    // Hereda los valores que van a quedar tras la actualización
    const next = { ...reservation.toObject(), ...req.body };

    const check = await validateAvailability({
      spaceId: next.spaceId,
      materialId: next.materialId,
      startTime: next.startTime,
      endTime: next.endTime,
      seatsReserved: next.seatsReserved,
      excludeReservationId: reservation._id,
    });
    if (!check.ok)
      return res.status(check.status).json({ message: check.message });

    reservation.set(req.body);

    await reservation.save();
    res.status(200).json({ message: 'Reserva actualizada con éxito' });
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

    // Recuperamos todas las reservas existentes
    const children = await Reservation.find({
      periodicReservationId: periodicReservation._id,
      startTime: { $gte: newStartDay },
    }).session(session);

    const conflictThreshold =
      periodicReservation.periodicity === 'monthly' ? 6 : 15;
    let conflictCounter = 0;

    // Recorremos cada reserva hija
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

      // Buscamos conflictos
      const conflict = await Reservation.findOne({
        _id: { $ne: child._id },
        spaceId: periodicReservation.spaceId,
        startTime: { $lt: updatedEnd },
        endTime: { $gt: updatedStart },
      }).session(session);

      if (conflict) {
        // Hay solapamiento
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
        child.startTime = updatedStart;
        child.endTime = updatedEnd;
        child.seatsReserved = seatsReserved;
        await child.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message:
        'La reserva periódica y sus ocurrencias se han actualizado correctamente',
      conflictCount: conflictCounter > 0 ? conflictCounter : null,
    });
  } catch (error) {
    // Rollback en caso de error
    await session.abortTransaction();
    console.error('Error actualizando reserva periódica:', error);
    return res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

exports.deleteReservation = async (req, res) => {
  let arePaid = false;
  try {
    const reservation = await Reservation.findOne({ _id: req.params.id });
    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    if (reservation.isPaid) {
      const captureId = reservation.paypalCaptureId;

      const refundRequest = new checkout.payments.CapturesRefundRequest(
        captureId
      );
      refundRequest.requestBody({});

      await client().execute(refundRequest);
      arePaid = true;
    }

    await Reservation.deleteOne({ _id: req.params.id });
    res.json({
      message: arePaid
        ? 'Reserva eliminada y pago reembolsado'
        : 'Reserva eliminada',
    });
  } catch (error) {
    console.error('Error al eliminar la reserva:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deletePeriodicReservation = async (req, res) => {
  let arePaid = false;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const periodicId = req.params.id;
    const now = new Date();
    const limit24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const reservations = await Reservation.find({
      periodicReservationId: periodicId,
    }).session(session);

    // Se marcan para borrar las reservas que estan dentro de las siguientes 24 horas
    const toDelete = reservations.filter((r) => {
      const start = new Date(r.startTime);
      return start >= limit24h;
    });

    // Refund de todas las reservas +24 horas
    for (const r of toDelete) {
      if (r.isPaid && r.paypalCaptureId) {
        const refundReq = new checkout.payments.CapturesRefundRequest(
          r.paypalCaptureId
        );
        refundReq.requestBody({});
        await client().execute(refundReq);
        if (!arePaid) arePaid = true;
      }
    }

    // Borramos todas las reservas posteriores excepto +24 horas
    await Reservation.deleteMany({
      periodicReservationId: periodicId,
      startTime: { $gte: limit24h },
    }).session(session);
    await PeriodicReservation.deleteOne({ _id: periodicId }).session(session);

    await session.commitTransaction();
    res.status(200).json({
      message: arePaid
        ? 'Reservas periódicas eliminadas y pagos reembolsados con éxito'
        : 'Reservas periódicas eliminadas con éxito',
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error al eliminar la reserva periódica:', error);
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

exports.markAsPaid = async (req, res) => {
  const { id } = req.params;
  try {
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      throw new Error('Reserva no encontrada');
    }
    reservation.isPaid = true;
    await reservation.save();
    res.status(200).json({ message: 'Reserva marcada como pagada con éxito' });
  } catch (error) {
    console.error('Error al marcar la reserva como pagada:', error);
    res.status(500).json({ message: error.message });
  }
};
