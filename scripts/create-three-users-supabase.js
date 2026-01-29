// إنشاء 3 مستخدمين في Supabase للاختبار
// Run: node scripts/create-three-users-supabase.js

const path = require('path')
const fs = require('fs')

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {}
  const content = fs.readFileSync(filePath, 'utf8')
  const env = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    env[key] = value
  }
  return env
}

const envForVercel = path.join(__dirname, '..', 'env-for-vercel.txt')
const envLocal = path.join(__dirname, '..', '.env.local')
const env = { ...loadEnvFile(envForVercel), ...loadEnvFile(envLocal) }

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

const USERS = [
  { email: 'admin@example.com', name: 'Administrator', pin: '1234', role: 'admin' },
  { email: 'user2@example.com', name: 'User Two', pin: '2222', role: 'user' },
  { email: 'user3@example.com', name: 'User Three', pin: '3333', role: 'manager' },
]

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('مطلوب: NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY في .env.local أو env-for-vercel.txt')
    process.exit(1)
  }

  const bcrypt = require('bcryptjs')
  const { createClient } = require('@supabase/supabase-js')
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  console.log('إنشاء/تحديث 3 مستخدمين في Supabase...\n')

  for (const u of USERS) {
    const hashedPin = await bcrypt.hash(u.pin, 10)
    const now = new Date().toISOString()
    const id = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const { data: existing } = await supabase.from('users').select('id').eq('email', u.email).single()

    if (existing) {
      const { error } = await supabase.from('users').update({
        password: hashedPin,
        name: u.name,
        role: u.role,
        updatedAt: now,
      }).eq('email', u.email)
      if (error) {
        console.error('  ✗', u.email, error.message)
        continue
      }
      console.log('  ✓', u.email, '| PIN:', u.pin, '| (محدّث)')
    } else {
      const { error } = await supabase.from('users').insert({
        id,
        email: u.email,
        name: u.name,
        password: hashedPin,
        role: u.role,
        createdAt: now,
        updatedAt: now,
      })
      if (error) {
        console.error('  ✗', u.email, error.message)
        continue
      }
      console.log('  ✓', u.email, '| PIN:', u.pin, '| (جديد)')
    }
  }

  console.log('\nتم. يمكن الدخول بأي PIN أعلاه.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
