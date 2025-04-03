const express = require('express');

const upload = require('../config/multer');
const { addBlogdetails, getblogDetail, deleteBlogdetail, toggleBlogdetail, searchBlogdetail, updateBlogdetail, getBlogfullDetails } = require('../controllers/blogdetailController');

const router = express.Router();


router.post('/add', upload.single("image"), addBlogdetails);

router.get('/get', getblogDetail);

router.delete('/delete/:id', deleteBlogdetail);

router.put('/status/:id', toggleBlogdetail);

router.get('/search', searchBlogdetail);

router.put('/edit/:id', upload.single("image"), updateBlogdetail);

router.get('/details/:blogdetail_id', getBlogfullDetails);


module.exports = router;