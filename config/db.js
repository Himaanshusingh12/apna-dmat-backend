const mysql = require('mysql');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10,
});

db.getConnection((err, connection) => {
    if (err) {
        console.error("Error connecting to the database:", err.message);
        return;
    }
    console.log("Connected to the database");
    connection.release();
});

db.on("error", (err) => {
    console.error("MySQL pool error:", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
        console.error("Database connection was lost. Reconnecting...");
    } else {
        throw err;
    }
});

module.exports = db;
