const db = require("../config/db");
const { uploadToCloudinary } = require("../config/cloudinary");


// Add service details
const addBlogdetails = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Image file is required" });
        }

        // Upload file buffer to Cloudinary
        const uploadResponse = await uploadToCloudinary(req.file.buffer);
        if (!uploadResponse || !uploadResponse.secure_url) {
            return res.status(500).json({ message: "Failed to upload image to Cloudinary" });
        }

        const imageurl = uploadResponse.secure_url;
        // console.log("Uploaded Image URL:", imageurl);

        // Extract other form fields
        const { blog_id, title, description, meta_title, meta_description, meta_keywords } = req.body;

        if (!blog_id || !title || !description || !meta_title || !meta_description || !meta_keywords) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Insert into database with Cloudinary image URL
        const insertSql = `
            INSERT INTO manage_blogdetails
            (blog_id, image,title, description, meta_title, meta_description, meta_keywords) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(insertSql, [blog_id, imageurl, title, description, meta_title, meta_description, meta_keywords], (insertErr, result) => {
            if (insertErr) {
                console.error("Database Insert Error:", insertErr.message);
                return res.status(500).json({ message: "Failed to add blog details", error: insertErr.message });
            }
            // console.log("Insert Success:", result);
            res.status(201).json({ message: "Blog Details Added Successfully!", type: "insert" });
        });

    } catch (error) {
        console.error("Error handling request:", error.message);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// get All blog details (Active/Inactive) in the admin dashboard with pagination functionality.
const getblogDetail = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    // Query to count total service details
    const sqlCount = 'SELECT COUNT(*) AS total FROM manage_blogdetails';
    db.query(sqlCount, (err, countResult) => {
        if (err) {
            console.error("Error fetching total count:", err.message);
            return res.status(500).json({ message: 'Failed to fetch total count' });
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        const sql = `
                SELECT mbd.*, mb.category AS blog_category
                FROM manage_blogdetails mbd
                JOIN manage_blog mb ON mbd.blog_id = mb.blog_id
                LIMIT ? OFFSET ?;
        `;

        db.query(sql, [limit, offset], (err, results) => {
            if (err) {
                console.error("Error fetching data:", err.message);
                return res.status(500).json({ message: 'Failed to fetch data' });
            }
            res.status(200).json({
                message: 'Blog details fetched successfully!',
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

// Delete Service
const deleteBlogdetail = (req, res) => {
    const blogdetailId = req.params.id;
    const sql = 'DELETE FROM manage_blogdetails WHERE blogdetail_id = ?';

    db.query(sql, [blogdetailId], (err, result) => {
        if (err) {
            console.error('Error deleting blog detail:', err.message);
            return res.status(500).json({ message: 'Database error' });
        }

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Blog detail deleted successfully!' });
        } else {
            res.status(404).json({ message: 'Blog detail not found' });
        }
    });
};

// Toggle Service Status (Active/Inactive)
const toggleBlogdetail = (req, res) => {
    const { id } = req.params;

    const getStatusQuery = 'SELECT status FROM manage_blogdetails WHERE blogdetail_id = ?';
    db.query(getStatusQuery, [id], (err, results) => {
        if (err) {
            console.error("Error fetching status:", err.message);
            return res.status(500).json({ message: 'Failed to fetch status' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Toggle status
        const currentStatus = results[0].status;
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';

        // Update status in database
        const updateQuery = 'UPDATE manage_blogdetails SET status = ? WHERE blogdetail_id = ?';
        db.query(updateQuery, [newStatus, id], (updateErr) => {
            if (updateErr) {
                console.error("Error updating status:", updateErr.message);
                return res.status(500).json({ message: 'Failed to update status' });
            }
            res.status(200).json({ message: `Blog status updated to ${newStatus}`, status: newStatus });
        });
    });
};

// search service detail in the admin dashboard
const searchBlogdetail = (req, res) => {
    let { query: searchQuery } = req.query;

    if (!searchQuery) {
        return res.status(400).json({ message: 'Search query is required' });
    }

    const searchValue = `%${searchQuery.trim()}%`;

    const sqlQuery = `
               SELECT mbd.*, mb.category AS blog_category
               FROM manage_blogdetails mbd
               JOIN manage_blog mb ON mbd.blog_id = mb.blog_id
               WHERE mb.category LIKE ?
               OR mbd.title LIKE ?
               OR mbd.meta_title LIKE ? 
               OR mbd.description LIKE ?`;

    db.query(sqlQuery, [searchValue, searchValue, searchValue, searchValue], (err, results) => {
        if (err) {
            console.error("Error searching service details:", err.message);
            return res.status(500).json({ message: 'Failed to fetch search results' });
        }

        res.status(200).json({ message: 'Search results fetched successfully!', data: results });
    });
};

// update blog details
const updateBlogdetail = async (req, res) => {
    // console.log("Incoming Request Body:", req.body);
    // console.log("Incoming File:", req.file);

    try {
        const { title, description, meta_title, meta_description, meta_keywords } = req.body;
        const { id } = req.params;

        let imageUrl = null;
        if (req.file) {
            console.log("Uploading image to Cloudinary...");
            const result = await uploadToCloudinary(req.file.buffer);
            imageUrl = result.secure_url;
            // console.log("Uploaded Image URL:", imageUrl);
        }

        // Update in Database
        const sql = `
            UPDATE manage_blogdetails
            SET title = ?, description = ?, meta_title = ?, meta_description = ? , meta_keywords = ? ${imageUrl ? ", image = ?" : ""}
            WHERE blogdetail_id = ?
        `;

        const values = imageUrl ? [title, description, meta_title, meta_description, meta_keywords, imageUrl, id] : [title, description, meta_title, meta_description, meta_keywords, id];

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error("Database Update Error:", err);
                return res.status(500).json({ error: "Database update failed" });
            }
            res.json({ success: true, message: "Blog detail updated successfully" });
        });

    } catch (error) {
        console.error("Update Blog detail Error:", error);
        res.status(500).json({ error: "Server error during update" });
    }
};


// Fetch subservices based on service_id
const getblogdetailbyBlogcategory = (req, res) => {
    const { blog_id } = req.params;

    const sql = "SELECT * FROM manage_blogdetails WHERE blog_id = ? AND status = 'Active'";
    db.query(sql, [blog_id], (err, results) => {
        if (err) {
            console.error("Error fetching sub service details:", err.message);
            return res.status(500).json({ message: "Failed to fetch sub service details" });
        }
        res.status(200).json({ message: "Service details fetched successfully!", data: results });
    });
};

// get blog full details in the user dashboard
const getBlogfullDetails = (req, res) => {
    const { blogdetail_id } = req.params;

    const sql = `
        SELECT * FROM manage_blogdetails 
        WHERE blogdetail_id = ? AND status = 'Active'
    `;

    db.query(sql, [blogdetail_id], (err, result) => {
        if (err) {
            console.error("Error fetching blog details:", err.message);
            return res.status(500).json({ message: "Failed to fetch blog details" });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "Blog not found" });
        }

        res.status(200).json({ message: "Blog details fetched successfully", data: result[0] });
    });
};

module.exports = {
    addBlogdetails,
    getblogDetail,
    deleteBlogdetail,
    toggleBlogdetail,
    searchBlogdetail,
    updateBlogdetail,
    getBlogfullDetails,
}