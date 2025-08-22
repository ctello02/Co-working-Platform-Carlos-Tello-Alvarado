const User = require('../models/user');
const Reservation = require('../models/reservation');
const PeriodicReservation = require('../models/periodicReservation');
const checkout = require('@paypal/checkout-server-sdk');
const { client } = require('../utils/paypalClient');
const mongoose = require('mongoose');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.body._id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.set(req.body);

    await user.save();
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let user = await User.findOne({ _id: req.params.id }).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const now = new Date();

    let reservations = await Reservation.find({
      userId: req.params.id,
      startTime: { $gte: now },
    }).session(session);
    if (reservations.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({ message: 'El usuario tiene reservas' });
    }

    let periodicReservations = await PeriodicReservation.find({
      userId: req.params.id,
    }).session(session);
    if (periodicReservations.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(409)
        .json({ message: 'El usuario tiene reservas periódicas' });
    }

    await User.deleteOne({ _id: req.params.id }).session(session);
    await session.commitTransaction();
    res.json({ message: 'User eliminado con éxito' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

exports.bulkDeleteUser = async (req, res) => {
  let arePaid = false;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.params.id;
    let user = await User.findOne({ _id: userId }).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'User not found' });
    }

    const reservations = await Reservation.find({ userId }).session(session);

    for (const r of reservations) {
      if (r.isPaid && r.paypalCaptureId) {
        const refundReq = new checkout.payments.CapturesRefundRequest(
          r.paypalCaptureId
        );
        refundReq.requestBody({});
        await client().execute(refundReq);
        if (!arePaid) arePaid = true;
      }
    }

    await Reservation.deleteMany({
      userId: userId,
    }).session(session);

    await PeriodicReservation.deleteMany({
      userId: userId,
    }).session(session);

    await User.deleteOne({ _id: userId }).session(session);

    await session.commitTransaction();
    res
      .status(200)
      .json({ message: 'Usuario eliminado y pagos reembolsados con éxito.' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};
