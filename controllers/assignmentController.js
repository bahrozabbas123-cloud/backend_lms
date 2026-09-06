const pool = require("../config/db");

// Get all assignments
const getAssignments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        course_id,
        title,
        description,
        due_date,
        created_at
      FROM assignments
      ORDER BY due_date ASC
    `);

    res.json({
      success: true,
      assignments: result.rows,
    });
  } catch (error) {
    console.error("Get assignments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assignments",
    });
  }
};

// Submit an assignment
const submitAssignment = async (req, res) => {
  try {
    const { assignment_id, file_url } = req.body;

    if (!assignment_id) {
      return res.status(400).json({
        success: false,
        message: "assignment_id is required",
      });
    }

    const result = await pool.query(
      `INSERT INTO submissions
       (assignment_id, student_id, file_url)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [assignment_id, req.user.id, file_url || null]
    );

    res.status(201).json({
      success: true,
      message: "Assignment submitted successfully",
      submission: result.rows[0],
    });
  } catch (error) {
    console.error("Submit assignment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit assignment",
    });
  }
};

module.exports = {
  getAssignments,
  submitAssignment,
};