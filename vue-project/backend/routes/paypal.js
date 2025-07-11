const express = require('express');
const {
  createOrder,
  captureOrder,
} = require('../controllers/paypalController');
const verifyToken = require('../middleware/verify_tokens');
const router = express.Router();

router.post('/createOrder', verifyToken, createOrder);
router.post('/captureOrder', verifyToken, captureOrder);

module.exports = router;
