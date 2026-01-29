/**
 * إنشاء مشروع على Vercel (إن لم يكن موجوداً) ثم إضافة متغيرات البيئة
 * يشغّل: node scripts/vercel-create-project-and-env.js
 * يتطلب: .env.vercel مع VERCEL_TOKEN, VERCEL_TEAM_ID, VERCEL_PROJECT_NAME ومتغيرات Supabase
 */

const fs = require('fs')
const path = require('path')

const ENV_FILE = path.join(__dirname, '..', '.env.vercel')
const API_BASE = 'https://api.vercel.com'

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error('ملف غير موجود:', filePath)
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

async function createProject(token, teamId, projectName) {
  const url = new URL('/v11/projects', API_BASE)
  if (teamId) url.searchParams.set('teamId', teamId)

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: projectName,
      framework: 'nextjs',
      buildCommand: 'npm run vercel-build',
      installCommand: 'npm install',
    }),
  })

  if (res.status === 409) {
    return { exists: true }
  }
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Create project HTTP ${res.status}: ${text}`)
  }
  return { exists: false, project: await res.json() }
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

function isSensitiveKey(key) {
  const u = key.toUpperCase()
  return u.includes('KEY') || u.includes('SECRET') || u.includes('TOKEN') || u.includes('PASSWORD')
}

async function main() {
  const env = loadEnvFile(ENV_FILE)
  const token = env.VERCEL_TOKEN || process.env.VERCEL_TOKEN
  const projectName = env.VERCEL_PROJECT_NAME || process.env.VERCEL_PROJECT_NAME || 'uncle-website-system'
  const teamId = env.VERCEL_TEAM_ID || process.env.VERCEL_TEAM_ID || null

  if (!token) {
    console.error('مطلوب: VERCEL_TOKEN في .env.vercel')
    process.exit(1)
  }

  console.log('1) إنشاء المشروع على Vercel (إن لم يكن موجوداً)...')
  const createResult = await createProject(token, teamId, projectName)
  if (createResult.exists) {
    console.log('   المشروع موجود مسبقاً.')
  } else {
    console.log('   تم إنشاء المشروع:', projectName)
  }

  const skipKeys = new Set(['VERCEL_TOKEN', 'VERCEL_PROJECT_NAME', 'VERCEL_TEAM_ID'])
  const keysToAdd = Object.keys(env).filter((k) => env[k] && !skipKeys.has(k))
  if (keysToAdd.length === 0) {
    console.log('لا توجد متغيرات لإضافتها.')
    return
  }

  console.log('2) إضافة متغيرات البيئة...')
  for (const key of keysToAdd) {
    const value = env[key]
    const type = isSensitiveKey(key) ? 'encrypted' : 'plain'
    try {
      await addEnvVar(projectName, token, teamId, key, value, type)
      console.log('   ✓', key)
    } catch (e) {
      console.error('   ✗', key, e.message)
    }
  }
  console.log('تم.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
