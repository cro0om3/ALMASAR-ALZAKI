// 🚀 Create Tables via HTTP Requests to Supabase
// Run: node scripts/create-tables-via-http.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_ID = 'ebelbztbpzccdhytynnc';
const SCHEMA_SQL_PATH = path.join(__dirname, '..', 'supabase-schema.sql');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Supabase credentials غير موجودة');
  process.exit(1);
}

// Make HTTP request
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function executeSQLViaManagementAPI(sql) {
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
    return result;
  } catch (error) {
    return { status: 500, error: error.message };
  }
}

async function createTables() {
  try {
    console.log('🚀 ========================================');
    console.log('🚀 إنشاء الجداول عبر Supabase Management API');
    console.log('🚀 ========================================\n');

    // Read SQL file
    console.log('📖 قراءة ملف SQL...');
    const sqlContent = fs.readFileSync(SCHEMA_SQL_PATH, 'utf8');
    console.log('✅ تم قراءة الملف!\n');

    // Try to execute entire SQL
    console.log('📤 إرسال SQL إلى Supabase Management API...');
    const result = await executeSQLViaManagementAPI(sqlContent);

    if (result.status === 200) {
      console.log('✅ تم إنشاء الجداول بنجاح!\n');
      return true;
    } else if (result.status === 401) {
      console.log('❌ خطأ في المصادقة (401)');
      console.log('💡 Management API يتطلب Personal Access Token (PAT)');
      console.log('💡 Service Role Key لا يعمل مع Management API\n');
      return false;
    } else {
      console.log(`❌ خطأ: Status ${result.status}`);
      console.log('Response:', JSON.stringify(result.data, null, 2));
      return false;
    }

  } catch (error) {
    console.error('\n❌ خطأ:', error.message);
    return false;
  }
}

async function main() {
  const success = await createTables();
  
  if (!success) {
    console.log('📋 الحل البديل:');
    console.log('   1. اذهب إلى: https://supabase.com/dashboard/project/ebelbztbpzccdhytynnc/sql/new');
    console.log('   2. انسخ محتوى: supabase-schema.sql');
    console.log('   3. الصق في SQL Editor');
    console.log('   4. اضغط "Run"\n');
    process.exit(1);
  }
}

main().catch(console.error);
