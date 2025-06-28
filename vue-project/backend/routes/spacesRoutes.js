const express = require('express');
const {
  getSpaces,
  createSpace,
  updateSpace,
  deleteSpace,
  bulkDeleteSpace,
} = require('../controllers/spacesController');
const verifyToken = require('../middleware/verify_tokens');
const upload = require('../utils/multerConfig');
const router = express.Router();

router.get('/getSpaces', getSpaces);
router.post('/createSpace', verifyToken, upload.single('image'), createSpace);
router.put('/updateSpace', verifyToken, upload.single('image'), updateSpace);
router.delete('/deleteSpace/:id', verifyToken, deleteSpace);
router.delete('/bulkDeleteSpace/:id', verifyToken, bulkDeleteSpace);

module.exports = router;
