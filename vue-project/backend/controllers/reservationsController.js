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
    try {
        const { title, description, start, end } = req.body;
        const calendarId = 'espacios';

        const newReservation = new Reservation({
            title,
            description,
            start,
            end,
            calendarId
        });

        const savedReservation = await newReservation.save();
        res.status(201).json(savedReservation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};