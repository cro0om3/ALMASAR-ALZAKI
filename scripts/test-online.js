// Test database connection online (from Vercel)
// Run: node test-online.js
// Or: npm run db:test:online

// Get Vercel URL from environment or use default
// You can set it: VERCEL_URL=your-app.vercel.app node test-online.js
const VERCEL_URL = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL?.replace('https://', '') || 'almasar-alzaki.vercel.app';

async function testOnline() {
  const url = `https://${VERCEL_URL}/api/test-db`;
  
  console.log('\n🌐 Testing Database Connection Online...\n');
  console.log('📍 URL:', url);
  console.log('🔌 Connecting...\n');

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.success) {
      console.log('✅ Database connection successful!\n');
      
      console.log('📊 Database Status:');
      console.log('  URL:', data.database?.url || 'N/A');
      console.log('  Connected:', data.database?.connected ? '✅' : '❌');
      
      console.log('\n📋 Tables:');
      console.log('  Total:', data.database?.tables?.total || 0);
      console.log('  Expected:', data.database?.tables?.expected || 0);
      
      if (data.database?.tables?.missing?.length > 0) {
        console.log('  ⚠️  Missing tables:', data.database.tables.missing.join(', '));
      } else {
        console.log('  ✅ All tables exist!');
      }
      
      console.log('\n📊 Data Counts:');
      console.log('  Customers:', data.data?.customers || 0);
      console.log('  Quotations:', data.data?.quotations || 0);
      console.log('  Invoices:', data.data?.invoices || 0);
      console.log('  Employees:', data.data?.employees || 0);
      console.log('  Vehicles:', data.data?.vehicles || 0);
      console.log('  Vendors:', data.data?.vendors || 0);
      
      console.log('\n🎉 All tests passed! Database is ready!\n');
    } else {
      console.error('❌ Database test failed!\n');
      console.error('Error:', data.error);
      console.error('Details:', data.details || 'N/A');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Failed to connect to API!\n');
    console.error('Error:', error.message);
    console.log('\n💡 Solutions:');
    console.log('  1. Make sure your Vercel app is deployed');
    console.log('  2. Replace "your-app.vercel.app" with your actual Vercel URL');
    console.log('  3. Set VERCEL_URL environment variable:');
    console.log('     VERCEL_URL=your-app.vercel.app node test-online.js');
    console.log('  4. Check if DATABASE_URL is set in Vercel Environment Variables');
    process.exit(1);
  }
}

testOnline();
