// Check customers table schema in Supabase
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

async function checkCustomersSchema() {
  console.log('\n🔍 فحص بنية جدول customers...\n')
  console.log('='.repeat(60) + '\n')

  try {
    // Try to get table structure by querying information_schema
    const { data: columns, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' 
          AND table_name = 'customers'
        ORDER BY ordinal_position;
      `
    })

    if (error) {
      // Alternative: Try to query the table directly to see what columns exist
      console.log('⚠️  Cannot query information_schema directly')
      console.log('📋 محاولة فحص الجدول مباشرة...\n')
      
      // Try to insert a test record to see what error we get
      const testData = {
        id: `test_${Date.now()}`,
        name: 'Test Customer',
        email: `test_${Date.now()}@test.com`,
        phone: '1234567890',
        address: 'Test Address',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'Test Country',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const { data: insertData, error: insertError } = await supabase
        .from('customers')
        .insert(testData)
        .select()

      if (insertError) {
        console.log('❌ خطأ عند محاولة إدراج بيانات اختبار:')
        console.log(`   ${insertError.message}`)
        console.log(`   Code: ${insertError.code}`)
        console.log(`   Details: ${JSON.stringify(insertError, null, 2)}`)
      } else {
        console.log('✅ الجدول موجود ويمكن إدراج البيانات')
        // Delete test record
        await supabase.from('customers').delete().eq('id', testData.id)
      }

      // Try to get one record to see structure
      const { data: sample, error: sampleError } = await supabase
        .from('customers')
        .select('*')
        .limit(1)

      if (!sampleError && sample && sample.length > 0) {
        console.log('\n📋 بنية الجدول من عينة البيانات:')
        console.log(JSON.stringify(sample[0], null, 2))
      }
    } else {
      console.log('📋 بنية جدول customers:')
      console.log(JSON.stringify(columns, null, 2))
    }

    // Check if table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('customers')
      .select('*')
      .limit(0)

    if (tableError) {
      if (tableError.code === 'PGRST116') {
        console.log('\n❌ جدول customers غير موجود!')
        console.log('💡 يجب إنشاء الجدول أولاً باستخدام supabase-schema.sql')
      } else {
        console.log(`\n❌ خطأ في الوصول للجدول: ${tableError.message}`)
      }
    } else {
      console.log('\n✅ جدول customers موجود')
      
      // Count records
      const { count, error: countError } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })

      if (!countError) {
        console.log(`📊 عدد السجلات: ${count || 0}`)
      }
    }

  } catch (error) {
    console.error('\n❌ خطأ:', error.message)
  }

  console.log('\n' + '='.repeat(60) + '\n')
}

checkCustomersSchema()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ خطأ:', error.message)
    process.exit(1)
  })
