const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { sendResetPasswordEmail } = require('../services/emailService');

exports.signup = async (req, res) => {
    try {
        let newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            phone: req.body.phone,
            address: req.body.address,
            isAdmin: false, // Por defecto no es Admin
            isCompany: req.body.isCompany,
            cif: req.body.cif,
        });

        await newUser.save();
        const token = jwt.sign({ _id: newUser._id }, process.env.SECRET, { expiresIn: '1w' });

        res.status(201).json({ token, user: newUser });
    } catch (error) {
        // Verificar si el error es de clave duplicada
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            // Código 409: "Conflict" 
            return res.status(409).json({ message: "El correo ya está en uso" });
        }
        res.status(500).json({ message: error.message });
    }
};


exports.login = async (req, res) => {
    try {
        // Busca al usuario por email
        const user = await User.findOne({ email: req.body.email });

        // Verifica si el usuario existe
        if (!user) {
            return res.status(404).json({ message: 'User not found' }); // Error específico para usuario no encontrado
        }

        // Verifica si la contraseña es correcta
        const isPasswordValid = await user.comparePassword(req.body.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Incorrect password' }); // Error específico para contraseña incorrecta
        }

        // Si ambos son correctos, genera el token
        const token = jwt.sign(user.toJSON(), process.env.SECRET, { expiresIn: '1w' });
        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ message: error.message }); // Error general del servidor
    }
};

exports.getUser = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.decoded._id }).select('-password').populate();
        if (user) {
            res.json({ user });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    if (process.env.GOOGLE_APP_EMAIL && process.env.GOOGLE_APP_PW) {
        try {
            const user = await User.findOne({ email: req.body.email });
            if (user) {
                const token = jwt.sign({ _id: user._id }, process.env.RESET_PASSWORD_KEY, { expiresIn: '15m' });
                await sendResetPasswordEmail(req.body.email, token);
                await user.updateOne({ resetLink: token });
                res.json({ message: 'Email sent to ' + req.body.email });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    } else {
        return res.status(400).json({
            error: "You have not set up an account to send an email or a reset password key for jwt"
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        const decodedData = jwt.verify(token, process.env.RESET_PASSWORD_KEY);
        const user = await User.findOne({ resetLink: token });
        if (user) {
            user.password = password;
            await user.save();
            res.json({ message: 'Password updated' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            res.status(401).json({ message: 'Invalid token' });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

exports.changePassword = async (req, res) => {
    try {
        let user = await User.findOne({ _id: req.params.id });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const { oldPassword, newPassword } = req.body;

        const isOldPasswordValid = await user.comparePassword(oldPassword);
        if (!isOldPasswordValid) {
            return res.status(401).json({ message: 'Incorrect password' }); // Error específico para contraseña incorrecta
        } else {
            user.password = newPassword;
            await user.save();
            res.json({ message: 'Password updated' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};