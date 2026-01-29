// 🚀 Create Tables via Supabase RPC Function
// Run: node scripts/create-tables-via-rpc-function.js
// This creates a temporary RPC function to execute SQL

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SCHEMA_SQL_PATH = path.join(__dirname, '..', 'supabase-schema.sql');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Supabase credentials غير موجودة');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createTables() {
  try {
    console.log('🚀 ========================================');
    console.log('🚀 إنشاء الجداول عبر RPC Function');
    console.log('🚀 ========================================\n');

    // First, we need to create the RPC function manually via SQL Editor
    // Then we can call it via Supabase Client
    
    // But wait - we can't create the RPC function without executing SQL first!
    // This is a chicken-and-egg problem.
    
    // Alternative: Use Supabase REST API to create tables one by one
    // But Supabase REST API doesn't support DDL operations
    
    console.log('⚠️  Supabase Client لا يدعم تنفيذ DDL مباشرة');
    console.log('⚠️  Supabase REST API لا يدعم إنشاء الجداول');
    console.log('⚠️  Supabase Management API يتطلب PAT\n');
    
    console.log('💡 الحل الوحيد: استخدام Supabase SQL Editor يدوياً\n');
    
    console.log('📋 الخطوات:');
    console.log('   1. اذهب إلى: https://supabase.com/dashboard/project/ebelbztbpzccdhytynnc/sql/new');
    console.log('   2. انسخ محتوى: supabase-schema.sql');
    console.log('   3. الصق في SQL Editor');
    console.log('   4. اضغط "Run"\n');
    
    // Read SQL file to show what needs to be executed
    const sqlContent = fs.readFileSync(SCHEMA_SQL_PATH, 'utf8');
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

    console.log(`📊 عدد الأوامر المطلوبة: ${statements.length}`);
    
    const tableStatements = statements.filter(s => 
      s.toUpperCase().includes('CREATE TABLE')
    );
    
    console.log(`📊 عدد الجداول: ${tableStatements.length}\n`);
    
    tableStatements.forEach((stmt, i) => {
      const tableMatch = stmt.match(/CREATE TABLE (?:IF NOT EXISTS )?"?(\w+)"?/i);
      if (tableMatch) {
        console.log(`   ${i + 1}. ${tableMatch[1]}`);
      }
    });

  } catch (error) {
    console.error('\n❌ خطأ:', error.message);
    process.exit(1);
  }
}

createTables().catch(console.error);
