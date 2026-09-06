const jwt = require('jsonwebtoken');
require('dotenv').config();

// Checks that a valid JWT token was sent
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }
    req.user = user; // { id, email, role }
    next();
  });
}

// Restricts a route to specific roles, e.g. authorize('Admin', 'Team Lead')
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You do not have permission for this action.' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
