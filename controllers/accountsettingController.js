const db = require("../config/db");
const { uploadToCloudinary } = require("../config/cloudinary");


// for add new data
const uploadFiles = async (req, res) => {
    try {
        // Extract form data
        const {
            email_one, email_two, address, mobile_number, copyright,
            map_iframe, facebook, linkedin, twitter, instagram, youtube
        } = req.body;

        // Upload new logo & favicon to Cloudinary (if provided)
        let logoPath = null;
        let faviconPath = null;

        if (req.files["logo"]) {
            const logoUpload = await uploadToCloudinary(req.files["logo"][0].buffer);
            if (!logoUpload || !logoUpload.secure_url) {
                return res.status(500).json({ message: "Failed to upload logo to Cloudinary" });
            }
            logoPath = logoUpload.secure_url;
        }

        if (req.files["favicon"]) {
            const faviconUpload = await uploadToCloudinary(req.files["favicon"][0].buffer);
            if (!faviconUpload || !faviconUpload.secure_url) {
                return res.status(500).json({ message: "Failed to upload favicon to Cloudinary" });
            }
            faviconPath = faviconUpload.secure_url;
        }

        // Check if settings already exist
        const checkSql = "SELECT * FROM manage_accountsettings LIMIT 1";
        db.query(checkSql, (err, results) => {
            if (err) {
                console.error("Database Select Error:", err.message);
                return res.status(500).json({ message: "Database error while checking existing settings" });
            }

            if (results.length > 0) {
                // Update existing record
                const existing = results[0];

                const updatedData = {
                    logo: logoPath || existing.logo,
                    favicon: faviconPath || existing.favicon,
                    email_one: email_one || existing.email_one,
                    email_two: email_two || existing.email_two,
                    address: address || existing.address,
                    mobile_number: mobile_number || existing.mobile_number,
                    copyright: copyright || existing.copyright,
                    map_iframe: map_iframe || existing.map_iframe,
                    facebook: facebook || existing.facebook,
                    linkedin: linkedin || existing.linkedin,
                    twitter: twitter || existing.twitter,
                    instagram: instagram || existing.instagram,
                    youtube: youtube || existing.youtube,
                };

                const updateSql = `
                    UPDATE manage_accountsettings 
                    SET logo=?, favicon=?, email_one=?, email_two=?, address=?, mobile_number=?, 
                        copyright=?, map_iframe=?, facebook=?, linkedin=?, twitter=?, 
                        instagram=?, youtube=? 
                    WHERE id=?
                `;

                db.query(updateSql, [
                    updatedData.logo, updatedData.favicon, updatedData.email_one, updatedData.email_two, updatedData.address,
                    updatedData.mobile_number, updatedData.copyright, updatedData.map_iframe,
                    updatedData.facebook, updatedData.linkedin, updatedData.twitter,
                    updatedData.instagram, updatedData.youtube, existing.id
                ], (updateErr) => {
                    if (updateErr) {
                        console.error("Database Update Error:", updateErr.message);
                        return res.status(500).json({ message: "Failed to update account settings" });
                    }
                    res.status(200).json({ message: "Account settings updated successfully!", type: "update" });
                });

            } else {
                // Insert new record
                const insertSql = `
                    INSERT INTO manage_accountsettings 
                    (logo, favicon, email_one, email_two, address, mobile_number, copyright, map_iframe, facebook, linkedin, twitter, instagram, youtube) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                db.query(insertSql, [
                    logoPath, faviconPath, email_one, email_two, address, mobile_number,
                    copyright, map_iframe, facebook, linkedin, twitter, instagram, youtube
                ], (insertErr, result) => {
                    if (insertErr) {
                        console.error("Database Insert Error:", insertErr.message);
                        return res.status(500).json({ message: "Failed to save account settings" });
                    }
                    res.status(201).json({ message: "Account Setting Added Successfully!", type: "insert" });
                });
            }
        });

    } catch (error) {
        console.error("Error:", error.message);
        return res.status(500).json({ message: "File upload failed", error: error.message });
    }
};

// for get all account details
const getAccountsetting = (req, res) => {
    const sql = 'SELECT * FROM manage_accountsettings';

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching account settings:", err.message);
            return res.status(500).json({ message: 'Failed to fetch account settings' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No account settings found' });
        }

        res.status(200).json({ message: 'Account settings fetched successfully!', data: results });
    });
};
module.exports = { uploadFiles, getAccountsetting };
