const db = require('../config/db');

//  Add User
const addUser = (req, res) => {
    const { name, email, phone, project, subject, message, status = 'Active' } = req.body;
    if (!name || !email || !phone || !project || !subject || !message) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    const sql = 'INSERT INTO manage_customer (name, email, phone, project, subject, message, status) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [name, email, phone, project, subject, message, status], (err, result) => {
        if (err) {
            console.error("Error inserting data:", err.message);
            return res.status(500).json({ message: 'Failed to insert data' });
        }
        res.status(201).json({ message: 'Customer added successfully!', data: { id: result.insertId, name, email, phone, project, subject, message, status } });
    });
};

// // get all users
// const getAllUsers = (req, res) => {
//     const sql = 'SELECT * FROM manage_customer';
//     db.query(sql, (err, results) => {
//         if (err) {
//             console.error("Error fetching data:", err.message);
//             return res.status(500).json({ message: 'Failed to fetch data' });
//         }
//         res.status(200).json({ message: 'Users fetched successfully!', data: results });
//     });
// };

// new one with pagination
const getAllUsers = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    // Query to count total users
    const sqlCount = 'SELECT COUNT(*) AS total FROM manage_customer';
    db.query(sqlCount, (err, countResult) => {
        if (err) {
            console.error("Error fetching total count:", err.message);
            return res.status(500).json({ message: 'Failed to fetch total count' });
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        // Query to fetch paginated users
        const sql = 'SELECT * FROM manage_customer LIMIT ? OFFSET ?';
        db.query(sql, [limit, offset], (err, results) => {
            if (err) {
                console.error("Error fetching data:", err.message);
                return res.status(500).json({ message: 'Failed to fetch data' });
            }
            res.status(200).json({
                message: 'Users fetched successfully!',
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
const deleteUser = (req, res) => {
    const customerId = req.params.id;
    const sql = 'DELETE FROM manage_customer WHERE customer_id = ?';

    db.query(sql, [customerId], (err, result) => {
        if (err) {
            console.error('Error deleting customer:', err.message);
            return res.status(500).json({ message: 'Database error' });
        }

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Customer deleted successfully!' });
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    });
};

// search users in the admin dashboard
const searchUsers = (req, res) => {
    let { query: searchQuery } = req.query;

    if (!searchQuery) {
        return res.status(400).json({ message: 'Search query is required' });
    }

    const searchValue = `%${searchQuery.trim()}%`;

    const sqlQuery = `
        SELECT * FROM manage_customer 
        WHERE name LIKE ? 
        OR email LIKE ? 
        OR phone LIKE ? 
        OR project LIKE ?`;

    db.query(sqlQuery, [searchValue, searchValue, searchValue, searchValue], (err, results) => {
        if (err) {
            console.error("Error searching users:", err.message);
            return res.status(500).json({ message: 'Failed to fetch search results' });
        }

        res.status(200).json({ message: 'Search results fetched successfully!', data: results });
    });
};


module.exports = {
    addUser,
    getAllUsers,
    deleteUser,
    searchUsers,
};
