// Script to verify database connection and data
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.log('\n📋 Required variables:')
  console.log('  - NEXT_PUBLIC_SUPABASE_URL')
  console.log('  - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function checkDatabase() {
  console.log('\n🔍 التحقق من قاعدة البيانات...\n')
  console.log('📍 Supabase URL:', supabaseUrl)
  console.log('🔑 Service Key:', supabaseServiceKey.substring(0, 20) + '...')
  console.log('\n' + '='.repeat(60) + '\n')

  try {
    // Check all tables
    const expectedTables = [
      'users',
      'customers',
      'vendors',
      'vehicles',
      'employees',
      'quotations',
      'quotation_items',
      'invoices',
      'invoice_items',
      'purchase_orders',
      'purchase_order_items',
      'receipts',
      'payslips'
    ]

    console.log('📋 التحقق من الجداول:\n')
    
    const tableResults = {}
    let allTablesExist = true

    for (const table of expectedTables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
          .limit(1)

        if (error) {
          if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
            console.log(`  ❌ ${table} - الجدول غير موجود`)
            tableResults[table] = { exists: false, count: 0 }
            allTablesExist = false
          } else {
            console.log(`  ⚠️  ${table} - خطأ: ${error.message}`)
            tableResults[table] = { exists: false, count: 0, error: error.message }
            allTablesExist = false
          }
        } else {
          const { count: recordCount } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })
          
          console.log(`  ✅ ${table} - موجود (${recordCount || 0} سجل)`)
          tableResults[table] = { exists: true, count: recordCount || 0 }
        }
      } catch (err) {
        console.log(`  ❌ ${table} - خطأ: ${err.message}`)
        tableResults[table] = { exists: false, count: 0, error: err.message }
        allTablesExist = false
      }
    }

    console.log('\n' + '='.repeat(60) + '\n')
    console.log('📊 ملخص البيانات:\n')

    // Check data in each table
    for (const [table, result] of Object.entries(tableResults)) {
      if (result.exists) {
        try {
          const { count } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })
          
          console.log(`  ${table}: ${count || 0} سجل`)
        } catch (err) {
          console.log(`  ${table}: خطأ في العد`)
        }
      }
    }

    console.log('\n' + '='.repeat(60) + '\n')

    // Check users and PIN code
    console.log('👤 التحقق من المستخدمين:\n')
    
    try {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(10)

      if (usersError) {
        console.log(`  ❌ خطأ في جلب المستخدمين: ${usersError.message}`)
      } else if (!users || users.length === 0) {
        console.log('  ⚠️  لا يوجد مستخدمين في قاعدة البيانات')
        console.log('  💡 يجب إنشاء مستخدم بـ PIN Code: 1234')
      } else {
        console.log(`  ✅ يوجد ${users.length} مستخدم`)
        users.forEach((user, index) => {
          console.log(`    ${index + 1}. ${user.name || user.email} (${user.role})`)
        })
      }
    } catch (err) {
      console.log(`  ❌ خطأ: ${err.message}`)
    }

    console.log('\n' + '='.repeat(60) + '\n')

    // Final summary
    if (allTablesExist) {
      console.log('✅ جميع الجداول موجودة!')
      console.log('✅ قاعدة البيانات مربوطة بشكل صحيح!')
    } else {
      console.log('⚠️  بعض الجداول مفقودة!')
      console.log('💡 يجب تنفيذ supabase-schema.sql في Supabase SQL Editor')
    }

    console.log('\n' + '='.repeat(60) + '\n')

  } catch (error) {
    console.error('❌ خطأ في التحقق من قاعدة البيانات:')
    console.error(error.message)
    console.error('\n💡 تأكد من:')
    console.error('  1. Supabase URL صحيح')
    console.error('  2. Service Role Key صحيح')
    console.error('  3. Supabase Project نشط')
    process.exit(1)
  }
}

checkDatabase()
  .then(() => {
    console.log('\n✅ انتهى التحقق\n')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ خطأ:', error.message)
    process.exit(1)
  })
