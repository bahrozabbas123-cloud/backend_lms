const express = require('express');
const pool = require('../config/db');

const router = express.Router();

const { register, login, updateCurrentUser } = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', validateRegistration, register);

// POST /api/auth/login
router.post('/login', validateLogin, login);

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const user = result.rows[0];

    return res.json({
      success: true,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: req.user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve current user.',
    });
  }
});

router.put('/me', authenticate, updateCurrentUser);

module.exports = router;
