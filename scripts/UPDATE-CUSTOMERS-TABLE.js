// Update customers table to add missing columns
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

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

async function updateCustomersTable() {
  console.log('\n🔧 تحديث جدول customers...\n')
  console.log('='.repeat(60) + '\n')

  // SQL statements to add missing columns
  const alterStatements = [
    'ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "idNumber" TEXT;',
    'ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "passportNumber" TEXT;',
    'ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "residenceIssueDate" TIMESTAMP(3);',
    'ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "residenceExpiryDate" TIMESTAMP(3);',
    'ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "nationality" TEXT;',
    'ALTER TABLE "customers" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;',
  ]

  console.log('💡 يجب تنفيذ هذه الأوامر SQL في Supabase SQL Editor:\n')
  alterStatements.forEach((stmt, i) => {
    console.log(`${i + 1}. ${stmt}`)
  })

  console.log('\n📋 أو انسخ هذا الكود كاملاً:\n')
  console.log(alterStatements.join('\n'))
  console.log('\n' + '='.repeat(60) + '\n')

  // Try to check current structure
  try {
    const { data: sample, error } = await supabase
      .from('customers')
      .select('*')
      .limit(1)

    if (!error && sample && sample.length > 0) {
      console.log('📋 الأعمدة الحالية في جدول customers:')
      console.log(Object.keys(sample[0]).join(', '))
      console.log()
    }
  } catch (err) {
    console.log('⚠️  لا يمكن فحص بنية الجدول مباشرة\n')
  }
}

updateCustomersTable()
  .then(() => {
    console.log('✅ اكتمل التحقق\n')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ خطأ:', error.message)
    process.exit(1)
  })
