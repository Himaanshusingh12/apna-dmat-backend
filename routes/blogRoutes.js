const express = require('express');
const { addBlogcategory, getBlogcategory, searchBlogcategory, toggleBlogcategory, deleteBlogcategory, editBlogcategory, getActiveblogcategory, getBlogsByCategory } = require('../controllers/BlogController');
const upload = require('../config/multer');

const router = express.Router();

router.post('/add', upload.single("image"), addBlogcategory);

router.get('/get', getBlogcategory);

router.get('/get-active', getActiveblogcategory);

router.get('/search', searchBlogcategory);

router.put('/status/:id', toggleBlogcategory);

router.delete('/delete/:id', deleteBlogcategory);

router.put('/edit/:id', upload.single("image"), editBlogcategory);

router.get('/category/:slug', getBlogsByCategory);


module.exports = router;