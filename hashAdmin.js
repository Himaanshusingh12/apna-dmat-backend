const bcrypt = require("bcrypt");
const db = require("./config/db");

const email = "admin@example.com";
const plainPassword = "admin@123";
bcrypt.hash(plainPassword, 10, (err, hash) => {
    if (err) {
        console.error("Error hashing password:", err);
        return;
    }

    // Insert admin with hashed password
    db.query("INSERT INTO manage_admin (email, password) VALUES (?, ?)", [email, hash], (err, result) => {
        if (err) {
            console.error("Error inserting admin:", err);
        } else {
            console.log("Admin user created successfully!");
        }
        process.exit();
    });
});



//change email and password and run this query in the terminal if you want to change email and password
//node hashAdmin.js
