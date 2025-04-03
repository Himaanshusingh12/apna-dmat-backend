const express = require('express');
const upload = require('../config/multer');
const { addSlider, getSlider, toggleslider, deleteslider, getActiveSlider } = require('../controllers/sliderController');

const router = express.Router();

router.post('/add', upload.fields([{ name: "image" }, { name: "image2" }]), addSlider);

router.get('/get', getSlider);

router.get('/get-active', getActiveSlider);

router.put('/status/:id', toggleslider);

router.delete('/delete/:id', deleteslider);

module.exports = router;