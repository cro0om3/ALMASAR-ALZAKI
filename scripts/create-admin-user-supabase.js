// إنشاء مستخدم admin بـ PIN 1234 في Supabase (يعمل مع التطبيق على Vercel)
// Run: node scripts/create-admin-user-supabase.js

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

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('مطلوب: NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY في .env.local أو env-for-vercel.txt')
    process.exit(1)
  }

  const bcrypt = require('bcryptjs')
  const { createClient } = require('@supabase/supabase-js')

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const pinCode = '1234'
  const hashedPin = await bcrypt.hash(pinCode, 10)
  const now = new Date().toISOString()
  const id = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const { data: existing } = await supabase.from('users').select('id, password').eq('email', 'admin@example.com').single()

  if (existing) {
    const { error } = await supabase.from('users').update({
      password: hashedPin,
      name: 'Administrator',
      role: 'admin',
      updatedAt: now,
    }).eq('email', 'admin@example.com')
    if (error) {
      console.error('خطأ عند تحديث المستخدم:', error.message)
      process.exit(1)
    }
    console.log('تم تحديث مستخدم admin بنجاح. PIN: 1234')
  } else {
    const { error } = await supabase.from('users').insert({
      id,
      email: 'admin@example.com',
      name: 'Administrator',
      password: hashedPin,
      role: 'admin',
      createdAt: now,
      updatedAt: now,
    })
    if (error) {
      console.error('خطأ عند إنشاء المستخدم:', error.message)
      process.exit(1)
    }
    console.log('تم إنشاء مستخدم admin بنجاح. PIN: 1234')
  }

  const isValid = await bcrypt.compare('1234', hashedPin)
  console.log(isValid ? 'التحقق: PIN 1234 يعمل.' : 'التحقق: فشل.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
