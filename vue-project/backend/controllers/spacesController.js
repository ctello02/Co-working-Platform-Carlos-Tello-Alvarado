const Space = require('../models/space');
const Reservation = require('../models/reservation');
const PeriodicReservation = require('../models/periodicReservation');

const path = require('path');
const fs = require('fs/promises');
const FileType = require('file-type');
const sharp = require('sharp');
const slugify = require('slugify');

const checkout = require('@paypal/checkout-server-sdk');
const { client } = require('../utils/paypalClient');
const mongoose = require('mongoose');
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads'); // carpeta dedicada
const SPACES_DIR = path.join(UPLOAD_DIR, 'spaces'); // subcarpeta
require('fs').mkdirSync(SPACES_DIR, { recursive: true });

// nombre seguro
function safeBaseName(str) {
  return slugify(str || 'img', { lower: true, strict: true }).slice(0, 50);
}
// comprueba que la ruta final cae dentro del directorio permitido
function assertInside(baseDir, candidateAbsPath) {
  if (!candidateAbsPath.startsWith(baseDir + path.sep)) {
    throw new Error('Ruta inválida');
  }
}

exports.getSpaces = async (req, res) => {
  try {
    const spaces = await Space.find();
    if (spaces.length === 0) {
      return res.status(404).json({ message: 'No spaces found' });
    }
    res.status(200).json({ spaces });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSpace = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: 'La imagen es obligatoria' });

    const probe = await FileType.fromBuffer(req.file.buffer);
    if (
      !probe ||
      !['image/jpeg', 'image/png', 'image/webp'].includes(probe.mime)
    ) {
      return res.status(400).json({ message: 'Archivo de imagen no válido' });
    }

    // nombre y ruta segura
    const base = safeBaseName(req.body.name);
    const filename = `${base}-${Date.now()}.webp`;
    const abs = path.resolve(SPACES_DIR, filename);
    assertInside(SPACES_DIR, abs);

    // reencodear/limpiar y guardar
    await sharp(req.file.buffer)
      .rotate()
      .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(abs);

    const payload = { ...req.body, image: `/uploads/spaces/${filename}` };
    const saved = await new Space(payload).save();
    return res.status(201).json(saved);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.updateSpace = async (req, res) => {
  try {
    const updatedSpace = await Space.findOne({ _id: req.body.id });
    if (!updatedSpace)
      return res.status(404).json({ message: 'Space not found' });

    let newImageRel = null;
    let prevAbsToDelete = null;

    if (req.file) {
      const probe = await FileType.fromBuffer(req.file.buffer);
      if (
        !probe ||
        !['image/jpeg', 'image/png', 'image/webp'].includes(probe.mime)
      ) {
        return res.status(400).json({ message: 'Archivo de imagen no válido' });
      }

      const base = safeBaseName(req.body.name || updatedSpace.name);
      const filename = `${base}-${Date.now()}.webp`;
      const abs = path.resolve(SPACES_DIR, filename);
      assertInside(SPACES_DIR, abs);

      await sharp(req.file.buffer)
        .rotate()
        .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(abs);

      newImageRel = `spaces/${filename}`;

      // Preparar borrado de la imagen anterior
      if (updatedSpace.image) {
        try {
          const prevName = path.basename(
            new URL('http://x' + updatedSpace.image).pathname
          );
          const prevAbs = path.resolve(SPACES_DIR, prevName);
          assertInside(SPACES_DIR, prevAbs);
          prevAbsToDelete = prevAbs;
        } catch {}
      }
    }

    const updates = { ...req.body };
    if (newImageRel) updates.image = `/uploads/${newImageRel}`; // ruta relativa

    updatedSpace.set(updates);
    const saved = await updatedSpace.save();

    // Borramos la imagen antigua solo si hay nueva y el save fue exitoso
    if (prevAbsToDelete) {
      try {
        await fs.unlink(prevAbsToDelete);
      } catch {}
    }

    return res.status(200).json(saved);
  } catch (error) {
    console.error('Error al actualizar el espacio:', error);
    return res.status(500).json({ message: error.message });
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

    const prev = path.basename(new URL('http://x' + space.image).pathname);
    const abs = path.resolve(SPACES_DIR, prev);
    if (!abs.startsWith(SPACES_DIR + path.sep))
      return res.status(400).json({ message: 'Ruta inválida' });
    await fs.unlink(abs).catch(() => {});

    await Space.deleteOne({ _id: req.params.id }).session(session);
    await session.commitTransaction();
    res.status(200).json({ message: 'Space deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

exports.bulkDeleteSpace = async (req, res) => {
  let arePaid = false;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const spaceId = req.params.id;
    const space = await Space.findById(spaceId).session(session);
    if (!space) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Espacio no encontrado' });
    }

    const reservations = await Reservation.find({ spaceId }).session(session);

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

    await Reservation.deleteMany({ spaceId }).session(session);

    await PeriodicReservation.deleteMany({ spaceId }).session(session);

    const prev = path.basename(new URL('http://x' + space.image).pathname);
    const abs = path.resolve(SPACES_DIR, prev);
    if (abs.startsWith(SPACES_DIR + path.sep))
      await fs.unlink(abs).catch(() => {});

    await Space.deleteOne({ _id: spaceId }).session(session);

    await session.commitTransaction();
    res.status(200).json({
      message:
        'El espacio y sus reservas se han borrado correctamente. \nSe han reembolsado los pagos de las reservas.',
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};
