const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, trim: true, unique: true, required: true },
    password: { type: String, required: true },
    phone: { type: String, default: null },
    address: { type: String, default: null },
    resetLink: { type: String, default: '' },
    isAdmin: { type: Boolean, default: false },
    isCompany: { type: Boolean, default: false },
    cif: { type: String, default: null }
});

// Hash a la contraseña antes de guardarla en la base de datos
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

UserSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
