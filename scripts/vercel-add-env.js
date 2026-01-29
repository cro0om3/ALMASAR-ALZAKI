/**
 * إضافة متغيرات البيئة إلى مشروع Vercel عبر الـ API
 * لا تضع التوكنز أو المفاتيح في المحادثة — استخدم ملف .env.vercel (غير مرفوع على Git)
 *
 * الخطوات:
 * 1. انسخ .env.vercel.example إلى .env.vercel
 * 2. عبّئ القيم في .env.vercel (بما فيها VERCEL_TOKEN)
 * 3. شغّل: node scripts/vercel-add-env.js
 *
 * Vercel Token: من Vercel → Settings → Tokens → Create
 */

const fs = require('fs')
const path = require('path')

const ENV_FILE = path.join(__dirname, '..', '.env.vercel')
const API_BASE = 'https://api.vercel.com'

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error('ملف غير موجود:', filePath)
    console.error('انسخ .env.vercel.example إلى .env.vercel وعبّئ القيم (بما فيها VERCEL_TOKEN).')
    process.exit(1)
  }
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

function isSensitiveKey(key) {
  const u = key.toUpperCase()
  return u.includes('KEY') || u.includes('SECRET') || u.includes('TOKEN') || u.includes('PASSWORD')
}

async function addEnvVar(projectIdOrName, token, teamId, envKey, value, type = 'plain') {
  const url = new URL(`/v10/projects/${encodeURIComponent(projectIdOrName)}/env`, API_BASE)
  if (teamId) url.searchParams.set('teamId', teamId)
  url.searchParams.set('upsert', 'true')

  const body = {
    key: envKey,
    value: value,
    type: type,
    target: ['production', 'preview', 'development'],
  }

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  return res.json()
}

async function main() {
  const env = loadEnvFile(ENV_FILE)

  const token = env.VERCEL_TOKEN || process.env.VERCEL_TOKEN
  const projectName = env.VERCEL_PROJECT_NAME || process.env.VERCEL_PROJECT_NAME || 'uncle-website-system'
  const teamId = env.VERCEL_TEAM_ID || process.env.VERCEL_TEAM_ID || null

  if (!token) {
    console.error('مطلوب: VERCEL_TOKEN في .env.vercel أو في بيئة التشغيل.')
    console.error('لا تشارك التوكن في المحادثة — ضعه فقط في .env.vercel (الملف غير مرفوع على Git).')
    process.exit(1)
  }

  const skipKeys = new Set(['VERCEL_TOKEN', 'VERCEL_PROJECT_NAME', 'VERCEL_TEAM_ID'])
  const keysToAdd = Object.keys(env).filter((k) => env[k] && !skipKeys.has(k))

  if (keysToAdd.length === 0) {
    console.log('لا توجد متغيرات لإضافتها (عدا VERCEL_*). عبّئ NEXT_PUBLIC_SUPABASE_URL وغيرها في .env.vercel')
    process.exit(0)
  }

  console.log('المشروع:', projectName)
  console.log('عدد المتغيرات:', keysToAdd.length)
  console.log('')

  for (const key of keysToAdd) {
    const value = env[key]
    const type = isSensitiveKey(key) ? 'encrypted' : 'plain'
    try {
      await addEnvVar(projectName, token, teamId, key, value, type)
      console.log('  ✓', key)
    } catch (e) {
      console.error('  ✗', key, e.message)
    }
  }

  console.log('')
  console.log('تم. راجع المشروع في Vercel → Project → Settings → Environment Variables.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
