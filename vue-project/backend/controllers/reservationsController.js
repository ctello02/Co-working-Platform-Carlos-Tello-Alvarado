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
        if (!reservations || reservations.length === 0) {
            return res.status(404).json({ message: 'No reservations found' });
        }
        res.json({ reservations });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserReservations = async (req, res) => {
    try {
        let reservations = await Reservation.find({ userId: req.params.id })
        .populate('spaceId')
        .sort({ startTime: 1 });

        if (!reservations || reservations.length === 0) {
            return res.status(404).json({ message: 'No reservations found' });
        }

        res.json({ reservations });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getReservationsByDate = async (req, res) => {
    try {
        const date = req.params.date; // Recibir la fecha como parámetro en formato YYYY-MM-DD

        if (!date) {
            return res.status(400).json({ message: "Date is required" });
        }

        // Crear los límites del día seleccionado
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // Buscar reservas que ocurren dentro de la fecha seleccionada
        const reservations = await Reservation.find({
            startTime: { $lt: endOfDay },  
            endTime: { $gt: startOfDay }   
        }).sort({ spaceId: 1, startTime: 1 });

        res.json({ reservations });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
