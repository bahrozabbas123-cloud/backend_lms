const express = require("express");
const { authenticate } = require("../middleware/auth");
const { getCertificates } = require("../controllers/certificateController");

const router = express.Router();
router.get("/", authenticate, getCertificates);

module.exports = router;
