const db = require('../config/db');

//  Add User
const addSeo = (req, res) => {
    const { page_name, meta_title, meta_description, meta_keywords } = req.body;
    if (!page_name) {
        return res.status(400).json({ message: 'Page name is required!' });
    }

    // Set fields to empty string if not provided
    const metaTitle = meta_title || ''; // Empty if not provided
    const metaDescription = meta_description || ''; // Empty if not provided
    const metaKeywords = meta_keywords || ''; // Empty if not provided

    const sql = 'INSERT INTO manage_seo (page_name, meta_title, meta_description, meta_keywords) VALUES (?, ?, ?, ?)';
    db.query(sql, [page_name, metaTitle, metaDescription, metaKeywords], (err, result) => {
        if (err) {
            console.error("Error inserting data:", err.message);
            return res.status(500).json({ message: 'Failed to insert data' });
        }
        res.status(201).json({ message: 'Seo added successfully!', data: { id: result.insertId, page_name, metaTitle, metaDescription, metaKeywords } });
    });
};

// new one with pagination
const getAllSeodetail = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    // Query to count total users
    const sqlCount = 'SELECT COUNT(*) AS total FROM manage_seo';
    db.query(sqlCount, (err, countResult) => {
        if (err) {
            console.error("Error fetching total count:", err.message);
            return res.status(500).json({ message: 'Failed to fetch total count' });
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        // Query to fetch paginated users
        const sql = 'SELECT * FROM manage_seo LIMIT ? OFFSET ?';
        db.query(sql, [limit, offset], (err, results) => {
            if (err) {
                console.error("Error fetching data:", err.message);
                return res.status(500).json({ message: 'Failed to fetch data' });
            }
            res.status(200).json({
                message: 'Seo Detail fetched successfully!',
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

// search users in the admin dashboard
const searchSeoDetail = (req, res) => {
    let { query: searchQuery } = req.query;

    if (!searchQuery) {
        return res.status(400).json({ message: 'Search query is required' });
    }

    const searchValue = `%${searchQuery.trim()}%`;

    const sqlQuery = `
        SELECT * FROM manage_seo 
        WHERE page_name LIKE ? 
        OR meta_title LIKE ? 
        OR meta_description LIKE ? 
        OR meta_keywords LIKE ?`;

    db.query(sqlQuery, [searchValue, searchValue, searchValue, searchValue], (err, results) => {
        if (err) {
            console.error("Error searching seo details:", err.message);
            return res.status(500).json({ message: 'Failed to fetch search results' });
        }

        res.status(200).json({ message: 'Search results fetched successfully!', data: results });
    });
};

// Edit SEO Detail
const editSeoDetail = (req, res) => {
    const seoDetailId = req.params.id;
    const { page_name, meta_title, meta_description, meta_keywords } = req.body;

    // Set default values if optional fields are missing
    const metaTitle = meta_title || '';
    const metaDescription = meta_description || '';
    const metaKeywords = meta_keywords || '';

    const sql = `
        UPDATE manage_seo 
        SET page_name = ?, meta_title = ?, meta_description = ?, meta_keywords = ? 
        WHERE seo_id = ?
    `;

    db.query(sql, [page_name, metaTitle, metaDescription, metaKeywords, seoDetailId], (err, result) => {
        if (err) {
            console.error("Error updating SEO detail:", err.message);
            return res.status(500).json({ message: 'Failed to update SEO detail' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'SEO detail not found' });
        }

        res.status(200).json({ message: 'SEO detail updated successfully!' });
    });
};

// Fetch only Active seo detail (For User Dashboard)
const getActiveseoDetail = (req, res) => {
    const sql = "SELECT * FROM manage_seo WHERE status = 'Active'";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching active seo detail:", err.message);
            return res.status(500).json({ message: "Failed to fetch active seo detail" });
        }
        res.status(200).json({ message: "Active seo detail fetched successfully!", data: results });
    });
};

module.exports = {
    addSeo,
    getAllSeodetail,
    searchSeoDetail,
    editSeoDetail,
    getActiveseoDetail,
}