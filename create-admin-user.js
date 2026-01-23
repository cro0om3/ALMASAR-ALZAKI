// Script to create admin user with PIN code 1234
// Run: node create-admin-user.js

require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...');
    
    // Hash PIN code 1234
    const pinCode = '1234';
    const hashedPin = await bcrypt.hash(pinCode, 10);
    console.log('✅ PIN Code hashed:', hashedPin);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });
    
    if (existingUser) {
      console.log('⚠️  User already exists. Updating PIN code...');
      await prisma.user.update({
        where: { email: 'admin@example.com' },
        data: {
          password: hashedPin,
          role: 'admin',
          name: 'Administrator'
        }
      });
      console.log('✅ User updated successfully!');
    } else {
      // Create new user
      const user = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          name: 'Administrator',
          password: hashedPin,
          role: 'admin'
        }
      });
      console.log('✅ User created successfully!');
      console.log('📋 User details:', {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      });
    }
    
    // Verify the user
    const verifyUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });
    
    if (verifyUser) {
      const isValid = await bcrypt.compare('1234', verifyUser.password);
      console.log('🔍 Verification test:', isValid ? '✅ PIN 1234 works!' : '❌ PIN 1234 does not work');
    }
    
    console.log('\n🎉 Done! You can now login with:');
    console.log('   PIN Code: 1234');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'P2002') {
      console.error('⚠️  User with this email already exists');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
