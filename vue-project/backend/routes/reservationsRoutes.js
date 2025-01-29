const express = require('express');
const { getReservations, createReservation } = require('../controllers/reservationsController');
const verifyToken = require('../middleware/verify_tokens');
//const upload = require('../utils/multerConfig');
const router = express.Router();

router.post('/createReservation', verifyToken, createReservation);
router.get('/getReservations', getReservations);
// router.put('/updateReservation', verifyToken, updateReservation);
// router.delete('/deleteReservation/:id', verifyToken, deleteReservation);


module.exports = router;