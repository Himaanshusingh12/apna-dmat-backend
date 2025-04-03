const db = require("../config/db");
const { uploadToCloudinary } = require("../config/cloudinary");

// Add slider images
const addSlider = async (req, res) => {
    try {
        if (!req.files || !req.files.image || !req.files.image2) {
            return res.status(400).json({ message: "Both image files are required" });
        }

        // Upload images to Cloudinary
        const uploadResponse1 = await uploadToCloudinary(req.files.image[0].buffer);
        const uploadResponse2 = await uploadToCloudinary(req.files.image2[0].buffer);

        if (!uploadResponse1?.secure_url || !uploadResponse2?.secure_url) {
            return res.status(500).json({ message: "Failed to upload images to Cloudinary" });
        }

        const imageUrl1 = uploadResponse1.secure_url;
        const imageUrl2 = uploadResponse2.secure_url;

        // Insert into database with Cloudinary image URLs
        const insertSql = `INSERT INTO manage_slider (image, image2) VALUES (?, ?)`;

        db.query(insertSql, [imageUrl1, imageUrl2], (insertErr, result) => {
            if (insertErr) {
                console.error("Database Insert Error:", insertErr.message);
                return res.status(500).json({ message: "Failed to add slider images", error: insertErr.message });
            }
            res.status(201).json({ message: "Slider Images Added Successfully!", type: "insert" });
        });

    } catch (error) {
        console.error("Error handling request:", error.message);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// get All slider details (Active/Inactive) in the admin dashboard with pagination functionality.
const getSlider = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    // Query to count total sliders
    const sqlCount = 'SELECT COUNT(*) AS total FROM manage_slider';
    db.query(sqlCount, (err, countResult) => {
        if (err) {
            console.error("Error fetching total count:", err.message);
            return res.status(500).json({ message: 'Failed to fetch total count' });
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        // Query to fetch slider details
        const sql = 'SELECT * FROM manage_slider LIMIT ? OFFSET ?';
        db.query(sql, [limit, offset], (err, results) => {
            if (err) {
                console.error("Error fetching data:", err.message);
                return res.status(500).json({ message: 'Failed to fetch data' });
            }
            res.status(200).json({
                message: 'Slider details fetched successfully!',
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

// Toggle Slider Status (Active/Inactive)
const toggleslider = (req, res) => {
    const { id } = req.params;

    const getStatusQuery = 'SELECT status FROM manage_slider WHERE slider_id = ?';
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
        const updateQuery = 'UPDATE manage_slider SET status = ? WHERE slider_id = ?';
        db.query(updateQuery, [newStatus, id], (updateErr) => {
            if (updateErr) {
                console.error("Error updating status:", updateErr.message);
                return res.status(500).json({ message: 'Failed to update status' });
            }
            res.status(200).json({ message: `Slider status updated to ${newStatus}`, status: newStatus });
        });
    });
};

// Delete Service
const deleteslider = (req, res) => {
    const sliderId = req.params.id;
    const sql = 'DELETE FROM manage_slider WHERE slider_id = ?';

    db.query(sql, [sliderId], (err, result) => {
        if (err) {
            console.error('Error deleting slider:', err.message);
            return res.status(500).json({ message: 'Database error' });
        }

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'slider deleted successfully!' });
        } else {
            res.status(404).json({ message: 'Slider detail not found' });
        }
    });
};


// Fetch only Active slider (For User Dashboard)
const getActiveSlider = (req, res) => {
    const sql = "SELECT * FROM manage_slider WHERE status = 'Active'";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching active slider:", err.message);
            return res.status(500).json({ message: "Failed to fetch active slider" });
        }
        res.status(200).json({ message: "Active slider fetched successfully!", data: results });
    });
};


module.exports = {
    addSlider,
    getSlider,
    toggleslider,
    deleteslider,
    getActiveSlider,
}