// 🚀 Create Tables via Supabase Client using RPC
// Run: node scripts/create-tables-via-supabase-rpc.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SCHEMA_SQL_PATH = path.join(__dirname, '..', 'supabase-schema.sql');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Supabase credentials غير موجودة في .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createTables() {
  try {
    console.log('🚀 ========================================');
    console.log('🚀 إنشاء الجداول عبر Supabase RPC');
    console.log('🚀 ========================================\n');

    // Read SQL file
    console.log('📖 قراءة ملف SQL...');
    const sqlContent = fs.readFileSync(SCHEMA_SQL_PATH, 'utf8');
    console.log('✅ تم قراءة الملف!\n');

    // Create a temporary RPC function to execute SQL
    console.log('🔧 إنشاء RPC function مؤقتة...');
    
    // Split SQL into manageable chunks
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => {
        if (!s || s.length === 0) return false;
        const withoutComments = s.split('\n')
          .filter(line => !line.trim().startsWith('--'))
          .join('\n')
          .trim();
        return withoutComments.length > 0;
      });

    // Create RPC function that executes SQL
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION execute_sql(sql_text TEXT)
      RETURNS TEXT AS $$
      BEGIN
        EXECUTE sql_text;
        RETURN 'Success';
      EXCEPTION WHEN OTHERS THEN
        RETURN 'Error: ' || SQLERRM;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    // Try to create the function via direct SQL execution
    // Since we can't execute DDL directly, we'll use a different approach
    // We'll create tables one by one using Supabase REST API with proper structure

    console.log('⚠️  Supabase Client لا يدعم تنفيذ DDL مباشرة');
    console.log('💡 سنستخدم طريقة بديلة...\n');

    // Alternative: Use Supabase Management API (but requires PAT)
    // Or: Create tables using Supabase REST API structure
    
    // Actually, let's try using the Supabase REST API to create tables
    // by sending proper POST requests to the REST API
    
    console.log('📝 محاولة إنشاء الجداول عبر REST API...\n');

    // Extract table definitions from SQL
    const tableDefinitions = [];
    for (const statement of statements) {
      if (statement.toUpperCase().includes('CREATE TABLE')) {
        const tableMatch = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?"?(\w+)"?/i);
        if (tableMatch) {
          tableDefinitions.push({
            name: tableMatch[1],
            sql: statement
          });
        }
      }
    }

    console.log(`📊 تم العثور على ${tableDefinitions.length} جدول\n`);

    // Unfortunately, Supabase REST API doesn't support DDL operations
    // We need to use the Management API which requires PAT
    
    console.log('❌ Supabase REST API لا يدعم إنشاء الجداول (DDL)');
    console.log('💡 الحل: استخدام Supabase SQL Editor يدوياً أو Management API مع PAT\n');
    
    console.log('📋 الخطوات اليدوية:');
    console.log('   1. اذهب إلى: https://supabase.com/dashboard/project/ebelbztbpzccdhytynnc/sql/new');
    console.log('   2. انسخ محتوى: supabase-schema.sql');
    console.log('   3. الصق في SQL Editor');
    console.log('   4. اضغط "Run"\n');

  } catch (error) {
    console.error('\n❌ خطأ:', error.message);
    process.exit(1);
  }
}

createTables().catch(console.error);
