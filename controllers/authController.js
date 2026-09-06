const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

// POST /api/auth/register
async function register(req, res) {
  const { full_name, email, password } = req.body;

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    // New users default to the "Student" role (role_id = 1)
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role_id)
       VALUES ($1, $2, $3, 1)
       RETURNING id, full_name, email, role_id`,
      [full_name, email, password_hash]
    );

    return res.status(201).json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.password_hash, r.name AS role
       FROM users u JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      token,
      user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
}

async function updateCurrentUser(req, res) {
  const { full_name, email } = req.body;

  if (!full_name || !email) {
    return res.status(400).json({ success: false, message: "full_name and email are required." });
  }

  try {
    const result = await pool.query(
      `UPDATE users
       SET full_name = $1, email = $2
       WHERE id = $3
       RETURNING id, full_name, email`,
      [full_name.trim(), email.trim().toLowerCase(), req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.json({ success: true, user: { ...result.rows[0], role: req.user.role } });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ success: false, message: "That email is already in use." });
    }
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update profile." });
  }
}

module.exports = { register, login, updateCurrentUser };
