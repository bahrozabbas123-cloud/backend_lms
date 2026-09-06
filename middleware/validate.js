// BONUS CHALLENGE: rejects malformed registration requests with clear error messages

function validateRegistration(req, res, next) {
  const { full_name, email, password } = req.body;
  const errors = [];

  if (!full_name || full_name.trim().length < 2) {
    errors.push('full_name is required and must be at least 2 characters.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('A valid email is required.');
  }

  if (!password || password.length < 6) {
    errors.push('password is required and must be at least 6 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  if (!email) errors.push('email is required.');
  if (!password) errors.push('password is required.');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
}

module.exports = { validateRegistration, validateLogin };
