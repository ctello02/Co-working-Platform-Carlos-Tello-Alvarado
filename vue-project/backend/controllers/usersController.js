const User = require('../models/user');
const Reservation = require('../models/reservation');
const PeriodicReservation = require('../models/periodicReservation');
const mongoose = require('mongoose');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }
    res.json({ users });
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
    res.json({ message: 'User updated successfully' });
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
      return res.status(404).json({ message: 'User not found' });
    }

    const now = new Date();

    let reservations = await Reservation.find({
      userId: req.params.id,
      startTime: { $gte: now },
    }).session(session);
    if (reservations.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({ message: 'User has reservations' });
    }

    let periodicReservations = await PeriodicReservation.find({
      userId: req.params.id,
    }).session(session);
    if (periodicReservations.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(409)
        .json({ message: 'User has periodic reservations' });
    }

    await User.deleteOne({ _id: req.params.id }).session(session);
    await session.commitTransaction();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

exports.bulkDeleteUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let user = await User.findOne({ _id: req.params.id }).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'User not found' });
    }

    await Reservation.deleteMany({
      userId: req.params.id,
    }).session(session);

    await PeriodicReservation.deleteMany({
      userId: req.params.id,
    }).session(session);

    await User.deleteOne({ _id: req.params.id }).session(session);

    await session.commitTransaction();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};
