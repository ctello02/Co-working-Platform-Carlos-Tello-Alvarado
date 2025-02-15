const express = require('express');
const { createReservation, getReservations, getUserReservations, getReservationsByDate } = require('../controllers/reservationsController');
const verifyToken = require('../middleware/verify_tokens');
const upload = require('../utils/multerConfig');
const router = express.Router();

router.post('/createReservation', verifyToken, upload.none(), createReservation);
router.get('/getReservations', verifyToken, getReservations);
router.get('/getUserReservations/:id', verifyToken, getUserReservations);
router.get('/getReservationsByDate/:date', verifyToken, getReservationsByDate);
// router.put('/updateReservation', verifyToken, updateReservation);
// router.delete('/deleteReservation/:id', verifyToken, deleteReservation);


module.exports = router;