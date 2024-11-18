const express = require('express');
const { getReservations, createReservation } = require('../controllers/reservationsController');
const verifyToken = require('../middleware/verify_tokens');
const upload = require('../utils/multerConfig');
const router = express.Router();

router.get('/getReservations', getReservations);
router.post('/createReservation', verifyToken, upload.none(), createReservation);
// router.put('/updateReservation', verifyToken, updateReservation);
// router.delete('/deleteReservation/:id', verifyToken, deleteReservation);


module.exports = router;