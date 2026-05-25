require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const exists = await User.findOne({ email: "admin@leadflow.com" });
  if (exists) { console.log("Admin already exists: admin@leadflow.com"); process.exit(0); }
  await User.create({ name: "Admin", email: "admin@leadflow.com", password: "Admin@123", role: "admin" });
  console.log("✅ Admin created!\n   Email: admin@leadflow.com\n   Password: Admin@123\n   ⚠️  Change password in production!");
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
