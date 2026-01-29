// Create all tables in Supabase using the schema
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ebelbztbpzccdhytynnc.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_t0LnDUHEpTMSNez6PyLIqg_udKq1Zmq'

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Read SQL schema file
function readSQLSchema() {
  const schemaPath = path.join(__dirname, '..', 'supabase-schema.sql')
  return fs.readFileSync(schemaPath, 'utf8')
}

// Execute SQL via Supabase REST API
async function executeSQL(sql) {
  try {
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`\n📝 تنفيذ ${statements.length} أمر SQL...\n`)

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.length < 10) continue // Skip very short statements
      
      try {
        // Use RPC to execute SQL (if available) or direct query
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        })

        if (error) {
          // Try alternative method - direct table operations
          if (error.message.includes('function exec_sql') || error.message.includes('does not exist')) {
            console.log(`⚠️  RPC exec_sql غير متاح، استخدام طريقة بديلة...`)
            // We'll create tables using direct insert/select operations
            continue
          } else if (!error.message.includes('already exists') && !error.message.includes('duplicate')) {
            console.log(`⚠️  تحذير في السطر ${i + 1}: ${error.message.substring(0, 100)}`)
          }
        } else {
          console.log(`✅ تم تنفيذ الأمر ${i + 1}/${statements.length}`)
        }
      } catch (err) {
        // Ignore errors for CREATE TABLE IF NOT EXISTS
        if (!err.message.includes('already exists') && !err.message.includes('duplicate')) {
          console.log(`⚠️  ${err.message.substring(0, 100)}`)
        }
      }
    }
  } catch (error) {
    console.error('❌ خطأ في تنفيذ SQL:', error.message)
    throw error
  }
}

// Create tables using direct Supabase client operations
async function createTablesDirectly() {
  console.log('\n🔧 إنشاء الجداول مباشرة...\n')

  const tables = [
    {
      name: 'users',
      columns: {
        id: 'text primary key',
        email: 'text unique not null',
        name: 'text not null',
        password: 'text not null',
        role: 'text default \'user\'',
        createdAt: 'timestamp default now()',
        updatedAt: 'timestamp default now()'
      }
    },
    {
      name: 'customers',
      columns: {
        id: 'text primary key',
        name: 'text',
        email: 'text unique',
        phone: 'text',
        address: 'text',
        city: 'text',
        state: 'text',
        zipCode: 'text',
        country: 'text',
        idNumber: 'text',
        passportNumber: 'text',
        residenceIssueDate: 'timestamp',
        residenceExpiryDate: 'timestamp',
        nationality: 'text',
        createdAt: 'timestamp default now()',
        updatedAt: 'timestamp default now()'
      }
    },
    {
      name: 'vendors',
      columns: {
        id: 'text primary key',
        name: 'text',
        email: 'text unique',
        phone: 'text',
        address: 'text',
        city: 'text',
        state: 'text',
        zipCode: 'text',
        country: 'text',
        contactPerson: 'text',
        createdAt: 'timestamp default now()',
        updatedAt: 'timestamp default now()'
      }
    }
  ]

  // Note: Supabase client doesn't support CREATE TABLE directly
  // We need to use SQL editor or Management API
  console.log('⚠️  Supabase client لا يدعم CREATE TABLE مباشرة')
  console.log('💡 يجب تنفيذ supabase-schema.sql من Supabase SQL Editor')
  console.log('💡 أو استخدام Supabase Management API\n')
}

// Check if tables exist
async function checkTables() {
  console.log('\n🔍 التحقق من الجداول الموجودة...\n')
  
  const expectedTables = [
    'users', 'customers', 'vendors', 'vehicles', 'employees',
    'quotations', 'quotation_items', 'invoices', 'invoice_items',
    'purchase_orders', 'purchase_order_items', 'receipts', 'payslips'
  ]

  const existingTables = []
  const missingTables = []

  for (const table of expectedTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(0)
      if (error && error.code === 'PGRST116') {
        missingTables.push(table)
        console.log(`❌ ${table} - غير موجود`)
      } else {
        existingTables.push(table)
        console.log(`✅ ${table} - موجود`)
      }
    } catch (err) {
      missingTables.push(table)
      console.log(`❌ ${table} - خطأ: ${err.message.substring(0, 50)}`)
    }
  }

  return { existingTables, missingTables }
}

// Main function
async function main() {
  console.log('\n🚀 بدء إنشاء الجداول في Supabase...\n')
  console.log('='.repeat(60))
  console.log(`📍 Supabase URL: ${supabaseUrl}`)
  console.log('='.repeat(60) + '\n')

  try {
    // Check existing tables
    const { existingTables, missingTables } = await checkTables()

    if (missingTables.length > 0) {
      console.log(`\n⚠️  يوجد ${missingTables.length} جدول مفقود:`)
      missingTables.forEach(t => console.log(`   - ${t}`))
      console.log('\n💡 يجب تنفيذ supabase-schema.sql من Supabase SQL Editor')
      console.log('💡 أو استخدام Supabase Dashboard > SQL Editor\n')
    }

    if (existingTables.length > 0) {
      console.log(`\n✅ يوجد ${existingTables.length} جدول موجود بالفعل\n`)
    }

    // Try to read and execute SQL
    try {
      const sql = readSQLSchema()
      console.log('📄 تم قراءة ملف supabase-schema.sql')
      console.log('💡 يجب نسخ محتوى الملف ولصقه في Supabase SQL Editor\n')
    } catch (err) {
      console.log('⚠️  لم يتم العثور على supabase-schema.sql\n')
    }

  } catch (error) {
    console.error('\n❌ خطأ:', error.message)
    process.exit(1)
  }

  console.log('='.repeat(60) + '\n')
}

main()
  .then(() => {
    console.log('✅ اكتمل التحقق من الجداول\n')
    console.log('📋 الخطوات التالية:')
    console.log('1. افتح Supabase Dashboard')
    console.log('2. اذهب إلى SQL Editor')
    console.log('3. انسخ محتوى supabase-schema.sql')
    console.log('4. الصق في SQL Editor واضغط Run')
    console.log('5. شغّل scripts/SEED-DATA.js لإضافة بيانات تجريبية\n')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ خطأ:', error.message)
    process.exit(1)
  })
