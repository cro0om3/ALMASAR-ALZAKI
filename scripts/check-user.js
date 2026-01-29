// Script to check if admin user exists and verify PIN code
// Run: node check-user.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    console.log('🔍 Checking users in database...\n');
    
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (users.length === 0) {
      console.log('❌ No users found in database!');
      console.log('💡 Run: node create-admin-user.js to create admin user');
      return;
    }
    
    console.log(`✅ Found ${users.length} user(s) in database:\n`);
    
    // Check each user
    for (const user of users) {
      console.log('📋 User Details:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   Password Hash: ${user.password ? '✅ Exists' : '❌ Missing'}`);
      
      // Test PIN code 1234
      if (user.password) {
        const testPin = '1234';
        const isValid = await bcrypt.compare(testPin, user.password);
        console.log(`   PIN 1234 Test: ${isValid ? '✅ Works!' : '❌ Does not work'}`);
        
        if (isValid && user.email === 'admin@example.com') {
          console.log(`\n🎉 Admin user is ready!`);
          console.log(`   Login with PIN Code: 1234`);
        }
      }
      console.log('');
    }
    
    // Check specifically for admin user
    const adminUser = users.find(u => u.email === 'admin@example.com');
    if (!adminUser) {
      console.log('⚠️  Admin user (admin@example.com) not found!');
      console.log('💡 Run: node create-admin-user.js to create admin user');
    } else {
      console.log('✅ Admin user exists!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'P1001') {
      console.error('⚠️  Cannot reach database. Check DATABASE_URL in .env.local');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
