const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PeriodicReservationSchema = new Schema({
  spaceId: {
    type: Schema.Types.ObjectId,
    ref: 'Space',
    required: false,
    default: null,
    nullable: true,
  },
  materialId: {
    type: Schema.Types.ObjectId,
    ref: 'Material',
    required: false,
    default: null,
    nullable: true,
  },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true }, // Ejemplo: 2022-01-01T10:00:00.000Z
  endTime: { type: Date, required: true }, // Ejemplo: 2022-01-01T11:00:00.000Z
  seatsReserved: { type: Number, required: false, min: 1 },
  periodicity: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true,
  },
  lastOccurrenceGenerated: { type: Date, required: true }, // Ejemplo: 2022-12-15T11:00:00.000Z
});

const PeriodicReservation = mongoose.model(
  'PeriodicReservation',
  PeriodicReservationSchema
);
module.exports = PeriodicReservation;
