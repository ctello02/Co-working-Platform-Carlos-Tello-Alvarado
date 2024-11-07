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
        default: 30,
    },
});

const Space = mongoose.model("Space", SpaceSchema);
module.exports = Space;
