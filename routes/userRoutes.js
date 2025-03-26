const express = require('express');
const { addUser, getAllUsers, deleteUser, searchUsers } = require('../controllers/userController');

const router = express.Router();


router.post('/add-user', addUser);

router.get('/get-users', getAllUsers);

router.delete('/delete-user/:id', deleteUser);

router.get('/search-users', searchUsers);

module.exports = router;

