const User = require("../models/user");

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }
        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        let user = await User.findOne({ _id: req.body._id });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = req.body.name;
        user.email = req.body.email;
        user.phone = req.body.phone;
        user.address = req.body.address;
        user.isCompany = req.body.isCompany;
        user.cif = req.body.cif;
        user.isAdmin = req.body.isAdmin;

        await user.save();
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        let user = await User.findOne({ _id: req.params.id });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.remove();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};