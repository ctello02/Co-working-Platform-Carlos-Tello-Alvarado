// controllers/statsController.js
const Reservation = require('../models/reservation');
const PeriodicReservation = require('../models/periodicReservation');
const mongoose = require('mongoose');

exports.getOverview = async (req, res) => {
  try {
    // Opcional: parámetros from/to en query (ISO strings)
    const from = req.query.from
      ? new Date(req.query.from)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 días atrás por defecto
    const to = req.query.to ? new Date(req.query.to) : new Date(); // ahora

    //
    // 1) Reservas por día
    //
    const perDay = await Reservation.aggregate([
      { $match: { startTime: { $gte: from, $lte: to } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    // convertimos a labels/data
    const reservasPorDia = {
      labels: perDay.map((x) => x._id),
      data: perDay.map((x) => x.count),
    };

    //
    // 2) Top 10 recursos (espacios o materiales) más reservados
    //
    const topRecursos = await Reservation.aggregate([
      { $match: { startTime: { $gte: from, $lte: to } } },
      {
        $project: {
          resourceId: { $ifNull: ['$spaceId', '$materialId'] },
        },
      },
      {
        $group: {
          _id: '$resourceId',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      // lookup para obtener nombre
      {
        $lookup: {
          from: 'spaces',
          localField: '_id',
          foreignField: '_id',
          as: 'space',
        },
      },
      {
        $lookup: {
          from: 'materials',
          localField: '_id',
          foreignField: '_id',
          as: 'material',
        },
      },
      {
        $project: {
          count: 1,
          name: {
            $cond: [
              { $gt: [{ $size: '$space' }, 0] },
              { $arrayElemAt: ['$space.name', 0] },
              { $arrayElemAt: ['$material.name', 0] },
            ],
          },
        },
      },
    ]);

    //
    // 3) % de reservas pagadas vs totales
    //
    const totalCount = await Reservation.countDocuments({
      startTime: { $gte: from, $lte: to },
    });
    const completedCount = await Reservation.countDocuments({
      startTime: { $gte: from, $lte: to },
      isPaid: true,
    });
    const pagoStats = {
      total: totalCount,
      completed: completedCount,
      rate: totalCount > 0 ? completedCount / totalCount : 0,
    };

    //
    // 4) Reservas periódicas por tipo
    //
    const periodicStatsRaw = await PeriodicReservation.aggregate([
      { $match: { startTime: { $gte: from, $lte: to } } },
      {
        $group: {
          _id: '$periodicity',
          count: { $sum: 1 },
        },
      },
    ]);
    // Mapear a objeto { daily: x, weekly: y, monthly: z }
    const periodicStats = periodicStatsRaw.reduce(
      (acc, cur) => {
        acc[cur._id] = cur.count;
        return acc;
      },
      { daily: 0, weekly: 0, monthly: 0 }
    );

    //
    // 5) Concurrencia hora vs día de la semana
    //
    const hourlyReservations = await Reservation.aggregate([
      { $match: { startTime: { $gte: from, $lte: to } } },
      {
        $project: {
          hour: { $hour: '$startTime' },
          dow: { $dayOfWeek: '$startTime' }, // 1=Dom,2=Lun,…7=Sab
        },
      },
      {
        $group: {
          _id: { hour: '$hour', dow: '$dow' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.hour': 1, '_id.dow': 1 } },
    ]);

    //
    // Devolver todo junto
    //
    res.json({
      reservationsPorDia: reservasPorDia,
      topRecursos,
      pagoStats,
      periodicStats,
      hourlyReservations,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
};
