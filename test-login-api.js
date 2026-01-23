// Script to test login API
// Run: node test-login-api.js

require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log('🧪 Testing login functionality...\n');
    
    // Get admin user
    const user = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });
    
    if (!user) {
      console.log('❌ Admin user not found!');
      console.log('💡 Run: node create-admin-user.js');
      return;
    }
    
    console.log('✅ Admin user found');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}\n`);
    
    // Test PIN codes
    const testPins = ['1234', '5678', '0000'];
    
    console.log('🔐 Testing PIN codes:');
    for (const pin of testPins) {
      const isValid = await bcrypt.compare(pin, user.password);
      console.log(`   PIN ${pin}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    }
    
    console.log('\n📝 Summary:');
    const pin1234Works = await bcrypt.compare('1234', user.password);
    if (pin1234Works) {
      console.log('✅ PIN Code 1234 is working correctly!');
      console.log('✅ You can login with PIN: 1234');
    } else {
      console.log('❌ PIN Code 1234 is NOT working!');
      console.log('💡 Run: node create-admin-user.js to reset PIN');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
