const db = require('../config/db');
const slugify = require("slugify");
const { uploadToCloudinary } = require("../config/cloudinary");


//  Add blog category
const addBlogcategory = async (req, res) => {
    try {
        const { category, meta_title, meta_description, meta_keywords } = req.body;

        if (!category) {
            return res.status(400).json({ message: 'Category field is required!' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Image file is required!' });
        }

        // Upload image to Cloudinary
        const uploadResponse = await uploadToCloudinary(req.file.buffer);
        if (!uploadResponse || !uploadResponse.secure_url) {
            return res.status(500).json({ message: 'Failed to upload image to Cloudinary' });
        }

        const slug = slugify(category, { lower: true, strict: true });
        const imageUrl = uploadResponse.secure_url;

        const sql = `
            INSERT INTO manage_blog 
            (category, meta_title, meta_description, meta_keywords, slug, image) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const values = [
            category,
            meta_title || null,
            meta_description || null,
            meta_keywords || null,
            slug,
            imageUrl
        ];

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error("Error inserting data:", err.message);
                return res.status(500).json({ message: 'Failed to insert data' });
            }

            res.status(201).json({
                message: 'Blog category added successfully!',
                data: {
                    id: result.insertId,
                    category,
                    slug,
                    image: imageUrl,
                    meta_title,
                    meta_description,
                    meta_keywords,
                },
            });
        });
    } catch (error) {
        console.error("Server error:", error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


// get All Blog categories (Active/Inactive) in the admin dashboard with pagination functionality.
const getBlogcategory = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    // Query to count total users
    const sqlCount = 'SELECT COUNT(*) AS total FROM manage_blog';
    db.query(sqlCount, (err, countResult) => {
        if (err) {
            console.error("Error fetching total count:", err.message);
            return res.status(500).json({ message: 'Failed to fetch total count' });
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        // Query to fetch paginated users
        const sql = 'SELECT * FROM manage_blog LIMIT ? OFFSET ?';
        db.query(sql, [limit, offset], (err, results) => {
            if (err) {
                console.error("Error fetching data:", err.message);
                return res.status(500).json({ message: 'Failed to fetch data' });
            }
            res.status(200).json({
                message: 'Blog category fetched successfully!',
                data: results,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages,
                },
            });
        });
    });
};

// search Blog category in the admin dashboard
const searchBlogcategory = (req, res) => {
    let { query: searchQuery } = req.query;

    if (!searchQuery) {
        return res.status(400).json({ message: 'Search query is required' });
    }

    const searchValue = `%${searchQuery.trim()}%`;

    const sqlQuery = `
        SELECT * FROM manage_blog
        WHERE category LIKE ? `;

    db.query(sqlQuery, [searchValue], (err, results) => {
        if (err) {
            console.error("Error searching blog category:", err.message);
            return res.status(500).json({ message: 'Failed to fetch search results' });
        }

        res.status(200).json({ message: 'Search results fetched successfully!', data: results });
    });
};

// Toggle Service Status (Active/Inactive)
const toggleBlogcategory = (req, res) => {
    const { id } = req.params;

    const getStatusQuery = 'SELECT status FROM manage_blog WHERE blog_id = ?';
    db.query(getStatusQuery, [id], (err, results) => {
        if (err) {
            console.error("Error fetching status:", err.message);
            return res.status(500).json({ message: 'Failed to fetch status' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Toggle status
        const currentStatus = results[0].status;
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';

        // Update status in database
        const updateQuery = 'UPDATE manage_blog SET status = ? WHERE blog_id = ?';
        db.query(updateQuery, [newStatus, id], (updateErr) => {
            if (updateErr) {
                console.error("Error updating status:", updateErr.message);
                return res.status(500).json({ message: 'Failed to update status' });
            }
            res.status(200).json({ message: `Blog categories status updated to ${newStatus}`, status: newStatus });
        });
    });
};

// Delete Blog category
const deleteBlogcategory = (req, res) => {
    const blogcategoryId = req.params.id;
    const sql = 'DELETE FROM manage_blog WHERE blog_id = ?';

    db.query(sql, [blogcategoryId], (err, result) => {
        if (err) {
            console.error('Error deleting blog category:', err.message);
            return res.status(500).json({ message: 'Database error' });
        }

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Blog category deleted successfully!' });
        } else {
            res.status(404).json({ message: 'Blog category not found' });
        }
    });
};

// Edit blog category
const editBlogcategory = async (req, res) => {
    const blogcategoryId = req.params.id;
    const { category, meta_title, meta_description, meta_keywords } = req.body;

    if (!category) {
        return res.status(400).json({ message: "Category field is required!" });
    }

    const slug = slugify(category, { lower: true, strict: true });

    try {
        let imageUrl = null;

        if (req.file) {
            console.log("Uploading blog category image to Cloudinary...");
            const result = await uploadToCloudinary(req.file.buffer);
            imageUrl = result.secure_url;
        }

        // Check if blog category exists
        const checkQuery = "SELECT * FROM manage_blog WHERE blog_id = ?";
        db.query(checkQuery, [blogcategoryId], (err, results) => {
            if (err) {
                console.error("Database check error:", err.message);
                return res.status(500).json({ message: "Database error" });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "Blog category not found!" });
            }

            // Build the UPDATE query dynamically
            let updateQuery = `
          UPDATE manage_blog
          SET 
            category = ?, 
            slug = ?, 
            meta_title = ?, 
            meta_description = ?, 
            meta_keywords = ?
        `;

            // Conditionally append image field if it's provided
            if (imageUrl) {
                updateQuery += ", image = ?";
            }

            updateQuery += " WHERE blog_id = ?";

            const values = imageUrl
                ? [category, slug, meta_title, meta_description, meta_keywords, imageUrl, blogcategoryId]
                : [category, slug, meta_title, meta_description, meta_keywords, blogcategoryId];

            db.query(updateQuery, values, (updateErr) => {
                if (updateErr) {
                    console.error("Update error:", updateErr.message);
                    return res.status(500).json({ message: "Failed to update blog category" });
                }

                res.status(200).json({ message: "Blog category updated successfully!" });
            });
        });
    } catch (error) {
        console.error("Image upload or update error:", error);
        res.status(500).json({ message: "Server error during update" });
    }
};


// Fetch only Active Blog category (For User Dashboard)
const getActiveblogcategory = (req, res) => {
    const sql = "SELECT * FROM manage_blog WHERE status = 'Active'";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching active Blog category:", err.message);
            return res.status(500).json({ message: "Failed to fetch active blog category" });
        }
        res.status(200).json({ message: "Active blog category fetched successfully!", data: results });
    });
};


// Fetch Blogs by Category (using slug) for User Dashboard
const getBlogsByCategory = (req, res) => {
    const { slug } = req.params;

    const getCategoryIdQuery = 'SELECT blog_id FROM manage_blog WHERE slug = ? AND status = "Active"';
    db.query(getCategoryIdQuery, [slug], (err, result) => {
        if (err) {
            console.error("Error getting category ID:", err.message);
            return res.status(500).json({ message: "Failed to get blog category" });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "Blog category not found" });
        }

        const blog_id = result[0].blog_id;

        const sql = `
            SELECT blogdetail_id, slug, title, image, description 
            FROM manage_blogdetails 
            WHERE blog_id = ? AND status = 'Active'
        `;
        db.query(sql, [blog_id], (err2, results) => {
            if (err2) {
                console.error("Error fetching blogs:", err2.message);
                return res.status(500).json({ message: "Failed to fetch blogs" });
            }
            res.status(200).json({ message: "Blogs fetched successfully!", data: results });
        });
    });
};


module.exports = {
    addBlogcategory,
    getBlogcategory,
    searchBlogcategory,
    toggleBlogcategory,
    deleteBlogcategory,
    editBlogcategory,
    getActiveblogcategory,
    getBlogsByCategory,
};


