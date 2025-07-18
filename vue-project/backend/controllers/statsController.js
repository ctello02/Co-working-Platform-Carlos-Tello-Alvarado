// controllers/statsController.js
const Reservation = require('../models/reservation');
const PeriodicReservation = require('../models/periodicReservation');
const mongoose = require('mongoose');

exports.getRangeCharts = async (req, res) => {
  try {
    const from = req.query.from ? new Date(req.query.from) : new Date();
    const to = req.query.to ? new Date(req.query.to) : new Date();

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

      // 1) Unifico el id del recurso
      {
        $project: {
          resourceId: { $ifNull: ['$spaceId', '$materialId'] },
        },
      },

      // 2) Agrupo y cuento
      {
        $group: {
          _id: '$resourceId',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },

      // 3) Traigo los datos de espacios y de materiales
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

      // 4) Proyectamos count, name y el nuevo resourceType
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
          resourceType: {
            $cond: [{ $gt: [{ $size: '$space' }, 0] }, 'space', 'material'],
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
    // Devolver todo junto
    //
    res.json({
      reservationsPorDia: reservasPorDia,
      topRecursos,
      pagoStats,
      periodicStats,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
};

exports.getOneShotCharts = async (req, res) => {
  try {
    const from = new Date(req.query.from);
    const to = new Date(req.query.to);

    const hourlyReservations = await Reservation.aggregate([
      { $match: { startTime: { $gte: from, $lte: to } } },

      // 1) Saco date ("2025-07-16") y hour (0–23)
      {
        $project: {
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$startTime',
            },
          },
          hour: { $hour: '$startTime' },
        },
      },

      // 2) Agrupo por date + hour
      {
        $group: {
          _id: { date: '$date', hour: '$hour' },
          count: { $sum: 1 },
        },
      },

      // 3) Ordeno
      {
        $sort: {
          '_id.date': 1,
          '_id.hour': 1,
        },
      },
    ]);

    return res.status(200).json(hourlyReservations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
};
