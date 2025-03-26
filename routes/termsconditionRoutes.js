const express = require('express');
const { addTermscondition, getTermscondition, searchTermscondition, deleteTermscondition, toggleTermcondition, editTermcondition } = require('../controllers/termsconditionController');


const router = express.Router();

router.post('/add', addTermscondition);

router.get('/get', getTermscondition);

router.get('/search', searchTermscondition);

router.delete('/delete/:id', deleteTermscondition);

router.put('/status/:id', toggleTermcondition);

router.put('/edit/:id', editTermcondition);

module.exports = router;