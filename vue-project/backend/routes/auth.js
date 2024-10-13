const router = require("express").Router();
const User = require("../models/user");
const verifyToken = require("../middleware/verify_tokens");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

router.post("/auth/signup", async (req, res) => {
    if (!req.body.email || !req.body.password) {
        res.json({
            success: false,
            message: "Please enter your email and password"
        });
    } else {
        try {
            // Create request body
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

            // Generar el token
            let token = jwt.sign(newUser.toJSON(), process.env.SECRET, {
                expiresIn: 604800 // 1 week
            });

            res.json({
                success: true,
                _id: newUser._id,
                token: token,
                isAdmin: newUser.isAdmin, // Devolver también el estado de admin
                message: "Successfully created"
            });
        } catch (err) {
            console.log(err)
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }
});

router.post("/auth/login", async (req, res) => {
    try {
        let foundUser = await User.findOne({
            email: req.body.email
        });
        // If the user is not found
        if (!foundUser) {
            res.status(403).json({
                success: false,
                message: "Authentication failed, User not found"
            });
        } else {
            // Compare password with that in the database
            if (foundUser.comparePassword(req.body.password)) {
                let token = jwt.sign(foundUser.toJSON(), process.env.SECRET, {
                    expiresIn: 604800 // 1 week
                });
                // If password is correct, return token and admin status
                res.json({
                    success: true,
                    _id: foundUser._id,
                    token: token,
                    isAdmin: foundUser.isAdmin, // Devolver si es admin
                });
            } else {
                // Else
                res.status(403).json({
                    success: false,
                    message: "Authentication failed, Wrong password!"
                });
            }
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

router.get("/auth/user", verifyToken, async (req, res) => {
    try {
        let foundUser = await User.findOne({
            _id: req.decoded._id
        }).populate();
        if (foundUser) {
            res.json({
                success: true,
                user: foundUser
            });
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

router.post("/auth/forgotPassword", async (req, res) => {
    if (process.env.GOOGLE_APP_EMAIL && process.env.GOOGLE_APP_PW) {
        const email = req.body.email;
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ error: "User with this email does not exist" });
            }

            const token = jwt.sign(
                { _id: user._id },
                process.env.RESET_PASSWORD_KEY,
                { expiresIn: "15m" }
            );

            let mailTransporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.GOOGLE_APP_EMAIL,
                    pass: process.env.GOOGLE_APP_PW
                }
            });

            const data = {
                to: email,
                subject: "Reset Account Password Link",
                html: `
                    <h3>Please click the link below to reset your password</h3>
                    <p>${process.env.CLIENT_URL}/reset?token=${token}</p>
                `
            };

            await user.updateOne({ resetLink: token });

            mailTransporter.sendMail(data, function (error, body) {
                if (error) {
                    return res.status(400).json({ error: error.message });
                }
                return res.status(200).json({
                    message: "Email has been sent, please follow the instructions. You have 15 minutes to reset your password."
                });
            });

        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    } else {
        return res.status(400).json({
            error: "You have not set up an account to send an email or a reset password key for jwt"
        });
    }
});

router.post("/auth/updatePassword", async (req, res) => {
    const { token, password } = req.body;

    if (token) {
        try {
            const decodedData = jwt.verify(token, process.env.RESET_PASSWORD_KEY);
            const user = await User.findOne({ resetLink: token });
            if (!user) {
                return res.status(400).json({ error: "User with this token does not exist" });
            }

            user.password = password;
            await user.save();

            return res.status(200).json({ message: "Your password has been changed" });

        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return res.status(400).json({ error: "Incorrect token or it is expired" });
            }
            console.log(error);
            return res.status(500).json({ error: "Internal server error" });
        }
    } else {
        return res.status(401).json({ error: "Authentication Error" });
    }
});

module.exports = router;
