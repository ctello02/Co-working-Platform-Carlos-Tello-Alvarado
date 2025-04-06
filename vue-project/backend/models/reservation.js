const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReservationSchema = new Schema({
  spaceId: { type: Schema.Types.ObjectId, ref: 'Space', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true }, // Ejemplo: 2022-01-01T10:00:00.000Z
  endTime: { type: Date, required: true }, // Ejemplo: 2022-01-01T11:00:00.000Z
  seatsReserved: { type: Number, required: true, min: 1 },
  periodicReservationId: {
    type: Schema.Types.ObjectId,
    ref: 'PeriodicReservation',
    required: true,
    default: null,
  },
});

const Reservation = mongoose.model('Reservation', ReservationSchema);
module.exports = Reservation;
