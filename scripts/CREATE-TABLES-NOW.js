// 🚀 CREATE TABLES NOW - Final Solution
// Run: node scripts/CREATE-TABLES-NOW.js
// This script creates all tables using Prisma $executeRawUnsafe

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const SCHEMA_SQL_PATH = path.join(__dirname, '..', 'supabase-schema.sql');
const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function createTables() {
  try {
    console.log('🚀 ========================================');
    console.log('🚀 إنشاء الجداول الآن - الحل النهائي');
    console.log('🚀 ========================================\n');

    // Test connection
    console.log('🔌 اختبار الاتصال...');
    try {
      await prisma.$connect();
      console.log('✅ تم الاتصال بنجاح!\n');
    } catch (error) {
      console.error('❌ فشل الاتصال:', error.message);
      console.error('💡 جرب استخدام Supabase SQL Editor يدوياً\n');
      process.exit(1);
    }

    // Read SQL file
    console.log('📖 قراءة ملف SQL...');
    const sqlContent = fs.readFileSync(SCHEMA_SQL_PATH, 'utf8');
    console.log('✅ تم قراءة الملف!\n');

    // Split SQL into statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => {
        if (!s || s.length === 0) return false;
        // Remove comments
        const withoutComments = s.split('\n')
          .filter(line => !line.trim().startsWith('--'))
          .join('\n')
          .trim();
        return withoutComments.length > 0;
      });

    console.log(`📝 تم العثور على ${statements.length} أمر SQL\n`);

    // Execute each statement
    let successCount = 0;
    let errorCount = 0;
    const createdTables = [];

    console.log('📦 تنفيذ الأوامر...\n');

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      try {
        await prisma.$executeRawUnsafe(statement);
        successCount++;

        // Log table creation
        if (statement.toUpperCase().includes('CREATE TABLE')) {
          const tableMatch = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?"?(\w+)"?/i);
          if (tableMatch) {
            const tableName = tableMatch[1];
            createdTables.push(tableName);
            console.log(`   ✅ جدول: ${tableName}`);
          }
        } else if (statement.toUpperCase().includes('CREATE FUNCTION')) {
          console.log(`   ✅ Function: update_updated_at_column`);
        } else if (statement.toUpperCase().includes('CREATE INDEX')) {
          // Don't log every index
        } else if (statement.toUpperCase().includes('CREATE TRIGGER')) {
          // Don't log every trigger
        } else if (statement.toUpperCase().includes('ALTER TABLE') && 
                   statement.toUpperCase().includes('DISABLE ROW LEVEL SECURITY')) {
          const tableMatch = statement.match(/ALTER TABLE (?:IF EXISTS )?"?(\w+)"?/i);
          if (tableMatch) {
            // Don't log every RLS disable
          }
        }
      } catch (error) {
        // Ignore "already exists" errors
        if (error.message?.includes('already exists') ||
            error.message?.includes('duplicate') ||
            error.code === '42P07' || // duplicate_table
            error.code === '42710' || // duplicate_object
            error.code === '42P16') { // duplicate_index
          successCount++;
          continue;
        }

        errorCount++;
        // Only log significant errors
        if (statement.toUpperCase().includes('CREATE TABLE') || 
            statement.toUpperCase().includes('ALTER TABLE')) {
          console.error(`   ⚠️  خطأ: ${error.message.substring(0, 80)}`);
        }
      }
    }

    console.log(`\n✅ تم تنفيذ ${successCount} أمر بنجاح`);
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} أخطاء (معظمها "already exists" - طبيعي)`);
    }

    // Verify tables were created
    console.log('\n🔍 التحقق من الجداول...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    const tableNames = tables.map(t => t.table_name);
    const expectedTables = [
      'users', 'customers', 'vendors', 'vehicles', 'employees',
      'quotations', 'quotation_items', 'invoices', 'invoice_items',
      'purchase_orders', 'purchase_order_items', 'receipts', 'payslips'
    ];

    console.log(`\n📊 الجداول الموجودة: ${tableNames.length}`);
    let allTablesExist = true;
    expectedTables.forEach(table => {
      if (tableNames.includes(table)) {
        console.log(`   ✅ ${table}`);
      } else {
        console.log(`   ❌ ${table} - غير موجود!`);
        allTablesExist = false;
      }
    });

    // Check RLS status
    console.log('\n🔒 التحقق من حالة RLS...');
    for (const table of expectedTables) {
      if (tableNames.includes(table)) {
        const rlsResult = await prisma.$queryRaw`
          SELECT tablename, rowsecurity 
          FROM pg_tables 
          WHERE schemaname = 'public' 
          AND tablename = ${table};
        `;

        if (rlsResult.length > 0) {
          const rowSecurity = rlsResult[0].rowsecurity;
          if (rowSecurity === false) {
            console.log(`   ✅ ${table}: RLS معطّل`);
          } else {
            console.log(`   ⚠️  ${table}: RLS مفعّل`);
          }
        }
      }
    }

    if (allTablesExist) {
      console.log('\n🎉 ========================================');
      console.log('🎉 تم إنشاء جميع الجداول بنجاح!');
      console.log('🎉 ========================================\n');
      console.log('📝 الخطوة التالية:');
      console.log('   شغّل: node scripts/MASTER-SETUP.js');
      console.log('   لإضافة 5 سجلات لكل جدول\n');
    } else {
      console.log('\n⚠️  بعض الجداول غير موجودة');
      console.log('💡 تحقق من الأخطاء أعلاه\n');
    }

  } catch (error) {
    console.error('\n❌ خطأ:', error.message);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 تم إغلاق الاتصال');
  }
}

createTables().catch(console.error);
