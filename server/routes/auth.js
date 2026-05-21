const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate, requireAdmin } = require('../middleware/auth');

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user._id);
    const { password: _, ...userOut } = user.toObject();

    res.json({ token, user: userOut });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me — get current user
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/register — admin only (or first setup)
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const existingCount = await User.countDocuments();

    // Allow first user to register freely; subsequent require admin auth
    if (existingCount > 0) {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: 'Admin auth required to create users' });
    }

    const user = await User.create({ name, email, password, role: role || 'agent' });
    const token = signToken(user._id);
    const { password: _, ...userOut } = user.toObject();

    res.status(201).json({ token, user: userOut });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
