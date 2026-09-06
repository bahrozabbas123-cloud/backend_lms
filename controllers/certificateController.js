const pool = require("../config/db");

async function getCertificates(req, res) {
  try {
    const result = await pool.query(
      `SELECT c.id, c.issued_at, c.course_id, co.title AS course_title,
              u.full_name AS student_name
       FROM certificates c
       JOIN users u ON u.id = c.student_id
       LEFT JOIN courses co ON co.id = c.course_id
       WHERE c.student_id = $1
       ORDER BY c.issued_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, certificates: result.rows });
  } catch (error) {
    console.error("Get certificates error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch certificates." });
  }
}

module.exports = { getCertificates };
