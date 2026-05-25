const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { authenticate } = require("../middleware/auth");

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: "Invalid email or password" });
    const { password: _, ...out } = user.toObject();
    res.json({ token: sign(user._id), user: out });
  } catch (err) { next(err); }
});

// POST /api/auth/register  (first user free; after that needs existing token)
router.post("/register", async (req, res, next) => {
  try {
    const count = await User.countDocuments();
    if (count > 0 && !req.headers.authorization)
      return res.status(401).json({ error: "Admin auth required" });
    const user = await User.create(req.body);
    const { password: _, ...out } = user.toObject();
    res.status(201).json({ token: sign(user._id), user: out });
  } catch (err) { next(err); }
});

// GET /api/auth/me
router.get("/me", authenticate, (req, res) => res.json({ user: req.user }));

module.exports = router;
