const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SpaceSchema = new Schema({
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    imageUrl: {
        type: String,
    },
    seats: {
        type: Number,
        default: 0,
    },
    duration: {             // Tiempo que duran las reservas
        type: Number,
    },
    repetition: {       // Si permite repetición de reservas cada cierto tiempo (p.ej. cada día, cada semana, etc.)
        type: Boolean,
        default: false,
    },
    opening: {          // Hora de apertura
        type: String,
    },
    closing: {          // Hora de cierre
        type: String,
    },
});

const Space = mongoose.model("Space", SpaceSchema);
module.exports = Space;
