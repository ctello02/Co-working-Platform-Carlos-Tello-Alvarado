const express = require('express');
const { getUsers, updateUser, deleteUser } = require('../controllers/userController');
const verifyToken = require('../middleware/verify_tokens');
const router = express.Router();

router.get('/getUsers', verifyToken, getUsers);
router.put('/updateUser', verifyToken, updateUser);
router.delete('/deleteUser/:id', verifyToken, deleteUser);

module.exports = router;