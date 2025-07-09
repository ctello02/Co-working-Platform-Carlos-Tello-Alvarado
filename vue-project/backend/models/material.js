const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MaterialSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String, required: true },
  duration: { type: Number, default: 15 }, // 15 minutos
  admitsRepetition: { type: Boolean, default: false },
  opening: { type: Number, required: true }, // Ejemplo: 540 (09:00)
  closing: { type: Number, required: true }, // Ejemplo: 1200 (20:00)
  pricing: { type: Number, default: 0 }, // Ejemplo: 1.3€
});

const Material = mongoose.model('Material', MaterialSchema);
module.exports = Material;
