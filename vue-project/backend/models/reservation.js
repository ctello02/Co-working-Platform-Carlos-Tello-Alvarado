const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReservationSchema = new Schema({
    space: {
        type: Schema.Types.ObjectId,
        ref: 'Space', // Referencia al Schema del Espacio
        required: true
    },
    date: {
        type: String,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    seatsReserved: {
        type: Number,
        required: true,
        min: 1
    },
    repetition: {
        type: String,
        enum: ['none', 'daily', 'weekly', 'monthly', 'weekdays'],
        default: 'none'
    },
    calendarId: {
        type: String,
        required: true
    }
});

const Reservation = mongoose.model("Reservation", ReservationSchema);
module.exports = Reservation;