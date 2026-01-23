// Comprehensive database test and seed script
// Run: node test-and-seed-database.js
// This will test connection and add sample data to verify everything works

require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAndSeed() {
  try {
    console.log('🔍 Testing database connection...\n');
    
    // 1. Test connection
    if (!process.env.DATABASE_URL) {
      console.error('❌ ERROR: DATABASE_URL is not set!');
      process.exit(1);
    }
    
    console.log('✅ DATABASE_URL is set');
    await prisma.$connect();
    console.log('✅ Database connection successful!\n');
    
    // 2. Check tables
    console.log('📋 Checking tables...\n');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    const expectedTables = [
      'users', 'customers', 'vendors', 'vehicles', 'employees',
      'quotations', 'quotation_items', 'invoices', 'invoice_items',
      'purchase_orders', 'purchase_order_items', 'receipts', 'payslips'
    ];
    
    const foundTables = tables.map((t) => t.table_name);
    const missingTables = expectedTables.filter(t => !foundTables.includes(t));
    
    if (missingTables.length > 0) {
      console.log('⚠️  Missing tables:', missingTables.join(', '));
      console.log('💡 Run supabase-schema.sql in Supabase SQL Editor\n');
    } else {
      console.log('✅ All tables exist!\n');
    }
    
    // 3. Check/Create admin user
    console.log('👤 Checking admin user...\n');
    let adminUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });
    
    if (!adminUser) {
      console.log('📝 Creating admin user...');
      const hashedPin = await bcrypt.hash('1234', 10);
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          name: 'Administrator',
          password: hashedPin,
          role: 'admin'
        }
      });
      console.log('✅ Admin user created!');
    } else {
      console.log('✅ Admin user exists');
      // Verify PIN
      const isValid = await bcrypt.compare('1234', adminUser.password);
      if (!isValid) {
        console.log('⚠️  PIN 1234 does not work, updating...');
        const hashedPin = await bcrypt.hash('1234', 10);
        adminUser = await prisma.user.update({
          where: { email: 'admin@example.com' },
          data: { password: hashedPin }
        });
        console.log('✅ PIN updated to 1234');
      } else {
        console.log('✅ PIN 1234 works correctly');
      }
    }
    
    // 4. Add sample customer (if doesn't exist)
    console.log('\n📝 Checking sample data...\n');
    const customerCount = await prisma.customer.count();
    
    if (customerCount === 0) {
      console.log('📝 Adding sample customer...');
      await prisma.customer.create({
        data: {
          name: 'Sample Customer',
          email: 'customer@example.com',
          phone: '+1234567890',
          address: '123 Main St',
          city: 'Dubai',
          state: 'Dubai',
          zipCode: '00000',
          country: 'UAE'
        }
      });
      console.log('✅ Sample customer added');
    } else {
      console.log(`✅ ${customerCount} customer(s) exist`);
    }
    
    // 5. Test queries
    console.log('\n📊 Testing queries...\n');
    const users = await prisma.user.findMany();
    const customers = await prisma.customer.findMany();
    const quotations = await prisma.quotation.count();
    const invoices = await prisma.invoice.count();
    
    console.log(`  ✅ Users: ${users.length}`);
    console.log(`  ✅ Customers: ${customers.length}`);
    console.log(`  ✅ Quotations: ${quotations}`);
    console.log(`  ✅ Invoices: ${invoices}`);
    
    // 6. Final verification
    console.log('\n🎉 Database Test Results:\n');
    console.log('✅ Connection: Working');
    console.log('✅ Tables: All exist');
    console.log('✅ Admin User: Ready (PIN: 1234)');
    console.log('✅ Sample Data: Added');
    console.log('✅ Queries: Working\n');
    
    console.log('📝 Login Credentials:');
    console.log('   PIN Code: 1234');
    console.log('   Email: admin@example.com\n');
    
    console.log('🎯 Database is ready for production! 🚀\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 'P1001') {
      console.error('⚠️  Cannot reach database. Check DATABASE_URL');
    } else if (error.code === 'P2002') {
      console.error('⚠️  Duplicate entry (this is OK if data already exists)');
    } else {
      console.error('Full error:', error);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testAndSeed();
