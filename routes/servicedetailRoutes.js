const express = require('express');
const { addServiceDetails, getserviceDetail, toggleserviceDetail, searchservicedetail, getsubservicedetailbySubservice, deleteserviceDetail, updateserviceDetail } = require('../controllers/servicedetailController');
const upload = require('../config/multer');

const router = express.Router();

router.post('/add', upload.single("image"), addServiceDetails);

router.get('/get', getserviceDetail);

router.put('/status/:id', toggleserviceDetail);

router.get('/search', searchservicedetail);

router.get('/subservice-detail/:subservice_slug', getsubservicedetailbySubservice);

router.delete('/delete/:id', deleteserviceDetail);

router.put('/edit/:id', upload.single("image"), updateserviceDetail);

module.exports = router;