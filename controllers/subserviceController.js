const db = require('../config/db');
const slugify = require('slugify');

//  Add Service
const addsubService = (req, res) => {
    const { service_id, icon, title, description, meta_title, meta_description, meta_keywords } = req.body;
    if (!service_id || !icon || !title || !description) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    const slug = slugify(title, { lower: true });

    const sql = 'INSERT INTO manage_subservice (service_id, icon, title, slug, description, meta_title, meta_description, meta_keywords) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [service_id, icon, title, slug, description, meta_title || null, meta_description || null, meta_keywords || null], (err, result) => {
        if (err) {
            console.error("Error inserting data:", err.message);
            return res.status(500).json({ message: 'Failed to insert data' });
        }
        res.status(201).json({
            message: 'Service added successfully!',
            data: {
                id: result.insertId, service_id, icon, title, slug, description, meta_title, meta_description, meta_keywords
            }
        });
    });
};


// get All sub services (Active/Inactive) in the admin dashboard with pagination functionality.
const getsubService = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    // Query to count total users
    const sqlCount = 'SELECT COUNT(*) AS total FROM manage_subservice';
    db.query(sqlCount, (err, countResult) => {
        if (err) {
            console.error("Error fetching total count:", err.message);
            return res.status(500).json({ message: 'Failed to fetch total count' });
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        // Query to fetch paginated users
        const sql = 'SELECT * FROM manage_subservice LIMIT ? OFFSET ?';
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

//Fetch only Active subservices (For service details page dropdown)
const getActivesubService = (req, res) => {
    const sql = "SELECT * FROM manage_subservice WHERE status = 'Active'";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching active services:", err.message);
            return res.status(500).json({ message: "Failed to fetch active services" });
        }
        res.status(200).json({ message: "Active services fetched successfully!", data: results });
    });
};


// Toggle Sub Service Status (Active/Inactive)
const togglesubService = (req, res) => {
    const { id } = req.params;

    const getStatusQuery = 'SELECT status FROM manage_subservice WHERE subservice_id = ?';
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
        const updateQuery = 'UPDATE manage_subservice SET status = ? WHERE subservice_id = ?';
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
const searchsubService = (req, res) => {
    let { query: searchQuery } = req.query;

    if (!searchQuery) {
        return res.status(400).json({ message: 'Search query is required' });
    }

    const searchValue = `%${searchQuery.trim()}%`;

    const sqlQuery = `
        SELECT * FROM manage_subservice
        WHERE title LIKE ? `;

    db.query(sqlQuery, [searchValue], (err, results) => {
        if (err) {
            console.error("Error searching users:", err.message);
            return res.status(500).json({ message: 'Failed to fetch search results' });
        }

        res.status(200).json({ message: 'Search results fetched successfully!', data: results });
    });
};

// Delete subService
const deletesubService = (req, res) => {
    const subserviceId = req.params.id;
    const sql = 'DELETE FROM manage_subservice WHERE subservice_id = ?';

    db.query(sql, [subserviceId], (err, result) => {
        if (err) {
            console.error('Error deleting sub service:', err.message);
            return res.status(500).json({ message: 'Database error' });
        }

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Sub service deleted successfully!' });
        } else {
            res.status(404).json({ message: 'Sub Service not found' });
        }
    });
};


// Edit subservice 
const editsubService = (req, res) => {
    const subserviceId = req.params.id;
    const { icon, title, description, meta_title, meta_description, meta_keywords } = req.body;

    if (!icon || !title || !description) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    const slug = slugify(title, { lower: true });

    const checkServiceQuery = "SELECT * FROM manage_subservice WHERE subservice_id = ?";
    db.query(checkServiceQuery, [subserviceId], (err, results) => {
        if (err) {
            console.error("Error checking sub service:", err.message);
            return res.status(500).json({ message: "Database error" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Sub service not found!" });
        }

        const updateQuery = "UPDATE manage_subservice SET icon = ?, title = ?, slug = ?, description = ?, meta_title = ?, meta_description = ?, meta_keywords = ?  WHERE subservice_id = ?";
        db.query(updateQuery, [icon, title, slug, description, meta_title || null, meta_description || null, meta_keywords || null, subserviceId], (updateErr) => {
            if (updateErr) {
                console.error("Error updating sub service:", updateErr.message);
                return res.status(500).json({ message: "Failed to update sub service" });
            }

            res.status(200).json({ message: "Sub service updated successfully!" });
        });
    });
};

// Fetch subservices based on service slug
const getSubservicesBySlug = (req, res) => {
    const { slug } = req.params;
    const sql = `
        SELECT * 
        FROM manage_subservice 
        WHERE service_id IN (SELECT service_id FROM manage_service WHERE slug = ?)
        AND status = 'Active'
    `;
    db.query(sql, [slug], (err, results) => {
        if (err) {
            console.error("Error fetching subservices:", err.message);
            return res.status(500).json({ message: "Failed to fetch subservices" });
        }
        res.status(200).json({ message: "Subservices fetched successfully!", data: results });
    });
};


module.exports = {
    addsubService,
    getsubService,
    getActivesubService,
    togglesubService,
    searchsubService,
    deletesubService,
    editsubService,
    getSubservicesBySlug,
};