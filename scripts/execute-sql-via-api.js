// 🚀 Execute SQL via Supabase Management API
// Run: node scripts/execute-sql-via-api.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SCHEMA_SQL_PATH = path.join(__dirname, '..', 'supabase-schema.sql');

// Extract project ID from URL
const PROJECT_ID = SUPABASE_URL?.replace('https://', '').replace('.supabase.co', '') || 'ebelbztbpzccdhytynnc';

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed, raw: body });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

// Try to execute SQL via Supabase REST API (PostgREST)
async function executeSQLViaPostgREST(sql) {
  // Supabase PostgREST doesn't support raw SQL
  // We need to use the SQL Editor or Management API
  console.log('⚠️  Supabase REST API لا يدعم تنفيذ SQL مباشرة\n');
  return false;
}

// Try Management API (requires PAT, not Service Key)
async function executeSQLViaManagementAPI(sql) {
  console.log('📋 محاولة استخدام Management API...\n');
  
  // Management API endpoint
  const url = `https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`;
  
  const options = {
    hostname: 'api.supabase.com',
    path: `/v1/projects/${PROJECT_ID}/database/query`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
  };

  try {
    const result = await makeRequest(options, { query: sql });
    if (result.status === 200 || result.status === 201) {
      return true;
    }
    console.log(`⚠️  Status: ${result.status}`);
    return false;
  } catch (error) {
    console.log('⚠️  Management API لا يعمل مع Service Key');
    console.log('💡 يتطلب Personal Access Token (PAT)\n');
    return false;
  }
}

async function main() {
  console.log('🚀 ========================================');
  console.log('🚀 تنفيذ SQL عبر Supabase API');
  console.log('🚀 ========================================\n');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Supabase credentials غير موجودة');
    process.exit(1);
  }

  console.log(`📋 Project ID: ${PROJECT_ID}\n`);

  // Read SQL
  const sqlContent = fs.readFileSync(SCHEMA_SQL_PATH, 'utf8');
  console.log('✅ تم قراءة SQL Schema\n');

  // Try different methods
  console.log('🔄 محاولة طرق مختلفة...\n');

  // Method 1: Management API
  const method1 = await executeSQLViaManagementAPI(sqlContent);
  if (method1) {
    console.log('✅ نجح عبر Management API!\n');
    return;
  }

  // Method 2: Use Prisma with direct connection
  console.log('🔄 محاولة Prisma...\n');
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Test connection first
    await prisma.$connect();
    console.log('✅ Prisma متصل!\n');
    
    // Execute SQL statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.toLowerCase().includes('select'));

    console.log(`📝 عدد الأوامر: ${statements.length}\n`);
    console.log('📦 تنفيذ الجداول...\n');

    let successCount = 0;
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      try {
        await prisma.$executeRawUnsafe(statement);
        successCount++;
        
        if (statement.includes('CREATE TABLE')) {
          const tableName = statement.match(/"(.*?)"/)?.[1] || 'unknown';
          console.log(`   ✅ ${tableName}`);
        }
      } catch (error) {
        if (error.message?.includes('already exists') || 
            error.message?.includes('duplicate') ||
            error.code === '42P07' || 
            error.code === '42710') {
          successCount++;
          continue;
        }
        // Show error for important statements
        if (statement.includes('CREATE TABLE') || statement.includes('ALTER TABLE')) {
          console.error(`   ⚠️  ${error.message.substring(0, 60)}...`);
        }
      }
    }

    console.log(`\n✅ تم تنفيذ ${successCount} أمر بنجاح\n`);
    
    // Verify tables
    console.log('🔍 التحقق من الجداول...\n');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    const expectedTables = [
      'users', 'customers', 'vendors', 'vehicles', 'employees',
      'quotations', 'quotation_items', 'invoices', 'invoice_items',
      'purchase_orders', 'purchase_order_items', 'receipts', 'payslips'
    ];

    const foundTables = tables.map((t) => t.table_name);
    const missingTables = expectedTables.filter(t => !foundTables.includes(t));

    console.log(`📊 الجداول الموجودة: ${foundTables.length}`);
    foundTables.forEach(table => {
      console.log(`   ✅ ${table}`);
    });

    if (missingTables.length > 0) {
      console.log(`\n⚠️  الجداول المفقودة: ${missingTables.join(', ')}`);
    } else {
      console.log('\n✅ جميع الجداول موجودة!\n');
      
      // Now seed data
      console.log('🌱 بدء إضافة البيانات...\n');
      await prisma.$disconnect();
      
      // Import and run seed script
      const { execSync } = require('child_process');
      execSync('node scripts/create-and-seed-via-supabase.js', { stdio: 'inherit' });
    }

    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    if (error.message?.includes('Can\'t reach database server')) {
      console.log('\n💡 الحل:');
      console.log('   1. تحقق من كلمة مرور قاعدة البيانات');
      console.log('   2. استخدم Supabase SQL Editor مباشرة:');
      console.log('      https://supabase.com/dashboard/project/ebelbztbpzccdhytynnc/sql/new');
      console.log('   3. انسخ supabase-schema.sql والصقه في SQL Editor\n');
    }
  }
}

main().catch(console.error);
