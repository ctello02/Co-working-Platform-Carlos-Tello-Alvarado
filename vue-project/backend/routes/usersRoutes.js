const express = require('express');
const {
  getUsers,
  updateUser,
  deleteUser,
  bulkDeleteUser,
} = require('../controllers/usersController');
const verifyToken = require('../middleware/verify_tokens');
const router = express.Router();

router.get('/getUsers', verifyToken, getUsers);
router.put('/updateUser', verifyToken, updateUser);
router.delete('/deleteUser/:id', verifyToken, deleteUser);
router.delete('/bulkDeleteUser/:id', verifyToken, bulkDeleteUser);

module.exports = router;
