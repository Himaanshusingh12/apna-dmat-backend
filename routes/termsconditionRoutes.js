const express = require('express');
const { addTermscondition, getTermscondition, searchTermscondition, deleteTermscondition, toggleTermcondition, editTermcondition, getActivetermcondition } = require('../controllers/termsconditionController');


const router = express.Router();

router.post('/add', addTermscondition);

router.get('/get', getTermscondition);

router.get('/search', searchTermscondition);

router.delete('/delete/:id', deleteTermscondition);

router.put('/status/:id', toggleTermcondition);

router.put('/edit/:id', editTermcondition);

router.get('/get-active', getActivetermcondition);

module.exports = router;