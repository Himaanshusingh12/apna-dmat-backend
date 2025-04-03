const express = require('express');
const { addPrivacypolicy, getPrivacypolicy, searchPrivacypolicy, togglePrivacypolicy, deletePrivacypolicy, editPrivacypolicy, getActiveprivacy } = require('../controllers/privacypolicyController');


const router = express.Router();

router.post('/add', addPrivacypolicy);

router.get('/get', getPrivacypolicy);

router.get('/search', searchPrivacypolicy);

router.put('/status/:id', togglePrivacypolicy);

router.delete('/delete/:id', deletePrivacypolicy);

router.put('/edit/:id', editPrivacypolicy);

router.get('/get-active', getActiveprivacy);

module.exports = router;