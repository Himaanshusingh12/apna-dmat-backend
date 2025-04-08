const db = require('../config/db');
const slugify = require("slugify");


//  Add blog category
const addBlogcategory = (req, res) => {
    const { category } = req.body;
    if (!category) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    const slug = slugify(category, { lower: true, strict: true });

    const sql = 'INSERT INTO manage_blog (category,slug) VALUES (?,?)';
    db.query(sql, [category, slug], (err, result) => {
        if (err) {
            console.error("Error inserting data:", err.message);
            return res.status(500).json({ message: 'Failed to insert data' });
        }
        res.status(201).json({ message: 'Blog category added successfully!', data: { id: result.insertId, category, slug } });
    });
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

// Edit service
const editBlogcategory = (req, res) => {
    const blogcategoryId = req.params.id;
    const { category } = req.body;

    if (!category) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    const slug = slugify(category, { lower: true, strict: true });

    // Check if service exists
    const checkServiceQuery = "SELECT * FROM manage_blog WHERE blog_id = ?";
    db.query(checkServiceQuery, [blogcategoryId], (err, results) => {
        if (err) {
            console.error("Error checking blog category:", err.message);
            return res.status(500).json({ message: "Database error" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Blog category not found!" });
        }

        // Update service
        const updateQuery = "UPDATE manage_blog SET  category = ?, slug = ? WHERE blog_id = ?";
        db.query(updateQuery, [category, slug, blogcategoryId], (updateErr) => {
            if (updateErr) {
                console.error("Error updating blog category:", updateErr.message);
                return res.status(500).json({ message: "Failed to update blog category" });
            }

            res.status(200).json({ message: "Blog category updated successfully!" });
        });
    });
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


