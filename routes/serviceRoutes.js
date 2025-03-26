const express = require('express');


const { addService, getService, toggleService, getActiveService, searchService, deleteService, editService } = require('../controllers/serviceController');

const router = express.Router();

router.post('/add-service', addService);

router.get('/get-service', getService);

router.get('/get-active-service', getActiveService);

router.put('/service-status/:id', toggleService);

router.get('/search-service', searchService);

router.delete('/delete-service/:id', deleteService);

router.put('/edit/:id', editService);

module.exports = router;