const express = require("express");
const { upload, uploadFiles, getAccountsetting } = require("../controllers/accountsettingController");

const router = express.Router();

// Route to handle account settings update (including logo & favicon upload)
router.post("/update-setting", upload, uploadFiles);

router.get("/get-setting", getAccountsetting);


module.exports = router;
