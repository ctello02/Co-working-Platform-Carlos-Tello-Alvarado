const express = require('express');
const {
  signup,
  login,
  getUser,
  forgotPassword,
  resetPassword,
  changePassword,
  validateToken,
} = require('../controllers/authController');
const verifyToken = require('../middleware/verify_tokens');
const router = express.Router();
const rateLimit = require('express-rate-limit');

// const blockIfDisabled = (req, res, next) => {
//   if (process.env.ALLOW_REGISTRATION !== 'true') {
//     return res.status(403).json({ message: 'Registro deshabilitado' });
//   }
//   next();
// };

// const loginLimiter = rateLimit({
//   windowMs: 10 * 60 * 1000, // 10 min
//   max: 10, // 10 intentos por IP
//   standardHeaders: 'draft-7',
//   legacyHeaders: false,
//   message: { message: 'Demasiados intentos. Prueba más tarde.' },
// });

router.post('/signUp', signup);
router.post('/login', login);
router.get('/user', verifyToken, getUser);
router.get('/validate', verifyToken, validateToken);
router.post('/forgotPassword', forgotPassword);
router.post('/resetPassword', resetPassword);
router.post('/changePassword/:id', verifyToken, changePassword);

module.exports = router;
