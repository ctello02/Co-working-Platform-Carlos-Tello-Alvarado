const Space = require('../models/space');
const Reservation = require('../models/reservation');
const PeriodicReservation = require('../models/periodicReservation');
const mongoose = require('mongoose');
const fs = require('fs'); // Módulo para interactuar con el sistema de archivos
const path = require('path');

exports.getSpaces = async (req, res) => {
  try {
    const spaces = await Space.find();
    if (spaces.length === 0) {
      return res.status(404).json({ message: 'No spaces found' });
    }
    res.json({ spaces });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSpace = async (req, res) => {
  try {
    if (req.file) {
      req.body.image = `${req.protocol}://${req.get('host')}/uploads/${
        req.file.filename
      }`;
    }

    const newSpace = new Space(req.body);

    const savedSpace = await newSpace.save();
    res.status(201).json(savedSpace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSpace = async (req, res) => {
  try {
    const space = await Space.findOne({ _id: req.body.id });
    if (!space) {
      return res.status(404).json({ message: 'Space not found' });
    }

    // Si se subió una nueva imagen, eliminamos la anterior
    if (req.file) {
      const imagePath = path.join(
        __dirname,
        '..',
        'uploads',
        path.basename(space.image)
      );

      // Eliminar la imagen anterior del sistema de archivos
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error al eliminar la imagen:', err);
        } else {
          console.log('Imagen eliminada correctamente:', imagePath);
        }
      });

      // Actualizar la URL de la imagen con la nueva
      req.body.image = `${req.protocol}://${req.get('host')}/uploads/${
        req.file.filename
      }`;
    }

    space.set(req.body);

    const savedSpace = await space.save();
    res.status(200).json(savedSpace);
  } catch (error) {
    console.error('Error al actualizar el espacio:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSpace = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let space = await Space.findOne({ _id: req.params.id }).session(session);
    if (!space) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Space not found' });
    }

    const now = new Date();

    let reservations = await Reservation.find({
      spaceId: req.params.id,
      startTime: { $gte: now },
    }).session(session);
    if (reservations.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({ message: 'Space has reservations' });
    }

    let periodicReservations = await PeriodicReservation.find({
      spaceId: req.params.id,
    }).session(session);
    if (periodicReservations.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(409)
        .json({ message: 'Space has periodic reservations' });
    }

    // Obtener la ruta completa de la imagen del servidor
    const imagePath = path.join(
      __dirname,
      '..',
      'uploads',
      path.basename(space.image)
    );

    // Eliminar la imagen del sistema de archivos
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error('Error al eliminar la imagen:', err);
      } else {
        console.log('Imagen eliminada correctamente:', imagePath);
      }
    });

    await Space.deleteOne({ _id: req.params.id }).session(session);
    await session.commitTransaction();
    res.json({ message: 'Space deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

exports.bulkDeleteSpace = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let space = await Space.findOne({ _id: req.params.id }).session(session);
    if (!space) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Space not found' });
    }

    await Reservation.deleteMany({
      spaceId: req.params.id,
    }).session(session);

    await PeriodicReservation.deleteMany({
      spaceId: req.params.id,
    }).session(session);

    await Space.deleteOne({ _id: req.params.id }).session(session);

    await session.commitTransaction();
    res.json({ message: 'Space deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};
