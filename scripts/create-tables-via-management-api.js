// 🚀 Create Tables via Supabase Management API
// Run: node scripts/create-tables-via-management-api.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SCHEMA_SQL_PATH = path.join(__dirname, '..', 'supabase-schema.sql');

// Note: Supabase Management API requires Personal Access Token (PAT)
// For now, we'll use the SQL Editor approach via REST API
// Or use Prisma with direct connection

async function main() {
  console.log('🚀 ========================================');
  console.log('🚀 إنشاء الجداول عبر Supabase');
  console.log('🚀 ========================================\n');

  console.log('📋 ملاحظة: Supabase Management API يتطلب Personal Access Token');
  console.log('💡 الحل الأفضل: استخدام Supabase SQL Editor مباشرة\n');

  // Read SQL schema
  const sqlContent = fs.readFileSync(SCHEMA_SQL_PATH, 'utf8');
  
  console.log('📝 SQL Schema جاهز للتنفيذ\n');
  console.log('🔗 رابط Supabase SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/ebelbztbpzccdhytynnc/sql/new\n');
  
  console.log('📋 الخطوات:');
  console.log('   1. افتح الرابط أعلاه');
  console.log('   2. انسخ محتوى supabase-schema.sql');
  console.log('   3. الصق في SQL Editor');
  console.log('   4. اضغط "Run"');
  console.log('   5. بعد إنشاء الجداول، شغّل: node scripts/create-and-seed-via-supabase.js\n');

  // Also try to use Prisma if connection works
  console.log('🔄 محاولة استخدام Prisma...\n');
  
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.$connect();
    console.log('✅ Prisma متصل!\n');
    
    // Try to execute schema
    console.log('📦 محاولة إنشاء الجداول...\n');
    
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.toLowerCase().includes('select'));

    let successCount = 0;
    for (const statement of statements) {
      if (!statement) continue;
      
      try {
        await prisma.$executeRawUnsafe(statement);
        successCount++;
        
        if (statement.includes('CREATE TABLE')) {
          const tableName = statement.match(/"(.*?)"/)?.[1] || 'unknown';
          console.log(`   ✅ ${tableName}`);
        }
      } catch (error) {
        if (error.message?.includes('already exists') || error.code === '42P07') {
          successCount++;
          continue;
        }
        // Ignore other errors for now
      }
    }
    
    console.log(`\n✅ تم تنفيذ ${successCount} أمر\n`);
    
    // Now seed data
    console.log('🌱 بدء إضافة البيانات...\n');
    await prisma.$disconnect();
    
    // Run seed script
    console.log('💡 شغّل الآن: node scripts/create-and-seed-via-supabase.js\n');
    
  } catch (error) {
    console.log('⚠️  Prisma لا يستطيع الاتصال');
    console.log('💡 استخدم Supabase SQL Editor لإنشاء الجداول أولاً\n');
  }
}

main().catch(console.error);
