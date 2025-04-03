const express = require('express');
const { addpopupdetails, getallpopupdetails, deletepopupdetail, searchdetails } = require('../controllers/popupController');

const router = express.Router();


router.post('/add', addpopupdetails);

router.get('/get', getallpopupdetails);

router.delete('/delete/:id', deletepopupdetail);

router.get('/search', searchdetails);

module.exports = router;

