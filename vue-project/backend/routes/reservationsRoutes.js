const express = require('express');
const { getReservations, createReservation } = require('../controllers/reservationsController');
const verifyToken = require('../middleware/verify_tokens');
const router = express.Router();

router.get('/getReservations', getReservations);
router.post('/createReservation', verifyToken, createReservation);
// router.put('/updateReservation', verifyToken, updateReservation);
// router.delete('/deleteReservation/:id', verifyToken, deleteReservation);


module.exports = router;