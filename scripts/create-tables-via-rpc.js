// 🚀 Create Tables via Supabase RPC Function
// Run: node scripts/create-tables-via-rpc.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SCHEMA_SQL_PATH = path.join(__dirname, '..', 'supabase-schema.sql');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  db: { schema: 'public' },
  auth: { persistSession: false }
});

async function main() {
  console.log('🚀 ========================================');
  console.log('🚀 إنشاء الجداول via Supabase RPC');
  console.log('🚀 ========================================\n');

  // Read SQL
  const sqlContent = fs.readFileSync(SCHEMA_SQL_PATH, 'utf8');
  
  // Supabase doesn't support raw SQL via RPC without a custom function
  // We need to create the function first or use SQL Editor
  
  console.log('⚠️  Supabase لا يدعم تنفيذ SQL مباشرة عبر RPC');
  console.log('💡 يجب إنشاء RPC function أولاً أو استخدام SQL Editor\n');
  
  console.log('📋 الحل:');
  console.log('   1. اذهب إلى: https://supabase.com/dashboard/project/ebelbztbpzccdhytynnc/sql/new');
  console.log('   2. انسخ محتوى: supabase-schema.sql');
  console.log('   3. الصق واضغط "Run"');
  console.log('   4. بعد الإنشاء، شغّل: node scripts/create-and-seed-via-supabase.js\n');
}

main().catch(console.error);
