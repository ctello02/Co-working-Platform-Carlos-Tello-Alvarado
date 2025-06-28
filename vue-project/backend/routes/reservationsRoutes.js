const express = require('express');
const {
  createReservation,
  createPeriodicReservation,
  getPeriodicReservations,
  getUserReservations,
  getTodayReservations,
  getReservationsByDate,
  updateReservation,
  updatePeriodicReservation,
  deleteReservation,
  deletePeriodicReservation,
} = require('../controllers/reservationsController');
const verifyToken = require('../middleware/verify_tokens');
const upload = require('../utils/multerConfig');
const router = express.Router();

router.post(
  '/createReservation',
  verifyToken,
  upload.none(),
  createReservation
);
router.post(
  '/createPeriodicReservation',
  verifyToken,
  upload.none(),
  createPeriodicReservation
);
router.get('/getPeriodicReservations', verifyToken, getPeriodicReservations);
router.get('/getUserReservations/:id', verifyToken, getUserReservations);
router.get('/getTodayReservations', verifyToken, getTodayReservations);
router.get('/getReservationsByDate/:date', verifyToken, getReservationsByDate);
router.put('/updateReservation', verifyToken, updateReservation);
router.put(
  '/updatePeriodicReservation',
  verifyToken,
  updatePeriodicReservation
);
router.delete('/deleteReservation/:id', verifyToken, deleteReservation);
router.delete(
  '/deletePeriodicReservation/:id',
  verifyToken,
  deletePeriodicReservation
);

module.exports = router;
