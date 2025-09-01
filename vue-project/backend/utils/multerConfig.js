const multer = require('multer');
const path = require('path');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // Límite de 2 MB
  fileFilter: (req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(
      file.mimetype
    );
    if (ok) return cb(null, true);
    return cb(new Error('Tipo de archivo no soportado'));
  },
});

module.exports = upload;
