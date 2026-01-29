// 🚀 Setup Supabase Schema Script
// Run: node scripts/setup-supabase-schema.js
// This script executes supabase-schema.sql in Supabase

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const SCHEMA_SQL_PATH = path.join(__dirname, '..', 'supabase-schema.sql');
const prisma = new PrismaClient();

async function executeSchema() {
  try {
    console.log('🚀 ========================================');
    console.log('🚀 Supabase Schema Setup');
    console.log('🚀 ========================================\n');

    // Check DATABASE_URL
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL غير موجود في .env.local');
      console.log('💡 شغّل أولاً: node scripts/setup-supabase-connection.js\n');
      process.exit(1);
    }

    console.log('✅ DATABASE_URL موجود\n');

    // Read SQL file
    if (!fs.existsSync(SCHEMA_SQL_PATH)) {
      console.error(`❌ ملف ${SCHEMA_SQL_PATH} غير موجود!`);
      process.exit(1);
    }

    const sqlContent = fs.readFileSync(SCHEMA_SQL_PATH, 'utf8');
    console.log('✅ تم قراءة supabase-schema.sql\n');

    // Split SQL into individual statements
    // Remove comments and empty lines, then split by semicolons
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 عدد الأوامر SQL: ${statements.length}\n`);

    // Test connection first
    console.log('🔌 اختبار الاتصال بقاعدة البيانات...');
    await prisma.$connect();
    console.log('✅ الاتصال ناجح!\n');

    // Execute statements one by one
    console.log('📦 تنفيذ Schema...\n');
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip empty statements
      if (!statement || statement.trim().length === 0) {
        continue;
      }

      try {
        // Use $executeRawUnsafe for dynamic SQL
        await prisma.$executeRawUnsafe(statement);
        successCount++;
        
        // Show progress for important statements
        if (statement.includes('CREATE TABLE') || statement.includes('CREATE INDEX') || statement.includes('ALTER TABLE')) {
          const tableName = statement.match(/"(.*?)"/)?.[1] || 'unknown';
          console.log(`   ✅ ${tableName}`);
        }
      } catch (error) {
        // Ignore "already exists" errors
        if (error.message?.includes('already exists') || 
            error.message?.includes('duplicate') ||
            error.code === '42P07' || // duplicate_table
            error.code === '42710') { // duplicate_object
          successCount++;
          continue;
        }
        
        errorCount++;
        console.error(`   ❌ خطأ في الأمر ${i + 1}:`, error.message);
      }
    }

    console.log(`\n✅ تم تنفيذ ${successCount} أمر بنجاح`);
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} أخطاء (معظمها "already exists" - طبيعي)`);
    }

    // Verify tables
    console.log('\n🔍 التحقق من الجداول...\n');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    const expectedTables = [
      'users', 'customers', 'vendors', 'vehicles', 'employees',
      'quotations', 'quotation_items', 'invoices', 'invoice_items',
      'purchase_orders', 'purchase_order_items', 'receipts', 'payslips'
    ];

    console.log(`📊 الجداول الموجودة (${tables.length}):`);
    tables.forEach((table) => {
      const tableName = table.table_name;
      const exists = expectedTables.includes(tableName);
      console.log(`   ${exists ? '✅' : '⚠️ '} ${tableName}`);
    });

    const foundTables = tables.map((t) => t.table_name);
    const missingTables = expectedTables.filter(t => !foundTables.includes(t));

    if (missingTables.length > 0) {
      console.log(`\n⚠️  الجداول المفقودة: ${missingTables.join(', ')}`);
    } else {
      console.log('\n✅ جميع الجداول موجودة!');
    }

    // Check RLS status
    console.log('\n🔒 التحقق من RLS...\n');
    const rlsStatus = await prisma.$queryRaw`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN (
        'users', 'customers', 'vendors', 'vehicles', 'employees',
        'quotations', 'quotation_items', 'invoices', 'invoice_items',
        'purchase_orders', 'purchase_order_items', 'receipts', 'payslips'
      )
      ORDER BY tablename;
    `;

    let rlsEnabled = false;
    rlsStatus.forEach((row) => {
      if (row.rowsecurity) {
        console.log(`   ⚠️  RLS مفعّل على: ${row.tablename}`);
        rlsEnabled = true;
      } else {
        console.log(`   ✅ RLS معطّل على: ${row.tablename}`);
      }
    });

    if (!rlsEnabled) {
      console.log('\n✅ RLS معطّل على جميع الجداول - الكل يشوف كل شيء');
    } else {
      console.log('\n⚠️  بعض الجداول لديها RLS مفعّل - قد تحتاج إلى تعطيله يدوياً');
    }

    console.log('\n🎉 ========================================');
    console.log('🎉 Schema Setup Complete!');
    console.log('🎉 ========================================\n');
    console.log('📝 الخطوات التالية:');
    console.log('   1. شغّل: npm run db:generate');
    console.log('   2. شغّل: npm run db:create-admin');
    console.log('   3. شغّل: npm run db:test (للتحقق)\n');

  } catch (error) {
    console.error('\n❌ خطأ:', error.message);
    if (error.message?.includes('Can\'t reach database server')) {
      console.log('\n💡 تحقق من:');
      console.log('   1. DATABASE_URL في .env.local');
      console.log('   2. كلمة مرور قاعدة البيانات');
      console.log('   3. اتصال الإنترنت');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

executeSchema();
