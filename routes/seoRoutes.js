const express = require('express');
const { addSeo, getAllSeodetail, searchSeoDetail, editSeoDetail, getActiveseoDetail } = require('../controllers/seoController');

const router = express.Router();

router.post('/add', addSeo);

router.get('/get', getAllSeodetail);

router.get('/search', searchSeoDetail);

router.put('/edit/:id', editSeoDetail);

router.get('/get-active', getActiveseoDetail);

module.exports = router;
