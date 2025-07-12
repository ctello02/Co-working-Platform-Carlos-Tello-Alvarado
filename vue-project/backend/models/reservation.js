const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReservationSchema = new Schema({
  spaceId: {
    type: Schema.Types.ObjectId,
    ref: 'Space',
    required: false,
    nullable: true,
  },
  materialId: {
    type: Schema.Types.ObjectId,
    ref: 'Material',
    required: false,
    nullable: true,
  },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true }, // Ejemplo: 2022-01-01T10:00:00.000Z
  endTime: { type: Date, required: true }, // Ejemplo: 2022-01-01T11:00:00.000Z
  seatsReserved: { type: Number, required: false, min: 1, nullable: true },
  periodicReservationId: {
    type: Schema.Types.ObjectId,
    ref: 'PeriodicReservation',
    required: false,
    default: null,
  },
  isPaid: { type: Boolean, default: false },
  paypalOrderId: { type: String, default: null },
  paypalCaptureId: { type: String, default: null },
  paymentStatus: {
    type: String,
    enum: ['CREATED', 'COMPLETED', 'REFUNDED', 'FAILED'],
    default: null,
    nullable: true,
  },
});

const Reservation = mongoose.model('Reservation', ReservationSchema);
module.exports = Reservation;
