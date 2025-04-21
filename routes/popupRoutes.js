const express = require('express');
const { addpopupdetails, getallpopupdetails, deletepopupdetail, searchdetails, getUserCount } = require('../controllers/popupController');

const router = express.Router();


router.post('/add', addpopupdetails);

router.get('/get', getallpopupdetails);

router.delete('/delete/:id', deletepopupdetail);

router.get('/search', searchdetails);

router.get('/user-count', getUserCount);
module.exports = router;

