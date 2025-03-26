const express = require('express');

const { addTestimonial, getTestimonial, deleteTestimonial, searchTestimonial, toggleTestimonial } = require('../controllers/testimonialController');

const router = express.Router();

router.post('/add-testimonial', addTestimonial);

router.get('/get-testimonial', getTestimonial);

router.delete('/delete-testimonial/:id', deleteTestimonial);

router.get('/search-testimonial', searchTestimonial);

router.put('/status/:id', toggleTestimonial);


module.exports = router;