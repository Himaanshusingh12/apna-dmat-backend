const express = require('express');
const { addUser, getAllUsers, deleteUser, searchUsers, getUserCount } = require('../controllers/userController');

const router = express.Router();


router.post('/add-user', addUser);

router.get('/get-users', getAllUsers);

router.delete('/delete-user/:id', deleteUser);

router.get('/search-users', searchUsers);

router.get('/user-count', getUserCount);

module.exports = router;

