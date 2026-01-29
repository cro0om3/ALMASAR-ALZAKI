// Create tables in Supabase using Management API
require('dotenv').config({ path: '.env.local' })

const https = require('https')
const fs = require('fs')
const path = require('path')

// Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ebelbztbpzccdhytynnc.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_t0LnDUHEpTMSNez6PyLIqg_udKq1Zmq'
const projectId = 'ebelbztbpzccdhytynnc'
const accessToken = 'sbp_ef579d7bd307bdf6a631d162d47dda15666c6bbc'

// Read SQL schema
function readSQLSchema() {
  const schemaPath = path.join(__dirname, '..', 'supabase-schema.sql')
  return fs.readFileSync(schemaPath, 'utf8')
}

// Execute SQL via Supabase Management API
async function executeSQLViaAPI(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://api.supabase.com/v1/projects/${projectId}/database/query`)
    
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }

    const req = https.request(url, options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data))
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`))
        }
      })
    })

    req.on('error', reject)
    req.write(JSON.stringify({ query: sql }))
    req.end()
  })
}

// Alternative: Use Supabase REST API to create tables via direct SQL execution
async function createTablesDirectly() {
  console.log('\n🔧 محاولة إنشاء الجداول...\n')
  
  try {
    const sql = readSQLSchema()
    console.log('📄 تم قراءة supabase-schema.sql')
    console.log(`📏 حجم الملف: ${sql.length} حرف\n`)
    
    // Split into statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 10 && !s.startsWith('--'))
    
    console.log(`📝 عدد الأوامر: ${statements.length}\n`)
    
    // Try to execute via Management API
    try {
      await executeSQLViaAPI(sql)
      console.log('✅ تم تنفيذ SQL بنجاح!\n')
    } catch (apiError) {
      console.log('⚠️  Management API غير متاح أو فشل')
      console.log('💡 يجب تنفيذ supabase-schema.sql من Supabase SQL Editor\n')
      console.log('📋 الخطوات:')
      console.log('1. افتح https://supabase.com/dashboard')
      console.log('2. اختر مشروع Maser-AlZaki')
      console.log('3. اذهب إلى SQL Editor')
      console.log('4. انسخ محتوى supabase-schema.sql')
      console.log('5. الصق واضغط Run\n')
    }
  } catch (error) {
    console.error('❌ خطأ:', error.message)
  }
}

// Main function
async function main() {
  console.log('\n🚀 إنشاء الجداول في Supabase...\n')
  console.log('='.repeat(60))
  console.log(`📍 Project ID: ${projectId}`)
  console.log(`📍 Supabase URL: ${supabaseUrl}`)
  console.log('='.repeat(60) + '\n')

  await createTablesDirectly()
  
  console.log('='.repeat(60) + '\n')
}

main()
  .then(() => {
    console.log('✅ اكتمل التحقق\n')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ خطأ:', error.message)
    process.exit(1)
  })
