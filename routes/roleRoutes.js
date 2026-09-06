const express = require('express');
const router = express.Router();
const { getRoles, assignRole, getUsersWithRoles } = require('../controllers/roleController');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/roles - any logged-in user can view the list of roles
router.get('/', authenticate, getRoles);

// GET /api/roles/users - only Admin or Team Lead can see all users
router.get('/users', authenticate, authorize('Admin', 'Team Lead'), getUsersWithRoles);

// PUT /api/roles/assign - only Admin or Team Lead can change a user's role
router.put('/assign', authenticate, authorize('Admin', 'Team Lead'), assignRole);

module.exports = router;
