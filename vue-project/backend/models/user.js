const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        default: null // Por defecto, no tiene teléfono 
    },
    address: {
        type: String,
        default: null // Por defecto, no tiene dirección
    },
    // Token para reestablecer la contraseña
    resetLink: {
        data: { type: String, default: '' }
    },
    isAdmin: {
        type: Boolean,
        default: false // Por defecto, no es administrador
    },
    isCompany: {
        type: Boolean,
        default: false // Por defecto, no es empresa
    },
    cif: {
        type: String,
        default: null // Por defecto, no tiene CIF y no se considera empresa
    }
});


// Hash the password
UserSchema.pre("save", function (next) {
    let user = this;
    if (this.isModified("password") || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }

            bcrypt.hash(user.password, salt, null, function (err, hash) {
                if (err) {
                    return next(err);
                }

                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

UserSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
