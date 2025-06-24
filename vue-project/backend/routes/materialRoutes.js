const express = require('express');
const {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} = require('../controllers/materialsController');
const verifyToken = require('../middleware/verify_tokens');
const upload = require('../utils/multerConfig');
const router = express.Router();

router.get('/getMaterials', getMaterials);
router.post(
  '/createMaterial',
  verifyToken,
  upload.single('image'),
  createMaterial
);
router.put(
  '/updateMaterial',
  verifyToken,
  upload.single('image'),
  updateMaterial
);
router.delete('/deleteMaterial/:id', verifyToken, deleteMaterial);

module.exports = router;
