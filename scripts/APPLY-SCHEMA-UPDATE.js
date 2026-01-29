// Apply schema updates to customers table
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

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

async function applySchemaUpdate() {
  console.log('\n🔧 تطبيق تحديثات SCHEMA على جدول customers...\n')
  console.log('='.repeat(60) + '\n')

  try {
    // Note: Supabase REST API doesn't support ALTER TABLE directly
    // We need to use the SQL Editor in Supabase Dashboard
    // But we can verify the current state and provide instructions

    console.log('📋 ملاحظة: Supabase REST API لا يدعم ALTER TABLE مباشرة')
    console.log('💡 يجب تطبيق التحديثات يدوياً من Supabase Dashboard\n')

    console.log('📝 خطوات التطبيق:')
    console.log('1. افتح Supabase Dashboard')
    console.log('2. اذهب إلى SQL Editor')
    console.log('3. انسخ محتوى ملف scripts/UPDATE-CUSTOMERS-SCHEMA.sql')
    console.log('4. الصق الكود في SQL Editor')
    console.log('5. اضغط Run\n')

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'UPDATE-CUSTOMERS-SCHEMA.sql')
    if (fs.existsSync(sqlPath)) {
      const sqlContent = fs.readFileSync(sqlPath, 'utf8')
      console.log('📄 محتوى ملف SQL:\n')
      console.log(sqlContent)
      console.log('\n' + '='.repeat(60) + '\n')
    }

    // Try to verify current state
    console.log('🔍 التحقق من الحالة الحالية...\n')
    
    const { data: sample, error: sampleError } = await supabase
      .from('customers')
      .select('*')
      .limit(1)

    if (!sampleError && sample && sample.length > 0) {
      console.log('✅ الجدول موجود')
      console.log('📋 الحقول الحالية:')
      console.log(Object.keys(sample[0]).join(', '))
      
      const missingFields = ['idNumber', 'passportNumber', 'residenceIssueDate', 'residenceExpiryDate', 'nationality']
      const existingFields = Object.keys(sample[0])
      const missing = missingFields.filter(f => !existingFields.includes(f))
      
      if (missing.length > 0) {
        console.log(`\n⚠️  الحقول المفقودة: ${missing.join(', ')}`)
        console.log('💡 يجب إضافة هذه الحقول باستخدام SQL Editor')
      } else {
        console.log('\n✅ جميع الحقول موجودة')
      }
    }

    console.log('\n' + '='.repeat(60) + '\n')
    console.log('✅ تم التحقق من الحالة')
    console.log('💡 يرجى تطبيق التحديثات من Supabase Dashboard\n')

  } catch (error) {
    console.error('\n❌ خطأ:', error.message)
  }
}

applySchemaUpdate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ خطأ:', error.message)
    process.exit(1)
  })
