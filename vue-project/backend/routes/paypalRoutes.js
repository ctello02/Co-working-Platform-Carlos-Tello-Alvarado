const express = require('express');
const {
  getCaptureId,
  createOrder,
  captureOrder,
  refundPayment,
} = require('../controllers/paypalController');
const verifyToken = require('../middleware/verify_tokens');
const router = express.Router();

router.post('/createOrder', verifyToken, createOrder);
router.post('/captureOrder', verifyToken, captureOrder);
router.get('/getCaptureId/:reservationId', verifyToken, getCaptureId);
router.post('/refundPayment', verifyToken, refundPayment);

module.exports = router;
