const express = require('express');
const { getSpaces, createSpace } = require('../controllers/spacesController');
const verifyToken = require('../middleware/verify_tokens');
const upload = require('../utils/multerConfig');
const router = express.Router();

router.get('/getSpaces', getSpaces);
router.post('/createSpace', verifyToken, upload.single('image'), createSpace);

module.exports = router;