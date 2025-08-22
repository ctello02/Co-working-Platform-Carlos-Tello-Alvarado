const Material = require('../models/material');
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

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
const MATERIALS_DIR = path.join(UPLOAD_DIR, 'materials');
require('fs').mkdirSync(MATERIALS_DIR, { recursive: true });

function safeBaseName(str) {
  return slugify(str || 'img', { lower: true, strict: true }).slice(0, 50);
}
function assertInside(baseDir, abs) {
  if (!abs.startsWith(baseDir + path.sep)) throw new Error('Ruta inválida');
}

exports.getMaterials = async (req, res) => {
  try {
    const materials = await Material.find();
    if (materials.length === 0) {
      return res.status(404).json({ message: 'No materials found' });
    }
    res.status(200).json({ materials });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createMaterial = async (req, res) => {
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

    const base = safeBaseName(req.body.name);
    const filename = `${base}-${Date.now()}.webp`;
    const abs = path.resolve(MATERIALS_DIR, filename);
    assertInside(MATERIALS_DIR, abs);

    await sharp(req.file.buffer)
      .rotate()
      .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(abs);

    const payload = { ...req.body, image: `/uploads/materials/${filename}` };
    const saved = await new Material(payload).save();
    return res.status(201).json(saved);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.updateMaterial = async (req, res) => {
  try {
    const doc = await Material.findOne({ _id: req.body.id });
    if (!doc) return res.status(404).json({ message: 'Material not found' });

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

      const base = safeBaseName(req.body.name || doc.name);
      const filename = `${base}-${Date.now()}.webp`;
      const abs = path.resolve(MATERIALS_DIR, filename);
      assertInside(MATERIALS_DIR, abs);

      await sharp(req.file.buffer)
        .rotate()
        .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(abs);

      newImageRel = `materials/${filename}`;

      if (doc.image) {
        try {
          const prevName = path.basename(
            new URL('http://x' + doc.image).pathname
          );
          const prevAbs = path.resolve(MATERIALS_DIR, prevName);
          assertInside(MATERIALS_DIR, prevAbs);
          prevAbsToDelete = prevAbs;
        } catch {}
      }
    }

    const updates = { ...req.body };
    if (newImageRel) updates.image = `/uploads/${newImageRel}`;

    doc.set(updates);
    const saved = await doc.save();

    if (prevAbsToDelete) {
      try {
        await fs.unlink(prevAbsToDelete);
      } catch {}
    }

    return res.status(200).json(saved);
  } catch (error) {
    console.error('Error al actualizar el material:', error);
    return res.status(500).json({ message: error.message });
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
    const prev = path.basename(new URL('http://x' + material.image).pathname);
    const abs = path.resolve(MATERIALS_DIR, prev);
    if (!abs.startsWith(MATERIALS_DIR + path.sep)) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Ruta inválida' });
    }
    await fs.unlink(abs).catch(() => {});

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
  let arePaid = false;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const materialId = req.params.id;
    const material = await Material.findById(materialId).session(session);
    if (!material) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Material no encontrado' });
    }

    const reservations = await Reservation.find({ materialId }).session(
      session
    );

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

    await Reservation.deleteMany({ materialId }).session(session);

    await PeriodicReservation.deleteMany({ materialId }).session(session);

    const prev = path.basename(new URL('http://x' + material.image).pathname);
    const abs = path.resolve(MATERIALS_DIR, prev);
    if (abs.startsWith(MATERIALS_DIR + path.sep))
      await fs.unlink(abs).catch(() => {});

    await Material.deleteOne({ _id: materialId }).session(session);

    await session.commitTransaction();
    res.status(200).json({
      message:
        'El material y sus reservas se han borrado correctamente. \nSe han reembolsado los pagos de las reservas.',
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};
