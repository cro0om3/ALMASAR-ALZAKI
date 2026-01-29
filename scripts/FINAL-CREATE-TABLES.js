// 🚀 FINAL CREATE TABLES - Tries all methods
// Run: node scripts/FINAL-CREATE-TABLES.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const https = require('https');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
const PROJECT_ID = 'ebelbztbpzccdhytynnc';
const SCHEMA_SQL_PATH = path.join(__dirname, '..', 'supabase-schema.sql');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Method 1: Try Supabase Management API
async function tryManagementAPI(sql) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT_ID}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', (error) => {
      resolve({ status: 500, error: error.message });
    });

    req.write(JSON.stringify({ query: sql }));
    req.end();
  });
}

// Method 2: Try Supabase REST API (won't work for DDL, but let's try)
async function tryRestAPI() {
  // Supabase REST API doesn't support DDL
  return { success: false, reason: 'REST API does not support DDL operations' };
}

// Method 3: Try creating tables via Supabase Client RPC
async function tryRPC() {
  // We can't create RPC function without executing SQL first
  return { success: false, reason: 'Cannot create RPC function without SQL execution' };
}

async function main() {
  try {
    console.log('🚀 ========================================');
    console.log('🚀 FINAL CREATE TABLES - جميع الطرق');
    console.log('🚀 ========================================\n');

    // Read SQL
    const sqlContent = fs.readFileSync(SCHEMA_SQL_PATH, 'utf8');

    // Try Method 1: Management API
    console.log('📤 المحاولة 1: Supabase Management API...');
    const result1 = await tryManagementAPI(sqlContent);
    
    if (result1.status === 200) {
      console.log('✅ نجح! تم إنشاء الجداول عبر Management API\n');
      return;
    } else if (result1.status === 401) {
      console.log('❌ فشل: يتطلب Personal Access Token (PAT)\n');
    } else {
      console.log(`❌ فشل: Status ${result1.status}\n`);
    }

    // Try Method 2: REST API
    console.log('📤 المحاولة 2: Supabase REST API...');
    const result2 = await tryRestAPI();
    console.log(`❌ فشل: ${result2.reason}\n`);

    // Try Method 3: RPC
    console.log('📤 المحاولة 3: Supabase RPC...');
    const result3 = await tryRPC();
    console.log(`❌ فشل: ${result3.reason}\n`);

    // All methods failed
    console.log('❌ جميع الطرق فشلت!\n');
    console.log('💡 الحل الوحيد: استخدام Supabase SQL Editor يدوياً\n');
    console.log('📋 الخطوات:');
    console.log('   1. اذهب إلى: https://supabase.com/dashboard/project/ebelbztbpzccdhytynnc/sql/new');
    console.log('   2. انسخ محتوى: supabase-schema.sql');
    console.log('   3. الصق في SQL Editor');
    console.log('   4. اضغط "Run"\n');
    console.log('   5. بعد الإنشاء، شغّل: node scripts/MASTER-SETUP.js\n');

  } catch (error) {
    console.error('\n❌ خطأ:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
