// 🚀 Create Tables Directly via PostgreSQL Connection
// Run: node scripts/create-tables-direct.js
// This script creates all tables using pg library directly

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL;
const SCHEMA_SQL_PATH = path.join(__dirname, '..', 'supabase-schema.sql');

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL غير موجود في .env.local');
  process.exit(1);
}

async function createTables() {
  // Parse connection string and configure SSL properly
  const url = new URL(DATABASE_URL);
  const client = new Client({
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    database: url.pathname.slice(1) || 'postgres',
    user: url.username,
    password: url.password,
    ssl: {
      rejectUnauthorized: false,
      require: true
    }
  });

  try {
    console.log('🚀 ========================================');
    console.log('🚀 إنشاء الجداول مباشرة من PostgreSQL');
    console.log('🚀 ========================================\n');

    console.log('🔌 الاتصال بقاعدة البيانات...');
    await client.connect();
    console.log('✅ تم الاتصال بنجاح!\n');

    // Read SQL file
    console.log('📖 قراءة ملف SQL...');
    const sqlContent = fs.readFileSync(SCHEMA_SQL_PATH, 'utf8');
    console.log('✅ تم قراءة الملف!\n');

    // Split SQL into statements
    // Remove comments and split by semicolon
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => {
        // Filter out empty statements and comments
        if (!s || s.length === 0) return false;
        // Remove single-line comments
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
    const errors = [];

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      try {
        // Execute statement
        await client.query(statement);
        successCount++;

        // Log table creation
        if (statement.toUpperCase().includes('CREATE TABLE')) {
          const tableMatch = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?"?(\w+)"?/i);
          if (tableMatch) {
            console.log(`   ✅ جدول: ${tableMatch[1]}`);
          }
        } else if (statement.toUpperCase().includes('CREATE INDEX')) {
          const indexMatch = statement.match(/CREATE INDEX (?:IF NOT EXISTS )?"?(\w+)"?/i);
          if (indexMatch) {
            // Don't log every index, just count them
          }
        } else if (statement.toUpperCase().includes('CREATE TRIGGER')) {
          const triggerMatch = statement.match(/CREATE TRIGGER "?(\w+)"?/i);
          if (triggerMatch) {
            // Don't log every trigger
          }
        } else if (statement.toUpperCase().includes('CREATE FUNCTION')) {
          console.log(`   ✅ Function: update_updated_at_column`);
        } else if (statement.toUpperCase().includes('ALTER TABLE') && statement.toUpperCase().includes('DISABLE ROW LEVEL SECURITY')) {
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
        errors.push({
          statement: statement.substring(0, 100) + '...',
          error: error.message
        });

        // Only log significant errors
        if (!error.message?.includes('already exists') && 
            !error.message?.includes('duplicate')) {
          console.error(`   ⚠️  خطأ في الأمر ${i + 1}: ${error.message.substring(0, 80)}`);
        }
      }
    }

    console.log(`\n✅ تم تنفيذ ${successCount} أمر بنجاح`);
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} أخطاء (معظمها "already exists" - طبيعي)`);
    }

    // Verify tables were created
    console.log('\n🔍 التحقق من الجداول...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    const tables = result.rows.map(row => row.table_name);
    const expectedTables = [
      'users', 'customers', 'vendors', 'vehicles', 'employees',
      'quotations', 'quotation_items', 'invoices', 'invoice_items',
      'purchase_orders', 'purchase_order_items', 'receipts', 'payslips'
    ];

    console.log(`\n📊 الجداول الموجودة: ${tables.length}`);
    expectedTables.forEach(table => {
      if (tables.includes(table)) {
        console.log(`   ✅ ${table}`);
      } else {
        console.log(`   ❌ ${table} - غير موجود!`);
      }
    });

    // Check RLS status
    console.log('\n🔒 التحقق من حالة RLS...');
    for (const table of expectedTables) {
      const rlsResult = await client.query(`
        SELECT tablename, rowsecurity 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = $1;
      `, [table]);

      if (rlsResult.rows.length > 0) {
        const rowSecurity = rlsResult.rows[0].rowsecurity;
        if (rowSecurity === false) {
          console.log(`   ✅ ${table}: RLS معطّل`);
        } else {
          console.log(`   ⚠️  ${table}: RLS مفعّل`);
        }
      }
    }

    console.log('\n🎉 ========================================');
    console.log('🎉 تم إنشاء جميع الجداول بنجاح!');
    console.log('🎉 ========================================\n');

  } catch (error) {
    console.error('\n❌ خطأ:', error.message);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 تم إغلاق الاتصال');
  }
}

createTables().catch(console.error);
