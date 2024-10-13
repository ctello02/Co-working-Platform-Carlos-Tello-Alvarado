const router = require("express").Router();
const User = require("../models/user");
const verifyToken = require("../middleware/verify_tokens");

router.get("/users/getUsers", verifyToken, async (req, res) => {
    try {
        // Una vez verificado el token, busca todos los usuarios
        let users = await User.find().select('-password'); // Excluye las contraseñas

        // Verifica si hay usuarios en la base de datos
        if (users.length > 0) {
            res.json({
                success: true,
                users: users // Todos los usuarios
            });
        } else {
            res.status(404).json({
                success: false,
                message: "No users found"
            });
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

router.put("/users/updateUser", verifyToken, async (req, res) => {
    try {
        let user = await User.findOne({ _id: req.body._id });
        if (user) {
            user.name = req.body.name;
            user.email = req.body.email;
            user.phone = req.body.phone;
            user.address = req.body.address;
            user.isCompany = req.body.isCompany;
            user.cif = req.body.cif;
            user.isAdmin = req.body.isAdmin;
            await user.save();
            res.json({
                success: true,
                message: "User updated successfully"
            });
        } else {
            res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

module.exports = router;