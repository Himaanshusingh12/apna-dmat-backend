const db = require("../config/db");
const { uploadToCloudinary } = require("../config/cloudinary");

// Add service details
const addServiceDetails = async (req, res) => {
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
        const { subservice_id, sort_description, description, meta_title, meta_description, meta_keywords } = req.body;

        if (!subservice_id || !sort_description || !description) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Insert into database with Cloudinary image URL
        const insertSql = `
            INSERT INTO manage_servicedetails
            (subservice_id, image, sort_description, description, meta_title, meta_description, meta_keywords) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(insertSql, [subservice_id, imageurl, sort_description, description, meta_title || null, meta_description || null, meta_keywords || null], (insertErr, result) => {
            if (insertErr) {
                console.error("Database Insert Error:", insertErr.message);
                return res.status(500).json({ message: "Failed to add service details", error: insertErr.message });
            }
            // console.log("Insert Success:", result);
            res.status(201).json({ message: "Service Details Added Successfully!", type: "insert" });
        });

    } catch (error) {
        console.error("Error handling request:", error.message);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// get All service details (Active/Inactive) in the admin dashboard with pagination functionality.
const getserviceDetail = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    // Query to count total service details
    const sqlCount = 'SELECT COUNT(*) AS total FROM manage_servicedetails';
    db.query(sqlCount, (err, countResult) => {
        if (err) {
            console.error("Error fetching total count:", err.message);
            return res.status(500).json({ message: 'Failed to fetch total count' });
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        // Query to fetch service details with subservice title
        const sql = `
            SELECT msd.*, ms.title AS subservice_title
            FROM manage_servicedetails msd
            JOIN manage_subservice ms ON msd.subservice_id = ms.subservice_id
            LIMIT ? OFFSET ?
        `;

        db.query(sql, [limit, offset], (err, results) => {
            if (err) {
                console.error("Error fetching data:", err.message);
                return res.status(500).json({ message: 'Failed to fetch data' });
            }
            res.status(200).json({
                message: 'Service details fetched successfully!',
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

// Toggle Service Status (Active/Inactive)
const toggleserviceDetail = (req, res) => {
    const { id } = req.params;

    const getStatusQuery = 'SELECT status FROM manage_servicedetails WHERE servicedetails_id = ?';
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
        const updateQuery = 'UPDATE manage_servicedetails SET status = ? WHERE servicedetails_id = ?';
        db.query(updateQuery, [newStatus, id], (updateErr) => {
            if (updateErr) {
                console.error("Error updating status:", updateErr.message);
                return res.status(500).json({ message: 'Failed to update status' });
            }
            res.status(200).json({ message: `Service status updated to ${newStatus}`, status: newStatus });
        });
    });
};

// search service detail in the admin dashboard
const searchservicedetail = (req, res) => {
    let { query: searchQuery } = req.query;

    if (!searchQuery) {
        return res.status(400).json({ message: 'Search query is required' });
    }

    const searchValue = `%${searchQuery.trim()}%`;

    const sqlQuery = `
        SELECT msd.*, ms.title AS subservice_title 
        FROM manage_servicedetails msd
        JOIN manage_subservice ms ON msd.subservice_id = ms.subservice_id
        WHERE ms.title LIKE ?`;

    db.query(sqlQuery, [searchValue], (err, results) => {
        if (err) {
            console.error("Error searching service details:", err.message);
            return res.status(500).json({ message: 'Failed to fetch search results' });
        }

        res.status(200).json({ message: 'Search results fetched successfully!', data: results });
    });
};


const getsubservicedetailbySubservice = (req, res) => {
    const { subservice_slug } = req.params;

    // Query to fetch service details by subservice_slug
    const sql = `
        SELECT msd.*, ms.title AS subservice_title
        FROM manage_servicedetails msd
        JOIN manage_subservice ms ON msd.subservice_id = ms.subservice_id
        WHERE ms.slug = ? AND msd.status = 'Active'
    `;
    db.query(sql, [subservice_slug], (err, results) => {
        if (err) {
            console.error("Error fetching sub service details:", err.message);
            return res.status(500).json({ message: "Failed to fetch sub service details" });
        }
        res.status(200).json({ message: "Service details fetched successfully!", data: results });
    });
};


// Delete Service
const deleteserviceDetail = (req, res) => {
    const servicedetailId = req.params.id;
    const sql = 'DELETE FROM manage_servicedetails WHERE servicedetails_id = ?';

    db.query(sql, [servicedetailId], (err, result) => {
        if (err) {
            console.error('Error deleting service detail:', err.message);
            return res.status(500).json({ message: 'Database error' });
        }

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Service detail deleted successfully!' });
        } else {
            res.status(404).json({ message: 'Service detail not found' });
        }
    });
};

// update service details
const updateserviceDetail = async (req, res) => {

    try {
        const { sort_description, description, meta_title, meta_description, meta_keywords } = req.body;
        const { id } = req.params;

        let imageUrl = null;
        if (req.file) {
            console.log("Uploading image to Cloudinary...");
            const result = await uploadToCloudinary(req.file.buffer);
            imageUrl = result.secure_url;
            // console.log("Uploaded Image URL:", imageUrl);
        }

        let sql = `
        UPDATE manage_servicedetails
        SET sort_description = ?, description = ?, meta_title = ?, meta_description = ?, meta_keywords = ?
    `;
        const values = [sort_description, description, meta_title || null, meta_description || null, meta_keywords || null];

        if (imageUrl) {
            sql += `, image = ?`;
            values.push(imageUrl);
        }

        sql += ` WHERE servicedetails_id = ?`;
        values.push(id);

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error("Database Update Error:", err);
                return res.status(500).json({ error: "Database update failed" });
            }
            res.json({ success: true, message: "Service detail updated successfully" });
        });

    } catch (error) {
        console.error("Update Service Error:", error);
        res.status(500).json({ error: "Server error during update" });
    }
};

module.exports = {
    addServiceDetails,
    getserviceDetail,
    toggleserviceDetail,
    searchservicedetail,
    getsubservicedetailbySubservice,
    deleteserviceDetail,
    updateserviceDetail,
};
