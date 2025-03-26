const db = require('../config/db');

//  Add Testimonial
const addTestimonial = (req, res) => {
    const { name, review } = req.body;
    if (!name || !review) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    const sql = 'INSERT INTO manage_testimonial (name,review) VALUES (?, ?)';
    db.query(sql, [name, review], (err, result) => {
        if (err) {
            console.error("Error inserting data:", err.message);
            return res.status(500).json({ message: 'Failed to insert data' });
        }
        res.status(201).json({ message: 'Testimonial added successfully!', data: { id: result.insertId, name, review } });
    });
};

// // get Testimonial
// const getTestimonial = (req, res) => {
//     const sql = 'SELECT * FROM manage_testimonial';
//     db.query(sql, (err, results) => {
//         if (err) {
//             console.error("Error fetching data:", err.message);
//             return res.status(500).json({ message: 'Failed to fetch data' });
//         }
//         res.status(200).json({ message: 'Testimonial fetched successfully!', data: results });
//     });
// }

//new one with pagination

const getTestimonial = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    // Query to count total users
    const sqlCount = 'SELECT COUNT(*) AS total FROM manage_testimonial';
    db.query(sqlCount, (err, countResult) => {
        if (err) {
            console.error("Error fetching total count:", err.message);
            return res.status(500).json({ message: 'Failed to fetch total count' });
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        // Query to fetch paginated testimonial
        const sql = 'SELECT * FROM manage_testimonial LIMIT ? OFFSET ?';
        db.query(sql, [limit, offset], (err, results) => {
            if (err) {
                console.error("Error fetching data:", err.message);
                return res.status(500).json({ message: 'Failed to fetch data' });
            }
            res.status(200).json({
                message: 'Testimonial fetched successfully!',
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


// Delete Testimonial
const deleteTestimonial = (req, res) => {
    const testimonialId = req.params.id;
    const sql = 'DELETE FROM manage_testimonial WHERE testimonial_id = ?';

    db.query(sql, [testimonialId], (err, result) => {
        if (err) {
            console.error('Error deleting testimonial:', err.message);
            return res.status(500).json({ message: 'Database error' });
        }

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Testimonial deleted successfully!' });
        } else {
            res.status(404).json({ message: 'Testimonial not found' });
        }
    });
};

// search testimonial in the admin dashboard
const searchTestimonial = (req, res) => {
    let { query: searchQuery } = req.query;

    if (!searchQuery) {
        return res.status(400).json({ message: 'Search query is required' });
    }

    const searchValue = `%${searchQuery.trim()}%`;

    const sqlQuery = `
        SELECT * FROM manage_testimonial 
        WHERE name LIKE ? 
        OR review LIKE ? `;


    db.query(sqlQuery, [searchValue, searchValue, searchValue, searchValue], (err, results) => {
        if (err) {
            console.error("Error searching testimonial:", err.message);
            return res.status(500).json({ message: 'Failed to fetch search results' });
        }

        res.status(200).json({ message: 'Search results fetched successfully!', data: results });
    });
};

module.exports = {
    addTestimonial,
    getTestimonial,
    deleteTestimonial,
    searchTestimonial,
};