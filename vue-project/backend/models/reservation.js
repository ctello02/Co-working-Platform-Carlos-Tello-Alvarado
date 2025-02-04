const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReservationSchema = new Schema({
    spaceId: { type: Schema.Types.ObjectId, ref: 'Space', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    seatsReserved: { type: Number, required: true, min: 1 },
    repetition: { type: String, enum: ['no_repeat', 'daily', 'workdays', 'weekly'], default: 'no_repeat' }
});

const Reservation = mongoose.model("Reservation", ReservationSchema);
module.exports = Reservation;