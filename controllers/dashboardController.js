const pool = require("../config/db");

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const enrolledCourses = await pool.query(
      `SELECT COUNT(*) AS count
       FROM enrollments
       WHERE student_id = $1`,
      [userId]
    );

    const pendingAssignments = await pool.query(
      `SELECT COUNT(*) AS count
       FROM assignments a
       JOIN enrollments e ON e.course_id = a.course_id
       WHERE e.student_id = $1
       AND a.id NOT IN (
         SELECT assignment_id
         FROM submissions
         WHERE student_id = $1
       )`,
      [userId]
    );

    const certificates = await pool.query(
      `SELECT COUNT(*) AS count
       FROM certificates
       WHERE student_id = $1`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        enrolledCourses: Number(enrolledCourses.rows[0].count),
        pendingAssignments: Number(pendingAssignments.rows[0].count),
        certificatesEarned: Number(certificates.rows[0].count),
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data.",
    });
  }
};

module.exports = {
  getDashboard,
};