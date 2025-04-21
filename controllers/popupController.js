const db = require('../config/db');

//  Add User
const addpopupdetails = (req, res) => {
    const { name, mobile_number, services } = req.body;
    if (!name || !mobile_number || !services || !Array.isArray(services)) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    const servicesString = JSON.stringify(services);

    const sql = 'INSERT INTO manage_popupdetails (name, mobile_number, services) VALUES (?, ?, ?)';
    db.query(sql, [name, mobile_number, servicesString], (err, result) => {
        if (err) {
            console.error("Error inserting data:", err.message);
            return res.status(500).json({ message: 'Failed to insert data' });
        }
        res.status(201).json({ message: 'Popup details added successfully!', data: { id: result.insertId, name, mobile_number, services: services, } });
    });
};

// get all popup details with pagination
const getallpopupdetails = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    // Query to count total users
    const sqlCount = 'SELECT COUNT(*) AS total FROM manage_popupdetails';
    db.query(sqlCount, (err, countResult) => {
        if (err) {
            console.error("Error fetching total count:", err.message);
            return res.status(500).json({ message: 'Failed to fetch total count' });
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        // Query to fetch paginated users
        const sql = 'SELECT * FROM manage_popupdetails LIMIT ? OFFSET ?';
        db.query(sql, [limit, offset], (err, results) => {
            if (err) {
                console.error("Error fetching data:", err.message);
                return res.status(500).json({ message: 'Failed to fetch data' });
            }
            res.status(200).json({
                message: 'Popup details fetched successfully!',
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

// Delete User
const deletepopupdetail = (req, res) => {
    const popupdetailId = req.params.id;
    const sql = 'DELETE FROM manage_popupdetails WHERE popupdetails_id = ?';

    db.query(sql, [popupdetailId], (err, result) => {
        if (err) {
            console.error('Error deleting detail:', err.message);
            return res.status(500).json({ message: 'Database error' });
        }

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Detail deleted successfully!' });
        } else {
            res.status(404).json({ message: 'Detail not found' });
        }
    });
};

// search popup details in the admin dashboard
const searchdetails = (req, res) => {
    let { query: searchQuery } = req.query;

    if (!searchQuery) {
        return res.status(400).json({ message: 'Search query is required' });
    }

    const searchValue = `%${searchQuery.trim()}%`;

    const sqlQuery = `
        SELECT * FROM manage_popupdetails
        WHERE name LIKE ? 
        OR mobile_number LIKE ?`;

    db.query(sqlQuery, [searchValue, searchValue], (err, results) => {
        if (err) {
            console.error("Error searching details:", err.message);
            return res.status(500).json({ message: 'Failed to fetch search results' });
        }

        res.status(200).json({ message: 'Search results fetched successfully!', data: results });
    });
};

// Get total user count
const getUserCount = (req, res) => {
    const sql = 'SELECT COUNT(*) AS totalUsers FROM manage_popupdetails';

    db.query(sql, (err, result) => {
        if (err) {
            console.error("Error fetching user count:", err.message);
            return res.status(500).json({ message: 'Failed to fetch user count' });
        }

        const totalUsers = result[0].totalUsers;
        res.status(200).json({ totalUsers });
    });
};



module.exports = {
    addpopupdetails,
    getallpopupdetails,
    deletepopupdetail,
    searchdetails,
    getUserCount,
}
