const Space = require("../models/space");

exports.getSpaces = async (req, res) => {
    try {
        const spaces = await Space.find();
        if (spaces.length === 0) {
            return res.status(404).json({ message: 'No spaces found' });
        }
        res.json({ spaces });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createSpace = async (req, res) => {
    try {
        const { name, description } = req.body;
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;  // Generar la URL de la imagen

        const newSpace = new Space({
            name,
            description,
            imageUrl  // Almacena la URL de la imagen en la base de datos
        });

        const savedSpace = await newSpace.save();
        res.status(201).json(savedSpace);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
