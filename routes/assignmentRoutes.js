const express = require("express");
const router = express.Router();

const {
  getAssignments,
  submitAssignment,
} = require("../controllers/assignmentController");
const { authenticate } = require("../middleware/auth");

router.get("/", authenticate, getAssignments);
router.post("/submit", authenticate, submitAssignment);

module.exports = router;