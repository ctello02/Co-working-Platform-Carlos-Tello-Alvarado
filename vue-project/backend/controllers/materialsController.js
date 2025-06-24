const Material = require('../models/material');
const Reservation = require('../models/reservation');
const PeriodicReservation = require('../models/periodicReservation');
const mongoose = require('mongoose');
const fs = require('fs'); // Módulo para interactuar con el sistema de archivos
const path = require('path');

exports.getMaterials = async (req, res) => {
  try {
    const materials = await Material.find();
    if (materials.length === 0) {
      return res.status(404).json({ message: 'No materials found' });
    }
    res.json({ materials });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createMaterial = async (req, res) => {
  try {
    if (req.file) {
      req.body.image = `${req.protocol}://${req.get('host')}/uploads/${
        req.file.filename
      }`;
    }

    const newMaterial = new Material(req.body);

    const savedMaterial = await newMaterial.save();
    res.status(201).json(savedMaterial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMaterial = async (req, res) => {
  try {
    const material = await Material.findOne({ _id: req.body.id });
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Si se subió una nueva imagen, eliminamos la anterior
    if (req.file) {
      const imagePath = path.join(
        __dirname,
        '..',
        'uploads',
        path.basename(material.image)
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

    material.set(req.body);

    const savedMaterial = await material.save();
    res.status(200).json(savedMaterial);
  } catch (error) {
    console.error('Error al actualizar el material:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMaterial = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let material = await Material.findOne({ _id: req.params.id }).session(
      session
    );
    if (!material) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Material not found' });
    }

    const now = new Date();

    let reservations = await Reservation.find({
      materialId: req.params.id,
      startTime: { $gte: now },
    }).session(session);
    if (reservations.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({ message: 'Material has reservations' });
    }

    let periodicReservations = await PeriodicReservation.find({
      materialId: req.params.id,
    }).session(session);
    if (periodicReservations.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(409)
        .json({ message: 'Material has periodic reservations' });
    }

    // Obtener la ruta completa de la imagen del servidor
    const imagePath = path.join(
      __dirname,
      '..',
      'uploads',
      path.basename(material.image)
    );

    // Eliminar la imagen del sistema de archivos
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error('Error al eliminar la imagen:', err);
      } else {
        console.log('Imagen eliminada correctamente:', imagePath);
      }
    });

    await Material.deleteOne({ _id: req.params.id }).session(session);
    await session.commitTransaction();
    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

exports.bulkDeleteMaterial = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let material = await Material.findOne({ _id: req.params.id }).session(
      session
    );
    if (!material) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Material not found' });
    }

    await Reservation.deleteMany({
      materialId: req.params.id,
    }).session(session);

    await PeriodicReservation.deleteMany({
      materialId: req.params.id,
    }).session(session);

    await Material.deleteOne({ _id: req.params.id }).session(session);

    await session.commitTransaction();
    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};
