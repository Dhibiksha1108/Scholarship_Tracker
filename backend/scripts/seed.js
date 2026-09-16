const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Scholarship = require('../models/Scholarship');
const Wishlist = require('../models/Wishlist');

dotenv.config();

const users = [
  {
    name: 'Default Admin',
    email: 'admin@tracker.com',
    password: 'admin123',
    college: 'Ministry of Education',
    course: 'Administration',
    role: 'Admin',
  },
  {
    name: 'Aravind Kumar',
    email: 'student@tracker.com',
    password: 'student123',
    college: 'IIT Madras',
    course: 'B.Tech Computer Science',
    role: 'Student',
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/scholarship_tracker');
    console.log('Connected to MongoDB for seeding...');

    // Clear all existing data
    await User.deleteMany();
    await Scholarship.deleteMany();
    await Wishlist.deleteMany();
    console.log('Cleared all collections (User, Scholarship, Wishlist).');

    // Seed only user profiles
    const createdUsers = await User.create(users);
    console.log(`Seeded ${createdUsers.length} users successfully.`);
    console.log(`- Admin: admin@tracker.com (password: admin123)`);
    console.log(`- Student: student@tracker.com (password: student123)`);
    console.log('Scholarships collection left completely empty.');

    console.log('Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
