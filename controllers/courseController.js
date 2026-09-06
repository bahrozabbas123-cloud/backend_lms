const pool = require("../config/db");

async function getEnrolledCourses(req, res) {
  try {
    const result = await pool.query(
      `SELECT c.id, c.title, c.description, c.created_at, e.enrolled_at,
              instructor.full_name AS instructor,
              COUNT(DISTINCT a.id)::int AS total_assignments,
              COUNT(DISTINCT s.assignment_id)::int AS completed_assignments
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       LEFT JOIN users instructor ON instructor.id = c.instructor_id
       LEFT JOIN assignments a ON a.course_id = c.id
       LEFT JOIN submissions s
         ON s.assignment_id = a.id AND s.student_id = e.student_id
       WHERE e.student_id = $1
       GROUP BY c.id, e.enrolled_at, instructor.full_name
       ORDER BY e.enrolled_at DESC`,
      [req.user.id]
    );

    const courses = result.rows.map((course) => {
      const progress = course.total_assignments === 0
        ? 0
        : Math.round((course.completed_assignments / course.total_assignments) * 100);

      return {
        ...course,
        progress,
        status: progress === 100 ? "completed" : progress > 0 ? "in_progress" : "not_started",
      };
    });

    res.json({ success: true, courses });
  } catch (error) {
    console.error("Get enrolled courses error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch enrolled courses." });
  }
}

module.exports = { getEnrolledCourses };