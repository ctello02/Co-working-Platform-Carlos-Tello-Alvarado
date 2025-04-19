const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SpaceSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String, required: true },
  seats: { type: Number, default: 0 },
  duration: { type: Number },
  admitsRepetition: { type: Boolean, default: false },
  opening: { type: Number, required: true }, // Ejemplo: 540 (09:00)
  closing: { type: Number, required: true }, // Ejemplo: 1200 (20:00)
});

const Space = mongoose.model('Space', SpaceSchema);
module.exports = Space;
