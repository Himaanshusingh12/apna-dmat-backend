const express = require("express");
const upload = require('../config/multer');
const { getAccountsetting, uploadFiles } = require("../controllers/accountsettingController");

const router = express.Router();

// Route to handle account settings update (including logo & favicon upload)
router.post("/update-setting", upload.fields([{ name: "logo" }, { name: "favicon" }]), uploadFiles);

router.get("/get-setting", getAccountsetting);


module.exports = router;
