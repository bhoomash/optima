/**
 * Seed Demo Users
 * Creates default admin, faculty, and student users for testing
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const demoUsers = [
  {
    name: 'System Administrator',
    email: 'admin@university.edu',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'Dr John Smith',
    email: 'john.smith@university.edu',
    password: 'faculty123',
    role: 'faculty'
  },
  {
    name: 'Dr Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    password: 'faculty123',
    role: 'faculty'
  },
  {
    name: 'Alex Student',
    email: 'student@university.edu',
    password: 'student123',
    role: 'student'
  },
  {
    name: 'Emma Wilson',
    email: 'emma.wilson@university.edu',
    password: 'student123',
    role: 'student'
  }
];

async function seedUsers() {
  console.log('🌱 Starting user seeding...\n');

  for (const user of demoUsers) {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, user);
      console.log(`✅ Created ${user.role}: ${user.email}`);
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        console.log(`⏭️  User already exists: ${user.email}`);
      } else {
        console.log(`❌ Failed to create ${user.email}:`, error.response?.data?.message || error.message);
      }
    }
  }

  console.log('\n📋 Demo Credentials:');
  console.log('─'.repeat(50));
  console.log('Admin:   admin@university.edu / admin123');
  console.log('Faculty: john.smith@university.edu / faculty123');
  console.log('Student: student@university.edu / student123');
  console.log('─'.repeat(50));
  console.log('\n✨ User seeding complete!');
}

seedUsers().catch(console.error);
