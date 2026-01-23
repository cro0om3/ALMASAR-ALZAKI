// Script to test database connection with Connection Pooling URL
// Run: node test-database-connection.js

require('dotenv').config({ path: '.env.local' });

const SUPABASE_PROJECT_REF = 'tundlptcusiogiaagsba';
const DB_PASSWORD = 'Fhd%23%232992692';

// Connection Pooling URL
const CONNECTION_POOLING_URL = `postgresql://postgres.${SUPABASE_PROJECT_REF}:${DB_PASSWORD}@aws-0-me-central-1.pooler.supabase.com:6543/postgres?sslmode=require`;

// Direct Connection URL
const DIRECT_CONNECTION_URL = `postgresql://postgres:${DB_PASSWORD}@db.${SUPABASE_PROJECT_REF}.supabase.co:5432/postgres?sslmode=require`;

console.log('🧪 Testing Database Connections...\n');

console.log('📋 Connection Pooling URL:');
console.log(`   ${CONNECTION_POOLING_URL}\n`);

console.log('📋 Direct Connection URL:');
console.log(`   ${DIRECT_CONNECTION_URL}\n`);

console.log('💡 Note: To test the actual connection, you need to:');
console.log('   1. Install pg: npm install pg');
console.log('   2. Or use Prisma: npx prisma db pull');
console.log('   3. Or test via API: https://your-app.vercel.app/api/test-db\n');

console.log('✅ Connection strings are ready!');
console.log('⚠️  Make sure to Redeploy your Vercel project after updating DATABASE_URL!');
