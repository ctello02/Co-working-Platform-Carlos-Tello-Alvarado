const Reservation = require("../models/reservation");

exports.createReservation = async (req, res) => {
    console.log(req.body); // Esto debe mostrar los datos enviados desde el frontend
    try {
        const {
            spaceId,
            userId,
            startTime,
            endTime,
            seatsReserved,
            repetition,
        } = req.body;

        if (!spaceId || !userId || !startTime || !endTime || !seatsReserved) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }

        //const calendarId = 'espacios';

        const newReservation = new Reservation({
            spaceId,
            userId,
            startTime,
            endTime,
            seatsReserved,
            repetition,
            //calendarId,
        });

        const savedReservation = await newReservation.save();
        res.status(201).json(savedReservation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find();
        if (reservations.length === 0) {
            return res.status(404).json({ message: 'No reservations found' });
        }
        res.json({ reservations });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};