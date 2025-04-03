const express = require('express');
const { addBlogcategory, getBlogcategory, searchBlogcategory, toggleBlogcategory, deleteBlogcategory, editBlogcategory, getActiveblogcategory, getBlogsByCategory } = require('../controllers/BlogController');

const router = express.Router();

router.post('/add', addBlogcategory);

router.get('/get', getBlogcategory);

router.get('/get-active', getActiveblogcategory);

router.get('/search', searchBlogcategory);

router.put('/status/:id', toggleBlogcategory);

router.delete('/delete/:id', deleteBlogcategory);

router.put('/edit/:id', editBlogcategory);

router.get('/category/:blog_id', getBlogsByCategory);

module.exports = router;