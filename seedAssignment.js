const pool = require("./config/db");

async function seed() {
  try {
    const course = await pool.query(`
      INSERT INTO courses (title, description)
      VALUES (
        'Web Development Fundamentals',
        'Learn HTML, CSS, JavaScript and React.'
      )
      RETURNING id
    `);

    const courseId = course.rows[0].id;

    const assignment = await pool.query(
      `
      INSERT INTO assignments
      (course_id, title, description, due_date)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        courseId,
        "HTML & CSS Basics",
        "Create a responsive webpage using HTML and CSS.",
        "2026-08-28 23:59:00",
      ]
    );

    console.log("Course created:", courseId);
    console.log("Assignment created:", assignment.rows[0]);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await pool.end();
  }
}

seed();