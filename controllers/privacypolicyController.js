const db = require('../config/db');


//add terms & condition
const addPrivacypolicy = (req, res) => {
    const { content } = req.body;
    if (!content) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    const sql = 'INSERT INTO manage_privacypolicy (content) VALUES (?)';
    db.query(sql, [content], (err, result) => {
        if (err) {
            console.error("Error inserting data:", err.message);
            return res.status(500).json({ message: 'Failed to insert data' });
        }
        res.status(201).json({ message: 'Privacy and policy added successfully!', data: { id: result.insertId, content } });
    });
};

// get All privacy & policy (Active/Inactive) in the admin dashboard with pagination functionality.
const getPrivacypolicy = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    // Query to count total users
    const sqlCount = 'SELECT COUNT(*) AS total FROM manage_privacypolicy';
    db.query(sqlCount, (err, countResult) => {
        if (err) {
            console.error("Error fetching total count:", err.message);
            return res.status(500).json({ message: 'Failed to fetch total count' });
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        // Query to fetch paginated users
        const sql = 'SELECT * FROM manage_privacypolicy LIMIT ? OFFSET ?';
        db.query(sql, [limit, offset], (err, results) => {
            if (err) {
                console.error("Error fetching data:", err.message);
                return res.status(500).json({ message: 'Failed to fetch data' });
            }
            res.status(200).json({
                message: 'Privacy & policy fetched successfully!',
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

// search terms & condition in the admin dashboard
const searchPrivacypolicy = (req, res) => {
    let { query: searchQuery } = req.query;

    if (!searchQuery) {
        return res.status(400).json({ message: 'Search query is required' });
    }

    const searchValue = `%${searchQuery.trim()}%`;

    const sqlQuery = `
        SELECT * FROM manage_privacypolicy
        WHERE content LIKE ? `;

    db.query(sqlQuery, [searchValue], (err, results) => {
        if (err) {
            console.error("Error searching privacy & policy:", err.message);
            return res.status(500).json({ message: 'Failed to fetch search results' });
        }

        res.status(200).json({ message: 'Search results fetched successfully!', data: results });
    });
};

// Toggle privacy & policy Status (Active/Inactive)
const togglePrivacypolicy = (req, res) => {
    const { id } = req.params;

    const getStatusQuery = 'SELECT status FROM manage_privacypolicy WHERE privacypolicy_id = ?';
    db.query(getStatusQuery, [id], (err, results) => {
        if (err) {
            console.error("Error fetching status:", err.message);
            return res.status(500).json({ message: 'Failed to fetch status' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'privacy & policy not found' });
        }

        // Toggle status
        const currentStatus = results[0].status;
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';

        // Update status in database
        const updateQuery = 'UPDATE manage_privacypolicy SET status = ? WHERE privacypolicy_id = ?';
        db.query(updateQuery, [newStatus, id], (updateErr) => {
            if (updateErr) {
                console.error("Error updating status:", updateErr.message);
                return res.status(500).json({ message: 'Failed to update status' });
            }
            res.status(200).json({ message: `privacy & policy status updated to ${newStatus}`, status: newStatus });
        });
    });
};

// Delete Privacy & policy
const deletePrivacypolicy = (req, res) => {
    const privacypolicyId = req.params.id;
    const sql = 'DELETE FROM manage_privacypolicy WHERE privacypolicy_id = ?';

    db.query(sql, [privacypolicyId], (err, result) => {
        if (err) {
            console.error('Error deleting privacy & policy:', err.message);
            return res.status(500).json({ message: 'Database error' });
        }

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'privacy & policy deleted successfully!' });
        } else {
            res.status(404).json({ message: 'privacy & policy not found' });
        }
    });
};

// Edit Privacy & policy
const editPrivacypolicy = (req, res) => {
    const privacypolicyId = req.params.id;
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    // Check if Terms condition exists
    const checkServiceQuery = "SELECT * FROM manage_privacypolicy WHERE privacypolicy_id = ?";
    db.query(checkServiceQuery, [privacypolicyId], (err, results) => {
        if (err) {
            console.error("Error checking privacy policy:", err.message);
            return res.status(500).json({ message: "Database error" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Privacy & policy not found!" });
        }

        // Update service
        const updateQuery = "UPDATE manage_privacypolicy SET content = ? WHERE privacypolicy_id = ?";
        db.query(updateQuery, [content, privacypolicyId], (updateErr) => {
            if (updateErr) {
                console.error("Error updating privacy policy:", updateErr.message);
                return res.status(500).json({ message: "Failed to update privacy policy" });
            }

            res.status(200).json({ message: "Privacy policy updated successfully!" });
        });
    });
};


// get active privacy policy in the user dashboard
const getActiveprivacy = (req, res) => {
    const sql = "SELECT * FROM manage_privacypolicy WHERE status = 'Active'";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching active privacy policy:", err.message);
            return res.status(500).json({ message: "Failed to fetch active privacy policy" });
        }
        res.status(200).json({ message: "Active privacy policy fetched successfully!", data: results });
    });
};

module.exports = {
    addPrivacypolicy,
    getPrivacypolicy,
    searchPrivacypolicy,
    togglePrivacypolicy,
    deletePrivacypolicy,
    editPrivacypolicy,
    getActiveprivacy,
}