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
    time: {
        type: Number,
    },
    repetition: {
        type: Boolean,
        default: false,
    },
    opening: {
        type: String,
    },
    closing: {
        type: String,
    },
});

const Space = mongoose.model("Space", SpaceSchema);
module.exports = Space;
