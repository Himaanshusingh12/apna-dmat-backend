const db = require('../config/db');

//add terms & condition
const addTermscondition = (req, res) => {
    const { content } = req.body;
    if (!content) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    const sql = 'INSERT INTO manage_termscondition (content) VALUES (?)';
    db.query(sql, [content], (err, result) => {
        if (err) {
            console.error("Error inserting data:", err.message);
            return res.status(500).json({ message: 'Failed to insert data' });
        }
        res.status(201).json({ message: 'Terms and condition added successfully!', data: { id: result.insertId, content } });
    });
};


// get All services (Active/Inactive) in the admin dashboard with pagination functionality.
const getTermscondition = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    // Query to count total users
    const sqlCount = 'SELECT COUNT(*) AS total FROM manage_termscondition';
    db.query(sqlCount, (err, countResult) => {
        if (err) {
            console.error("Error fetching total count:", err.message);
            return res.status(500).json({ message: 'Failed to fetch total count' });
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        // Query to fetch paginated users
        const sql = 'SELECT * FROM manage_termscondition LIMIT ? OFFSET ?';
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

// search terms & condition in the admin dashboard
const searchTermscondition = (req, res) => {
    let { query: searchQuery } = req.query;

    if (!searchQuery) {
        return res.status(400).json({ message: 'Search query is required' });
    }

    const searchValue = `%${searchQuery.trim()}%`;

    const sqlQuery = `
        SELECT * FROM manage_termscondition
        WHERE content LIKE ? `;

    db.query(sqlQuery, [searchValue], (err, results) => {
        if (err) {
            console.error("Error searching terms & condition:", err.message);
            return res.status(500).json({ message: 'Failed to fetch search results' });
        }

        res.status(200).json({ message: 'Search results fetched successfully!', data: results });
    });
};

// Delete Terms & condition
const deleteTermscondition = (req, res) => {
    const termsconditionId = req.params.id;
    const sql = 'DELETE FROM manage_termscondition WHERE termscondition_id = ?';

    db.query(sql, [termsconditionId], (err, result) => {
        if (err) {
            console.error('Error deleting terms & condition:', err.message);
            return res.status(500).json({ message: 'Database error' });
        }

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'terms & condition deleted successfully!' });
        } else {
            res.status(404).json({ message: 'terms & condition not found' });
        }
    });
};

// Toggle Terms & condition Status (Active/Inactive)
const toggleTermcondition = (req, res) => {
    const { id } = req.params;

    const getStatusQuery = 'SELECT status FROM manage_termscondition WHERE termscondition_id = ?';
    db.query(getStatusQuery, [id], (err, results) => {
        if (err) {
            console.error("Error fetching status:", err.message);
            return res.status(500).json({ message: 'Failed to fetch status' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Terms & condition not found' });
        }

        // Toggle status
        const currentStatus = results[0].status;
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';

        // Update status in database
        const updateQuery = 'UPDATE manage_termscondition SET status = ? WHERE termscondition_id = ?';
        db.query(updateQuery, [newStatus, id], (updateErr) => {
            if (updateErr) {
                console.error("Error updating status:", updateErr.message);
                return res.status(500).json({ message: 'Failed to update status' });
            }
            res.status(200).json({ message: `Terms & condition status updated to ${newStatus}`, status: newStatus });
        });
    });
};

// Edit Terms & condition
const editTermcondition = (req, res) => {
    const termconditionId = req.params.id;
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    // Check if Terms condition exists
    const checkServiceQuery = "SELECT * FROM manage_termscondition WHERE termscondition_id = ?";
    db.query(checkServiceQuery, [termconditionId], (err, results) => {
        if (err) {
            console.error("Error checking terms condition:", err.message);
            return res.status(500).json({ message: "Database error" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Terms & condition not found!" });
        }

        // Update service
        const updateQuery = "UPDATE manage_termscondition SET content = ? WHERE termscondition_id = ?";
        db.query(updateQuery, [content, termconditionId], (updateErr) => {
            if (updateErr) {
                console.error("Error updating terms condition:", updateErr.message);
                return res.status(500).json({ message: "Failed to update terms condition" });
            }

            res.status(200).json({ message: "Terms condition updated successfully!" });
        });
    });
};
module.exports = {
    addTermscondition,
    getTermscondition,
    searchTermscondition,
    deleteTermscondition,
    toggleTermcondition,
    editTermcondition,
}