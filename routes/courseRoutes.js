const express = require("express");
const { authenticate } = require("../middleware/auth");
const { getEnrolledCourses } = require("../controllers/courseController");

const router = express.Router();
router.get("/", authenticate, getEnrolledCourses);

module.exports = router;