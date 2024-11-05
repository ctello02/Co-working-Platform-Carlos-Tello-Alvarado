const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReservationSchema = new Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    start: {
        type: String,
    },
    end: {
        type: String,
    },
    calendarId: {
        type: String,
    }
});

const Reservation = mongoose.model("Reservation", ReservationSchema);
module.exports = Reservation;
