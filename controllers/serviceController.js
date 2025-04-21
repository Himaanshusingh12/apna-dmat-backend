const db = require('../config/db');
const slugify = require("slugify");

//  Add Service
const addService = (req, res) => {
    const { icon, title, description, meta_title, meta_description, meta_keywords } = req.body;
    if (!icon || !title || !description) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    const slug = slugify(title, { lower: true, strict: true });

    const sql = 'INSERT INTO manage_service (icon, title, slug, description, meta_title, meta_description, meta_keywords) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [icon, title, slug, description, meta_title, meta_description, meta_keywords], (err, result) => {
        if (err) {
            console.error("Error inserting data:", err.message);
            return res.status(500).json({ message: 'Failed to insert data' });
        }
        res.status(201).json({
            message: 'Service added successfully!',
            data: { id: result.insertId, icon, title, slug, description, meta_title, meta_description, meta_keywords }
        });
    });
};


// get All services (Active/Inactive) in the admin dashboard with pagination functionality.
const getService = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    // Query to count total users
    const sqlCount = 'SELECT COUNT(*) AS total FROM manage_service';
    db.query(sqlCount, (err, countResult) => {
        if (err) {
            console.error("Error fetching total count:", err.message);
            return res.status(500).json({ message: 'Failed to fetch total count' });
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        // Query to fetch paginated users
        const sql = 'SELECT * FROM manage_service LIMIT ? OFFSET ?';
        db.query(sql, [limit, offset], (err, results) => {
            if (err) {
                console.error("Error fetching data:", err.message);
                return res.status(500).json({ message: 'Failed to fetch data' });
            }
            res.status(200).json({
                message: 'Service fetched successfully!',
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

// Fetch only Active services (For User Dashboard)
const getActiveService = (req, res) => {
    const sql = "SELECT * FROM manage_service WHERE status = 'Active'";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching active services:", err.message);
            return res.status(500).json({ message: "Failed to fetch active services" });
        }
        res.status(200).json({ message: "Active services fetched successfully!", data: results });
    });
};

// Toggle Service Status (Active/Inactive)
const toggleService = (req, res) => {
    const { id } = req.params;

    const getStatusQuery = 'SELECT status FROM manage_service WHERE service_id = ?';
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
        const updateQuery = 'UPDATE manage_service SET status = ? WHERE service_id = ?';
        db.query(updateQuery, [newStatus, id], (updateErr) => {
            if (updateErr) {
                console.error("Error updating status:", updateErr.message);
                return res.status(500).json({ message: 'Failed to update status' });
            }
            res.status(200).json({ message: `Service status updated to ${newStatus}`, status: newStatus });
        });
    });
};

// search users in the admin dashboard
const searchService = (req, res) => {
    let { query: searchQuery } = req.query;

    if (!searchQuery) {
        return res.status(400).json({ message: 'Search query is required' });
    }

    const searchValue = `%${searchQuery.trim()}%`;

    const sqlQuery = `
        SELECT * FROM manage_service 
        WHERE title LIKE ? `;

    db.query(sqlQuery, [searchValue, searchValue, searchValue, searchValue], (err, results) => {
        if (err) {
            console.error("Error searching users:", err.message);
            return res.status(500).json({ message: 'Failed to fetch search results' });
        }

        res.status(200).json({ message: 'Search results fetched successfully!', data: results });
    });
};

// Delete Service
const deleteService = (req, res) => {
    const serviceId = req.params.id;
    const sql = 'DELETE FROM manage_service WHERE service_id = ?';

    db.query(sql, [serviceId], (err, result) => {
        if (err) {
            console.error('Error deleting service:', err.message);
            return res.status(500).json({ message: 'Database error' });
        }

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Service deleted successfully!' });
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    });
};

//Edit service
const editService = (req, res) => {
    const serviceId = req.params.id;
    const { icon, title, description, meta_title, meta_description, meta_keywords } = req.body;

    if (!icon || !title || !description) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    const slug = slugify(title, { lower: true, strict: true });

    // Check if service exists
    const checkServiceQuery = "SELECT * FROM manage_service WHERE service_id = ?";
    db.query(checkServiceQuery, [serviceId], (err, results) => {
        if (err) {
            console.error("Error checking service:", err.message);
            return res.status(500).json({ message: "Database error" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Service not found!" });
        }

        // Update service with new slug
        const updateQuery = "UPDATE manage_service SET icon = ?, title = ?, slug = ?, description = ?, meta_title = ?, meta_description = ?, meta_keywords = ? WHERE service_id = ?";
        db.query(updateQuery, [icon, title, slug, description, meta_title, meta_description, meta_keywords, serviceId], (updateErr) => {
            if (updateErr) {
                console.error("Error updating service:", updateErr.message);
                return res.status(500).json({ message: "Failed to update service" });
            }

            res.status(200).json({ message: "Service updated successfully!" });
        });
    });
};

module.exports = {
    addService,
    getService,
    getActiveService,
    toggleService,
    searchService,
    deleteService,
    editService,
};
