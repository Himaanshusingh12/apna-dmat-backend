const express = require('express');
const { addsubService, getsubService, togglesubService, searchsubService, getSubservicesByService, getActivesubService, deletesubService, editsubService } = require('../controllers/subserviceController');


const router = express.Router();

router.post('/add-subservice', addsubService);

router.get('/get-subservice', getsubService);

router.get('/get-activesubservice', getActivesubService)

router.put('/subservice-status/:id', togglesubService);

router.get('/search-subservice', searchsubService);

router.get('/subservices/:service_id', getSubservicesByService);

router.delete('/delete-subservice/:id', deletesubService);

router.put('/edit-subservice/:id', editsubService);

module.exports = router;
