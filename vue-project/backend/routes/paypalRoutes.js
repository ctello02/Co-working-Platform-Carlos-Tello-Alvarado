const express = require('express');
const {
  createOrder,
  captureOrder,
  refundPayment,
} = require('../controllers/paypalController');
const verifyToken = require('../middleware/verify_tokens');
const router = express.Router();

router.post('/createOrder', verifyToken, createOrder);
router.post('/captureOrder', verifyToken, captureOrder);
router.post('/refundPayment', verifyToken, refundPayment);

module.exports = router;
