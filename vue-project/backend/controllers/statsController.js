// controllers/statsController.js
const Reservation = require('../models/reservation');
const PeriodicReservation = require('../models/periodicReservation');
const mongoose = require('mongoose');

exports.getRangeCharts = async (req, res) => {
  try {
    const from = req.query.from ? new Date(req.query.from) : new Date();
    const to = req.query.to ? new Date(req.query.to) : new Date();

    // Reservas por día
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
    const reservationsByDate = {
      labels: perDay.map((x) => x._id),
      data: perDay.map((x) => x.count),
    };

    // Top 10 recursos (espacios o materiales) más reservados
    const topResources = await Reservation.aggregate([
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
          resourceType: {
            $cond: [{ $gt: [{ $size: '$space' }, 0] }, 'space', 'material'],
          },
        },
      },
    ]);

    // Porcentaje de reservas pagadas vs totales
    const totalCount = await Reservation.countDocuments({
      startTime: { $gte: from, $lte: to },
    });
    const completedCount = await Reservation.countDocuments({
      startTime: { $gte: from, $lte: to },
      isPaid: true,
    });
    const paymentStats = {
      total: totalCount,
      completed: completedCount,
      rate: totalCount > 0 ? completedCount / totalCount : 0,
    };

    // // Reservas periódicas por tipo
    // const periodicStatsRaw = await PeriodicReservation.aggregate([
    //   { $match: { startTime: { $gte: from, $lte: to } } },
    //   {
    //     $group: {
    //       _id: '$periodicity',
    //       count: { $sum: 1 },
    //     },
    //   },
    // ]);
    // const periodicStats = periodicStatsRaw.reduce(
    //   (acc, cur) => {
    //     acc[cur._id] = cur.count;
    //     return acc;
    //   },
    //   { daily: 0, weekly: 0, monthly: 0 }
    // );
    const periodicStatsRaw = await Reservation.aggregate([
      // Filtramos por fecha y que exista periodicReservationId
      {
        $match: {
          startTime: { $gte: from, $lte: to },
          periodicReservationId: { $ne: null },
        },
      },
      // Agrupamos por periodicReservationId para quedarnos uno de cada
      {
        $group: {
          _id: '$periodicReservationId',
        },
      },
      // Hacemos lookup a PeriodicReservation para leer la periodicity
      {
        $lookup: {
          from: 'periodicreservations',
          localField: '_id',
          foreignField: '_id',
          as: 'pr',
        },
      },
      { $unwind: '$pr' },
      // Agrupamos ya por periodicity para contar
      {
        $group: {
          _id: '$pr.periodicity',
          count: { $sum: 1 },
        },
      },
    ]);

    // Reducimos el array a un objeto inicializado
    const periodicStats = periodicStatsRaw.reduce(
      (acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      },
      { daily: 0, weekly: 0, monthly: 0 }
    );

    res.status(200).json({
      reservationsByDate,
      topResources,
      paymentStats,
      periodicStats,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
};

exports.getOneShotCharts = async (req, res) => {
  try {
    const dayStr = req.query.date || new Date().toISOString().substr(0, 10);
    const startOfDay = new Date(`${dayStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dayStr}T23:59:59.999Z`);

    const oneDayStat = await Reservation.find({
      startTime: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate('userId')
      .populate('spaceId')
      .populate('materialId')
      .lean();

    return res.status(200).json(oneDayStat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
};
