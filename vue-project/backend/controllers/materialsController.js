const Material = require('../models/material');
const fs = require('fs'); // Módulo para interactuar con el sistema de archivos
const path = require('path');

exports.getMaterials = async (req, res) => {
  try {
    const materials = await Material.find();
    if (materials.length === 0) {
      return res.status(404).json({ message: 'No materials found' });
    }
    res.json({ materials });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createMaterial = async (req, res) => {
  try {
    if (req.file) {
      req.body.image = `${req.protocol}://${req.get('host')}/uploads/${
        req.file.filename
      }`;
    }

    const newMaterial = new Material(req.body);

    const savedMaterial = await newMaterial.save();
    res.status(201).json(savedMaterial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMaterial = async (req, res) => {
  try {
    const material = await Material.findOne({ _id: req.body.id });
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Si se subió una nueva imagen, eliminamos la anterior
    if (req.file) {
      const imagePath = path.join(
        __dirname,
        '..',
        'uploads',
        path.basename(material.image)
      );

      // Eliminar la imagen anterior del sistema de archivos
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error al eliminar la imagen:', err);
        } else {
          console.log('Imagen eliminada correctamente:', imagePath);
        }
      });

      // Actualizar la URL de la imagen con la nueva
      req.body.image = `${req.protocol}://${req.get('host')}/uploads/${
        req.file.filename
      }`;
    }

    material.set(req.body);

    const savedMaterial = await material.save();
    res.status(200).json(savedMaterial);
  } catch (error) {
    console.error('Error al actualizar el material:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findOne({ _id: req.params.id });
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Obtener la ruta completa de la imagen del servidor
    const imagePath = path.join(
      __dirname,
      '..',
      'uploads',
      path.basename(material.image)
    );

    // Eliminar la imagen del sistema de archivos
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error('Error al eliminar la imagen:', err);
      } else {
        console.log('Imagen eliminada correctamente:', imagePath);
      }
    });

    // Eliminar el material de la base de datos
    await Material.deleteOne({ _id: req.params.id });

    // Enviar respuesta de éxito
    res.json({ message: 'Material y su imagen eliminados correctamente' });
  } catch (error) {
    console.error('Error al eliminar el material:', error);
    res.status(500).json({ message: error.message });
  }
};
