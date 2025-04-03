require("dotenv").config();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// Admin Login Function
const Adminlogin = (req, res) => {
    const { email, password } = req.body;

    // Check if email exists in database
    const sql = "SELECT * FROM manage_admin WHERE email = ?";
    db.query(sql, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const admin = results[0];

        // Compare entered password with stored hashed password
        bcrypt.compare(password, admin.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ message: "Error comparing passwords" });
            }

            if (!isMatch) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            // Generate JWT token
            const token = jwt.sign({ admin_id: admin.admin_id, email: admin.email }, JWT_SECRET, {
                expiresIn: "1h",
            });

            res.json({ message: "Login successful", token });
        });
    });
};

module.exports = {
    Adminlogin,
};
