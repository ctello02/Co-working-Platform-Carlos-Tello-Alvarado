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
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user && user.comparePassword(req.body.password)) {
            const token = jwt.sign(user.toJSON(), process.env.SECRET, { expiresIn: '1w' });
            res.json({ token, user });
        } else {
            res.status(401).json({ message: 'Authentication failed' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
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

exports.updatePassword = async (req, res) => {
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