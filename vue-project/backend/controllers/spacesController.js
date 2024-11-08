const Space = require("../models/space");
const fs = require('fs');  // Módulo para interactuar con el sistema de archivos
const path = require('path');

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
        const { name, description, time, seats } = req.body;
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;  // Generar la URL de la imagen

        const newSpace = new Space({
            name,
            description,
            time,
            seats,
            imageUrl  // Almacena la URL de la imagen en la base de datos
        });

        const savedSpace = await newSpace.save();
        res.status(201).json(savedSpace);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateSpace = async (req, res) => {
    try {
        const space = await Space.findOne({ _id: req.body.id });
        if (!space) {
            return res.status(404).json({ message: 'Space not found' });
        }

        // Si se subió una nueva imagen, eliminamos la anterior
        if (req.file) {
            const imagePath = path.join(__dirname, '..', 'uploads', path.basename(space.imageUrl));

            // Eliminar la imagen anterior del sistema de archivos
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error('Error al eliminar la imagen:', err);
                } else {
                    console.log('Imagen eliminada correctamente:', imagePath);
                }
            });

            // Actualizar la URL de la imagen con la nueva
            space.imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

        // Actualizar otros campos
        space.name = req.body.name;
        space.description = req.body.description;

        const savedSpace = await space.save();
        res.status(201).json(savedSpace);

    } catch (error) {
        console.error('Error al actualizar el espacio:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.deleteSpace = async (req, res) => {
    try {
        const space = await Space.findOne({ _id: req.params.id });
        if (!space) {
            return res.status(404).json({ message: 'Space not found' });
        }

        // Obtener la ruta completa de la imagen del servidor
        const imagePath = path.join(__dirname, '..', 'uploads', path.basename(space.imageUrl));

        // Eliminar la imagen del sistema de archivos
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error('Error al eliminar la imagen:', err);
            } else {
                console.log('Imagen eliminada correctamente:', imagePath);
            }
        });

        // Eliminar el espacio de la base de datos
        await Space.deleteOne({ _id: req.params.id });

        // Enviar respuesta de éxito
        res.json({ message: 'Espacio y su imagen eliminados correctamente' });

    } catch (error) {
        console.error('Error al eliminar el espacio:', error);
        res.status(500).json({ message: error.message });
    }
};
