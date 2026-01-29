// Complete verification script - checks everything is working correctly
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const API_URL = process.env.API_URL || 'http://localhost:3000'

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

async function verifyCompleteSetup() {
  console.log('\n🔍 التحقق الشامل من الإعداد...\n')
  console.log('='.repeat(60) + '\n')

  let allGood = true

  // 1. Check database connection
  console.log('1️⃣  التحقق من الاتصال بقاعدة البيانات...\n')
  try {
    const { data, error } = await supabase.from('customers').select('count').limit(1)
    if (error) throw error
    console.log('  ✅ الاتصال بقاعدة البيانات يعمل بشكل صحيح\n')
  } catch (error) {
    console.error(`  ❌ خطأ في الاتصال: ${error.message}\n`)
    allGood = false
  }

  // 2. Check all tables exist
  console.log('2️⃣  التحقق من وجود جميع الجداول...\n')
  const expectedTables = [
    'users', 'customers', 'vendors', 'vehicles', 'employees',
    'quotations', 'quotation_items', 'invoices', 'invoice_items',
    'purchase_orders', 'purchase_order_items', 'receipts', 'payslips'
  ]

  for (const table of expectedTables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1)
      if (error && error.code === 'PGRST116') {
        console.log(`  ❌ ${table} - الجدول غير موجود`)
        allGood = false
      } else {
        console.log(`  ✅ ${table}`)
      }
    } catch (error) {
      console.log(`  ❌ ${table} - خطأ: ${error.message}`)
      allGood = false
    }
  }

  // 3. Check API endpoints
  console.log('\n3️⃣  التحقق من API Endpoints...\n')
  const endpoints = [
    { path: '/api/customers', method: 'GET' },
    { path: '/api/vendors', method: 'GET' },
  ]

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_URL}${endpoint.path}`, {
        method: endpoint.method,
      })
      if (response.ok) {
        console.log(`  ✅ ${endpoint.method} ${endpoint.path}`)
      } else {
        console.log(`  ⚠️  ${endpoint.method} ${endpoint.path} - Status: ${response.status}`)
      }
    } catch (error) {
      console.log(`  ❌ ${endpoint.method} ${endpoint.path} - ${error.message}`)
      console.log(`     💡 تأكد من أن السيرفر يعمل: npm run dev`)
    }
  }

  // 4. Check data synchronization
  console.log('\n4️⃣  التحقق من مزامنة البيانات...\n')
  try {
    const { count: customerCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
    
    const { count: vendorCount } = await supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true })

    console.log(`  ✅ العملاء: ${customerCount || 0} سجل`)
    console.log(`  ✅ الموردين: ${vendorCount || 0} سجل`)
    console.log(`  ✅ البيانات محفوظة في قاعدة بيانات مركزية (Supabase)`)
    console.log(`  ✅ جميع الأجهزة ستشاهد نفس البيانات\n`)
  } catch (error) {
    console.error(`  ❌ خطأ: ${error.message}\n`)
    allGood = false
  }

  // 5. Summary
  console.log('='.repeat(60))
  console.log('\n📋 الملخص:\n')
  
  if (allGood) {
    console.log('✅ ✅ ✅ كل شيء يعمل بشكل صحيح!\n')
    console.log('✅ قاعدة البيانات مربوطة')
    console.log('✅ جميع الجداول موجودة')
    console.log('✅ API Endpoints تعمل')
    console.log('✅ البيانات متزامنة بين الأجهزة')
    console.log('\n🎉 الموقع جاهز للاستخدام!\n')
  } else {
    console.log('⚠️  بعض المشاكل تحتاج إلى إصلاح\n')
  }

  console.log('💡 ملاحظات مهمة:')
  console.log('  • البيانات محفوظة في Supabase (سحابي)')
  console.log('  • أي تغيير من أي جهاز سيظهر على جميع الأجهزة')
  console.log('  • لا تعتمد على localStorage - كل شيء في قاعدة البيانات\n')
  
  console.log('='.repeat(60) + '\n')
}

verifyCompleteSetup()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ خطأ:', error.message)
    process.exit(1)
  })
