// 🚀 Create Tables Directly via Supabase Management API
// Run: node scripts/create-tables-direct-api.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SCHEMA_SQL_PATH = path.join(__dirname, '..', 'supabase-schema.sql');
const PROJECT_ID = 'ebelbztbpzccdhytynnc';

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({ 
          status: res.statusCode, 
          headers: res.headers,
          data: body 
        });
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

// Execute SQL via Supabase REST API (PostgREST) - doesn't work for DDL
// We'll use a workaround: create tables via INSERT with proper schema
async function createTablesViaPostgREST() {
  console.log('📦 محاولة إنشاء الجداول عبر PostgREST...\n');
  
  // PostgREST doesn't support CREATE TABLE
  // We need to use SQL Editor or Management API
  console.log('⚠️  PostgREST لا يدعم CREATE TABLE\n');
  return false;
}

// Try Supabase Management API
async function createTablesViaManagementAPI() {
  console.log('📦 محاولة استخدام Management API...\n');
  
  // Management API endpoint for executing SQL
  const options = {
    hostname: 'api.supabase.com',
    path: `/v1/projects/${PROJECT_ID}/database/query`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
    },
  };

  const sqlContent = fs.readFileSync(SCHEMA_SQL_PATH, 'utf8');
  
  try {
    const result = await makeRequest(options, { 
      query: sqlContent,
      timeout: 30000 
    });
    
    if (result.status === 200 || result.status === 201) {
      console.log('✅ تم إنشاء الجداول عبر Management API!\n');
      return true;
    } else {
      console.log(`⚠️  Status: ${result.status}`);
      console.log(`Response: ${result.data.substring(0, 200)}...\n`);
      return false;
    }
  } catch (error) {
    console.log('⚠️  Management API لا يعمل مع Service Key');
    console.log('💡 يتطلب Personal Access Token (PAT)\n');
    return false;
  }
}

// Use Prisma to create tables
async function createTablesViaPrisma() {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    console.log('🔌 محاولة الاتصال...');
    await prisma.$connect();
    console.log('✅ Prisma متصل!\n');
    
    const sqlContent = fs.readFileSync(SCHEMA_SQL_PATH, 'utf8');
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.toLowerCase().includes('select'));

    console.log(`📦 تنفيذ ${statements.length} أمر SQL...\n`);
    
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
        // Only show errors for CREATE statements
        if (statement.includes('CREATE')) {
          console.error(`   ⚠️  ${error.message.substring(0, 60)}...`);
        }
      }
    }
    
    console.log(`\n✅ تم تنفيذ ${successCount} أمر\n`);
    
    // Verify tables
    const tables = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    console.log(`📊 الجداول الموجودة: ${tables.length}\n`);
    const foundTables = tables.map((t) => t.table_name);
    foundTables.forEach(table => console.log(`   ✅ ${table}`));
    
    const expectedTables = [
      'users', 'customers', 'vendors', 'vehicles', 'employees',
      'quotations', 'quotation_items', 'invoices', 'invoice_items',
      'purchase_orders', 'purchase_order_items', 'receipts', 'payslips'
    ];
    
    const missing = expectedTables.filter(t => !foundTables.includes(t));
    if (missing.length === 0) {
      console.log('\n✅ جميع الجداول موجودة!\n');
      await prisma.$disconnect();
      return true;
    } else {
      console.log(`\n⚠️  الجداول المفقودة: ${missing.join(', ')}\n`);
      await prisma.$disconnect();
      return false;
    }
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    if (error.message?.includes('Can\'t reach database server')) {
      console.log('\n💡 المشكلة: لا يمكن الاتصال بقاعدة البيانات');
      console.log('   تحقق من:');
      console.log('   1. كلمة مرور قاعدة البيانات');
      console.log('   2. DATABASE_URL في .env.local');
      console.log('   3. اتصال الإنترنت\n');
    }
    return false;
  }
}

async function main() {
  console.log('🚀 ========================================');
  console.log('🚀 إنشاء الجداول مباشرة');
  console.log('🚀 ========================================\n');

  // Try Management API first
  const method1 = await createTablesViaManagementAPI();
  if (method1) {
    console.log('✅ نجح عبر Management API!\n');
    return;
  }

  // Try Prisma
  const method2 = await createTablesViaPrisma();
  if (method2) {
    console.log('✅ نجح عبر Prisma!\n');
    console.log('🌱 الآن شغّل: node scripts/create-and-seed-via-supabase.js\n');
    return;
  }

  // Fallback: Manual instructions
  console.log('⚠️  فشلت جميع الطرق التلقائية\n');
  console.log('📋 الحل اليدوي:');
  console.log('   1. اذهب إلى: https://supabase.com/dashboard/project/ebelbztbpzccdhytynnc/sql/new');
  console.log('   2. انسخ محتوى: supabase-schema.sql');
  console.log('   3. الصق في SQL Editor');
  console.log('   4. اضغط "Run"');
  console.log('   5. بعد الإنشاء، شغّل: node scripts/create-and-seed-via-supabase.js\n');
}

main().catch(console.error);
