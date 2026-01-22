// Simple database connection test
// Run: node test-db.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testDatabase() {
  console.log('\n🔍 Testing Supabase Database Connection...\n');
  
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('❌ ERROR: DATABASE_URL is not set!');
      console.log('\n💡 Solution:');
      console.log('   1. Create .env.local file');
      console.log('   2. Add: DATABASE_URL="postgresql://postgres:Fhd%402992692Fhd@db.tundlptcusiogiaagsba.supabase.co:5432/postgres"');
      process.exit(1);
    }

    console.log('✅ DATABASE_URL is set');
    console.log('🔌 Connecting to database...\n');

    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful!\n');

    // Test if tables exist
    console.log('📋 Checking tables...\n');
    
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    const expectedTables = [
      'users',
      'customers',
      'vendors',
      'vehicles',
      'employees',
      'quotations',
      'quotation_items',
      'invoices',
      'invoice_items',
      'purchase_orders',
      'purchase_order_items',
      'receipts',
      'payslips'
    ];

    console.log(`Found ${tables.length} tables:\n`);
    
    const foundTables = tables.map((t: any) => t.table_name);
    let allTablesExist = true;

    expectedTables.forEach(table => {
      if (foundTables.includes(table)) {
        console.log(`  ✅ ${table}`);
      } else {
        console.log(`  ❌ ${table} - MISSING!`);
        allTablesExist = false;
      }
    });

    if (!allTablesExist) {
      console.log('\n⚠️  Some tables are missing!');
      console.log('💡 Solution: Run the SQL from supabase-schema.sql in Supabase SQL Editor');
      process.exit(1);
    }

    // Test queries
    console.log('\n📊 Testing queries...\n');
    
    const customerCount = await prisma.customer.count();
    const quotationCount = await prisma.quotation.count();
    const invoiceCount = await prisma.invoice.count();
    const employeeCount = await prisma.employee.count();
    const vehicleCount = await prisma.vehicle.count();

    console.log('  ✅ Customers table:', customerCount, 'records');
    console.log('  ✅ Quotations table:', quotationCount, 'records');
    console.log('  ✅ Invoices table:', invoiceCount, 'records');
    console.log('  ✅ Employees table:', employeeCount, 'records');
    console.log('  ✅ Vehicles table:', vehicleCount, 'records');

    console.log('\n🎉 All tests passed! Database is ready to use!\n');
    
  } catch (error: any) {
    console.error('\n❌ Database test failed!\n');
    console.error('Error:', error.message);
    
    if (error.message.includes('does not exist')) {
      console.log('\n💡 Solution:');
      console.log('   1. Go to Supabase SQL Editor');
      console.log('   2. Copy content from supabase-schema.sql');
      console.log('   3. Paste and run in SQL Editor');
    } else if (error.message.includes('connection')) {
      console.log('\n💡 Solution:');
      console.log('   1. Check DATABASE_URL in .env.local');
      console.log('   2. Make sure Supabase project is active');
      console.log('   3. Check your internet connection');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
