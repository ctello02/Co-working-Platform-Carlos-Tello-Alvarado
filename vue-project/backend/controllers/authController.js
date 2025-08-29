const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { sendResetPasswordEmail } = require('../services/emailService');

exports.signup = async (req, res) => {
  try {
    let newUser = new User(req.body);

    await newUser.save();
    const token = jwt.sign({ _id: newUser._id }, process.env.SECRET, {
      expiresIn: '1w',
    });

    res.status(201).json({ token, user: newUser });
  } catch (error) {
    // Verificar si el error es de clave duplicada
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      // Código 409: "Conflict"
      return res.status(409).json({ message: 'El correo ya está en uso' });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  const { email = '', password = '' } = req.body || {};
  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    email.length > 254 ||
    password.length > 72
  ) {
    return res
      .status(400)
      .json({ message: 'Formato de credenciales inválido.' });
  }

  try {
    // Busca al usuario por email
    const user = await User.findOne({ email: email });

    // Verifica si el usuario existe
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' }); // Error específico para usuario no encontrado
    }

    // Verifica si la contraseña es correcta
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' }); // Error específico para contraseña incorrecta
    }

    // Si ambos son correctos, genera el token
    const token = jwt.sign(user.toJSON(), process.env.SECRET, {
      expiresIn: '1w',
    });
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message }); // Error general del servidor
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.decoded._id })
      .select('-password')
      .populate();
    if (user) {
      res.status(200).json({ user });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.validateToken = async (req, res) => {
  res.json({
    success: true,
    valid: true,
  });
};

exports.forgotPassword = async (req, res) => {
  try {
    if (!process.env.GOOGLE_APP_EMAIL || !process.env.GOOGLE_APP_PW) {
      return res.status(400).json({
        error: 'No hay configuración de Google Apps para enviar emails',
      });
    }

    const user = await User.findOne({ email: req.body.email });

    if (user) {
      const token = jwt.sign(
        { _id: user._id },
        process.env.RESET_PASSWORD_KEY,
        { expiresIn: '15m' }
      );
      console.log(token);

      await sendResetPasswordEmail(req.body.email, token);
      await user.updateOne({ resetLink: token });
      res.status(200).json({ message: 'Email enviado a ' + req.body.email });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
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
      res.status(200).json({ message: 'Contraseña actualizada' });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Token expirado' });
    } else if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ message: 'Token no válido' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

exports.changePassword = async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.params.id });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const { oldPassword, newPassword } = req.body;

    const isOldPasswordValid = await user.comparePassword(oldPassword);
    if (!isOldPasswordValid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' }); // Error específico para contraseña incorrecta
    } else {
      user.password = newPassword;
      await user.save();
      res.status(200).json({ message: 'Contraseña actualizada' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
