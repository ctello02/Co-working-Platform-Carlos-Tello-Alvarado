const Reservation = require("../models/reservation");

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

exports.createReservation = async (req, res) => {
    console.log(req.body); // Esto debe mostrar los datos enviados desde el frontend
    try {
        const {
            space,
            date,
            startTime,
            endTime,
            seatsReserved,
            repetition,
        } = req.body;

        if (!space || !date || !startTime || !endTime || !seatsReserved) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' + req.body.space + req.body.date + req.body.startTime + req.body.endTime + req.body.seatsReserved });
        }

        const calendarId = 'espacios';

        const newReservation = new Reservation({
            space,
            date,
            startTime,
            endTime,
            seatsReserved,
            repetition,
            calendarId,
        });

        const savedReservation = await newReservation.save();
        res.status(201).json(savedReservation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};