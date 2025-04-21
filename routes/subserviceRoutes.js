const express = require('express');
const { addsubService, getsubService, togglesubService, searchsubService, getActivesubService, deletesubService, editsubService, getSubservicesBySlug, getserviceSeoBySlug } = require('../controllers/subserviceController');


const router = express.Router();

router.post('/add-subservice', addsubService);

router.get('/get-subservice', getsubService);

router.get('/get-activesubservice', getActivesubService)

router.put('/subservice-status/:id', togglesubService);

router.get('/search-subservice', searchsubService);

router.delete('/delete-subservice/:id', deletesubService);

router.put('/edit-subservice/:id', editsubService);

router.get('/subservices/:slug', getSubservicesBySlug);

router.get('/seo/:slug', getserviceSeoBySlug);


module.exports = router;
