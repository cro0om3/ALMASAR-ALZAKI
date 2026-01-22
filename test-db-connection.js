// Test database connection script
// Run with: node test-db-connection.js

require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL is not set in .env.local');
      process.exit(1);
    }

    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');

    // Test query
    const customerCount = await prisma.customer.count();
    const quotationCount = await prisma.quotation.count();
    const invoiceCount = await prisma.invoice.count();

    console.log('\n📊 Database tables status:');
    console.log(`  - Customers: ${customerCount}`);
    console.log(`  - Quotations: ${quotationCount}`);
    console.log(`  - Invoices: ${invoiceCount}`);

    // List all tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    console.log('\n📋 Available tables:');
    tables.forEach((table: any) => {
      console.log(`  ✅ ${table.table_name}`);
    });

    console.log('\n🎉 Database is ready!');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
