// 🚀 Setup via Supabase Management API
// Run: node scripts/setup-via-supabase-api.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_ID = 'ebelbztbpzccdhytynnc';
const SCHEMA_SQL_PATH = path.join(__dirname, '..', 'supabase-schema.sql');

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

// Try Supabase Management API v1
async function executeSQLViaManagementAPI(sql) {
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

  try {
    const result = await makeRequest(options, { query: sql });
    return result;
  } catch (error) {
    return { status: 500, error: error.message };
  }
}

async function main() {
  console.log('🚀 ========================================');
  console.log('🚀 Setup via Supabase Management API');
  console.log('🚀 ========================================\n');

  const sqlContent = fs.readFileSync(SCHEMA_SQL_PATH, 'utf8');
  
  console.log('📦 محاولة تنفيذ SQL via Management API...\n');
  const result = await executeSQLViaManagementAPI(sqlContent);
  
  if (result.status === 200 || result.status === 201) {
    console.log('✅ نجح!\n');
    console.log('🌱 الآن شغّل: node scripts/create-and-seed-via-supabase.js\n');
  } else {
    console.log(`⚠️  Status: ${result.status}`);
    console.log(`Response: ${result.data?.substring(0, 200) || 'No response'}...\n`);
    console.log('💡 Management API يتطلب Personal Access Token (PAT)');
    console.log('📋 الحل: استخدم Supabase SQL Editor مباشرة\n');
    console.log('🔗 رابط: https://supabase.com/dashboard/project/ebelbztbpzccdhytynnc/sql/new\n');
  }
}

main().catch(console.error);
