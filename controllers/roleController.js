const pool = require('../config/db');

// GET /api/roles - list all roles (Student, Instructor, Team Lead, Admin)
async function getRoles(req, res) {
  try {
    const result = await pool.query('SELECT * FROM roles ORDER BY id');
    res.json({ success: true, roles: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching roles.' });
  }
}

// PUT /api/roles/assign - Admin/Team Lead assigns a role to a user
async function assignRole(req, res) {
  const { user_id, role_id } = req.body;

  if (!user_id || !role_id) {
    return res.status(400).json({ success: false, message: 'user_id and role_id are required.' });
  }

  try {
    const roleCheck = await pool.query('SELECT * FROM roles WHERE id = $1', [role_id]);
    if (roleCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Role not found.' });
    }

    const result = await pool.query(
      'UPDATE users SET role_id = $1 WHERE id = $2 RETURNING id, full_name, email, role_id',
      [role_id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error assigning role.' });
  }
}

// GET /api/roles/users - list all users with their roles (Admin/Team Lead only)
async function getUsersWithRoles(req, res) {
  try {
    const result = await pool.query(
      `SELECT u.id, u.full_name, u.email, r.name AS role
       FROM users u JOIN roles r ON u.role_id = r.id
       ORDER BY u.id`
    );
    res.json({ success: true, users: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching users.' });
  }
}

module.exports = { getRoles, assignRole, getUsersWithRoles };
