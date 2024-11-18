const express = require('express');
const { signup, login, getUser, forgotPassword, updatePassword, changePassword } = require('../controllers/authController');
const verifyToken = require('../middleware/verify_tokens');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/user', verifyToken, getUser);
router.post('/forgotPassword', forgotPassword);
router.post('/updatePassword', updatePassword);
router.post('/changePassword/:id', verifyToken, changePassword);

module.exports = router;