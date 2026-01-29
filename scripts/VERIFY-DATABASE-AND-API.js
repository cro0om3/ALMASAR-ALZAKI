// Comprehensive verification script for database and API
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function verifyDatabase() {
  console.log('\n🔍 التحقق من قاعدة البيانات...\n')
  console.log('='.repeat(60) + '\n')

  // Check connection
  try {
    const { data, error } = await supabase.from('customers').select('count').limit(1)
    if (error && error.code !== 'PGRST116') throw error
    console.log('✅ الاتصال بقاعدة البيانات يعمل\n')
  } catch (error) {
    console.log(`❌ خطأ في الاتصال: ${error.message}\n`)
    return false
  }

  // Check tables
  const expectedTables = [
    'users', 'customers', 'vendors', 'vehicles', 'employees',
    'quotations', 'quotation_items', 'invoices', 'invoice_items',
    'purchase_orders', 'purchase_order_items', 'receipts', 'payslips'
  ]

  console.log('📋 التحقق من الجداول:\n')
  let allTablesExist = true
  for (const table of expectedTables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(0)
      if (error && error.code === 'PGRST116') {
        console.log(`❌ ${table} - غير موجود`)
        allTablesExist = false
      } else {
        // Count records
        const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
        console.log(`✅ ${table} - موجود (${count || 0} سجل)`)
      }
    } catch (error) {
      console.log(`❌ ${table} - خطأ: ${error.message.substring(0, 50)}`)
      allTablesExist = false
    }
  }

  return allTablesExist
}

async function testCreateCustomer() {
  console.log('\n🧪 اختبار إنشاء عميل جديد...\n')

  const testCustomer = {
    id: `test_${Date.now()}`,
    name: 'Test Customer',
    email: `test_${Date.now()}@test.com`,
    phone: '1234567890',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  try {
    const { data, error } = await supabase
      .from('customers')
      .insert(testCustomer)
      .select()
      .single()

    if (error) {
      console.log(`❌ فشل إنشاء عميل: ${error.message}`)
      return false
    }

    console.log('✅ تم إنشاء عميل تجريبي بنجاح')
    console.log(`   ID: ${data.id}`)
    console.log(`   Name: ${data.name}`)

    // Delete test customer
    await supabase.from('customers').delete().eq('id', testCustomer.id)
    console.log('✅ تم حذف العميل التجريبي\n')

    return true
  } catch (error) {
    console.log(`❌ خطأ: ${error.message}\n`)
    return false
  }
}

async function testFetchCustomers() {
  console.log('\n🧪 اختبار جلب العملاء...\n')

  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .limit(5)

    if (error) {
      console.log(`❌ فشل جلب العملاء: ${error.message}\n`)
      return false
    }

    console.log(`✅ تم جلب ${data.length} عميل\n`)
    if (data.length > 0) {
      console.log('📋 عينة من العملاء:')
      data.slice(0, 3).forEach(c => {
        console.log(`   - ${c.name || 'بدون اسم'} (${c.email || 'بدون إيميل'})`)
      })
      console.log()
    }

    return true
  } catch (error) {
    console.log(`❌ خطأ: ${error.message}\n`)
    return false
  }
}

async function main() {
  console.log('\n🔍 التحقق الشامل من قاعدة البيانات والAPI\n')
  console.log('='.repeat(60))
  console.log(`📍 Supabase URL: ${supabaseUrl}`)
  console.log('='.repeat(60))

  const results = {
    database: false,
    createCustomer: false,
    fetchCustomers: false,
  }

  try {
    results.database = await verifyDatabase()
    
    if (results.database) {
      results.createCustomer = await testCreateCustomer()
      results.fetchCustomers = await testFetchCustomers()
    }

    console.log('='.repeat(60))
    console.log('\n📊 ملخص النتائج:\n')
    console.log(`🔌 قاعدة البيانات: ${results.database ? '✅' : '❌'}`)
    console.log(`➕ إنشاء عميل: ${results.createCustomer ? '✅' : '❌'}`)
    console.log(`📥 جلب عملاء: ${results.fetchCustomers ? '✅' : '❌'}`)

    const allPassed = Object.values(results).every(r => r === true)
    
    if (allPassed) {
      console.log('\n✅ ✅ ✅ كل شيء يعمل بشكل صحيح!\n')
    } else {
      console.log('\n⚠️  بعض الاختبارات فشلت\n')
    }

  } catch (error) {
    console.error('\n❌ خطأ:', error.message)
    process.exit(1)
  }

  console.log('='.repeat(60) + '\n')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ خطأ:', error.message)
    process.exit(1)
  })
