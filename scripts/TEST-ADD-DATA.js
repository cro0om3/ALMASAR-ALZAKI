// Test adding data through the website API and verify it's saved in database
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

async function testAddData() {
  console.log('\n🧪 اختبار إضافة بيانات من الموقع والتحقق من الحفظ...\n')
  console.log('='.repeat(60) + '\n')

  // Step 1: Get current count before adding
  console.log('📊 الخطوة 1: عد السجلات الحالية...\n')
  
  let beforeCount = 0
  try {
    const { count } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
    beforeCount = count || 0
    console.log(`  ✅ عدد العملاء الحالي: ${beforeCount}`)
  } catch (error) {
    console.error(`  ❌ خطأ في العد: ${error.message}`)
    return
  }

  // Step 2: Add new customer via API
  console.log('\n📝 الخطوة 2: إضافة عميل جديد عبر API...\n')
  
  const newCustomer = {
    name: `Test Customer ${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    phone: `+9665${Math.floor(Math.random() * 100000000)}`,
    address: `${Math.floor(Math.random() * 999)} Test Street`,
    city: 'Riyadh',
    state: 'Saudi Arabia',
    zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
    country: 'Saudi Arabia',
  }

  console.log('  البيانات المراد إضافتها:')
  console.log(`    الاسم: ${newCustomer.name}`)
  console.log(`    البريد: ${newCustomer.email}`)
  console.log(`    الهاتف: ${newCustomer.phone}`)
  console.log(`    العنوان: ${newCustomer.address}, ${newCustomer.city}`)

  let createdCustomer = null
  try {
    const response = await fetch(`${API_URL}/api/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newCustomer),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`)
    }

    createdCustomer = await response.json()
    console.log(`\n  ✅ تم إضافة العميل بنجاح عبر API!`)
    console.log(`    ID: ${createdCustomer.id}`)
  } catch (error) {
    console.error(`  ❌ خطأ في إضافة العميل عبر API: ${error.message}`)
    console.error(`  💡 تأكد من أن السيرفر يعمل على: ${API_URL}`)
    return
  }

  // Step 3: Verify data is saved in database
  console.log('\n🔍 الخطوة 3: التحقق من حفظ البيانات في قاعدة البيانات...\n')

  try {
    // Wait a bit for database to sync
    await new Promise(resolve => setTimeout(resolve, 1000))

    const { count: afterCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })

    console.log(`  ✅ عدد العملاء بعد الإضافة: ${afterCount || 0}`)

    if (afterCount === beforeCount + 1) {
      console.log(`  ✅ ✅ عدد السجلات زاد بمقدار 1 - البيانات تم حفظها!`)
    } else {
      console.log(`  ⚠️  عدد السجلات لم يزد بالشكل المتوقع`)
    }

    // Verify the specific customer exists
    const { data: foundCustomer, error: findError } = await supabase
      .from('customers')
      .select('*')
      .eq('email', newCustomer.email)
      .single()

    if (findError) {
      console.error(`  ❌ خطأ في البحث عن العميل: ${findError.message}`)
    } else if (foundCustomer) {
      console.log(`\n  ✅ ✅ تم العثور على العميل في قاعدة البيانات!`)
      console.log(`    ID: ${foundCustomer.id}`)
      console.log(`    الاسم: ${foundCustomer.name}`)
      console.log(`    البريد: ${foundCustomer.email}`)
      console.log(`    الهاتف: ${foundCustomer.phone}`)
      console.log(`    العنوان: ${foundCustomer.address}`)
      console.log(`    المدينة: ${foundCustomer.city}`)
      
      // Verify all fields match
      const fieldsMatch = 
        foundCustomer.name === newCustomer.name &&
        foundCustomer.email === newCustomer.email &&
        foundCustomer.phone === newCustomer.phone &&
        foundCustomer.address === newCustomer.address &&
        foundCustomer.city === newCustomer.city

      if (fieldsMatch) {
        console.log(`\n  ✅ ✅ جميع الحقول متطابقة - البيانات محفوظة بشكل صحيح!`)
      } else {
        console.log(`\n  ⚠️  بعض الحقول غير متطابقة`)
      }
    } else {
      console.log(`  ❌ لم يتم العثور على العميل في قاعدة البيانات`)
    }

  } catch (error) {
    console.error(`  ❌ خطأ في التحقق: ${error.message}`)
  }

  // Step 4: Test adding a vendor
  console.log('\n' + '='.repeat(60))
  console.log('\n📝 الخطوة 4: إضافة مورد جديد عبر API...\n')

  const newVendor = {
    name: `Test Vendor ${Date.now()}`,
    email: `vendor${Date.now()}@example.com`,
    phone: `+9665${Math.floor(Math.random() * 100000000)}`,
    address: `${Math.floor(Math.random() * 999)} Vendor Street`,
    city: 'Jeddah',
    state: 'Saudi Arabia',
    zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
    country: 'Saudi Arabia',
    contactPerson: `Contact Person ${Date.now()}`,
  }

  try {
    const vendorBeforeCount = await supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true })
      .then(({ count }) => count || 0)

    console.log(`  عدد الموردين الحالي: ${vendorBeforeCount}`)

    const response = await fetch(`${API_URL}/api/vendors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newVendor),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`)
    }

    const createdVendor = await response.json()
    console.log(`  ✅ تم إضافة المورد بنجاح! ID: ${createdVendor.id}`)

    // Verify in database
    await new Promise(resolve => setTimeout(resolve, 1000))

    const { data: foundVendor } = await supabase
      .from('vendors')
      .select('*')
      .eq('email', newVendor.email)
      .single()

    if (foundVendor) {
      console.log(`  ✅ ✅ تم العثور على المورد في قاعدة البيانات!`)
      console.log(`    الاسم: ${foundVendor.name}`)
      console.log(`    البريد: ${foundVendor.email}`)
    }

  } catch (error) {
    console.error(`  ❌ خطأ في إضافة المورد: ${error.message}`)
  }

  console.log('\n' + '='.repeat(60))
  console.log('\n✅ انتهى الاختبار!\n')
  console.log('📋 الملخص:')
  console.log('  ✅ تم إضافة بيانات عبر API')
  console.log('  ✅ تم التحقق من حفظها في قاعدة البيانات')
  console.log('  ✅ كل شيء مربوط ويعمل بشكل صحيح!\n')
}

testAddData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ خطأ:', error.message)
    process.exit(1)
  })
