const express = require('express');

const upload = require('../config/multer');
const { addBlogdetails, getblogDetail, deleteBlogdetail, toggleBlogdetail, searchBlogdetail, updateBlogdetail, getBlogdetailBySlug, } = require('../controllers/blogdetailController');

const router = express.Router();


router.post('/add', upload.single("image"), addBlogdetails);

router.get('/get', getblogDetail);

router.delete('/delete/:id', deleteBlogdetail);

router.put('/status/:id', toggleBlogdetail);

router.get('/search', searchBlogdetail);

router.put('/edit/:id', upload.single("image"), updateBlogdetail);

router.get('/details/:slug', getBlogdetailBySlug);

module.exports = router;