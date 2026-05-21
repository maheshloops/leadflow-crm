require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: 'admin@leadflow.com' });
  if (existing) {
    console.log('Admin already exists. Email: admin@leadflow.com');
    process.exit(0);
  }

  await User.create({
    name: 'Admin',
    email: 'admin@leadflow.com',
    password: 'Admin@123',
    role: 'admin'
  });

  console.log('✅ Admin created!');
  console.log('   Email:    admin@leadflow.com');
  console.log('   Password: Admin@123');
  console.log('   ⚠️  Change this password immediately in production!');
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
