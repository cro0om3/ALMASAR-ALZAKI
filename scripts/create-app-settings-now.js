// إنشاء جدول app_settings تلقائياً (Management API أو التحقق من وجود الجدول)
// Run: node scripts/create-app-settings-now.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const https = require('https');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_PAT = process.env.SUPABASE_PAT || process.env.SUPABASE_ACCESS_TOKEN || process.env.SUPABASE_PERSONAL_ACCESS_TOKEN;
const PROJECT_REF = SUPABASE_URL ? SUPABASE_URL.replace(/^https:\/\//, '').replace(/\.supabase\.co.*/, '') : 'ebelbztbpzccdhytynnc';
const SQL_PATH = path.join(__dirname, 'create-app-settings-table.sql');

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
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function runSqlViaManagementAPI(sql) {
  const token = SUPABASE_PAT || SUPABASE_SERVICE_KEY;
  if (!token) return { ok: false, status: 0, message: 'No SUPABASE_SERVICE_ROLE_KEY or SUPABASE_PAT' };
  const options = {
    hostname: 'api.supabase.com',
    path: `/v1/projects/${PROJECT_REF}/database/query`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  try {
    const result = await makeRequest(options, { query: sql });
    return { ok: result.status === 200 || result.status === 201, status: result.status, raw: result.raw };
  } catch (e) {
    return { ok: false, status: 0, message: e.message };
  }
}

async function checkTableExists() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return false;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const { data, error } = await supabase.from('app_settings').select('id').limit(1);
  if (error && (error.code === '42P01' || error.message?.includes('does not exist'))) return false;
  return !error;
}

async function main() {
  console.log('========================================');
  console.log('  إنشاء جدول app_settings');
  console.log('========================================\n');

  if (!SUPABASE_URL) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL غير موجود في .env.local');
    process.exit(1);
  }

  const alreadyExists = await checkTableExists();
  if (alreadyExists) {
    console.log('✅ جدول app_settings موجود مسبقاً. لا حاجة لأي إجراء.\n');
    process.exit(0);
  }

  let sqlContent;
  try {
    sqlContent = fs.readFileSync(SQL_PATH, 'utf8');
  } catch (e) {
    console.error('❌ لم يتم العثور على ملف create-app-settings-table.sql');
    process.exit(1);
  }

  console.log('📦 محاولة إنشاء الجدول عبر Management API...\n');
  const result = await runSqlViaManagementAPI(sqlContent);

  if (result.ok) {
    console.log('✅ تم إنشاء جدول app_settings بنجاح.\n');
    process.exit(0);
  }

  if (result.status === 401) {
    console.log('⚠️  Management API رفض المفتاح (يتطلب أحياناً PAT من لوحة Supabase).');
    console.log('   استخدم أحد الخيارين:\n');
    console.log('   (1) تشغيل SQL يدوياً مرة واحدة:');
    console.log('       Dashboard → SQL Editor → New query → الصق المحتوى من:');
    console.log('       scripts/create-app-settings-table.sql\n');
    console.log('   (2) إضافة Personal Access Token في .env.local:');
    console.log('       SUPABASE_PAT=your_pat_from_supabase_account_tokens');
    console.log('       ثم أعد تشغيل: node scripts/create-app-settings-now.js\n');
  } else {
    console.log('⚠️  فشل تنفيذ SQL (Status:', result.status, ')');
    console.log('   نفّذ المحتوى التالي في Supabase → SQL Editor:\n');
    console.log('----------------------------------------');
    console.log(sqlContent);
    console.log('----------------------------------------\n');
  }
  process.exit(1);
}

main().catch((err) => { console.error(err); process.exit(1); });
