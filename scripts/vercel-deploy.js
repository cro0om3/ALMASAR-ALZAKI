/**
 * نشر المشروع إلى Vercel Production
 * يقرأ VERCEL_TOKEN من .env.vercel ويشغّل vercel --prod --yes
 */
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

const ENV_FILE = path.join(__dirname, '..', '.env.vercel')

function loadEnv() {
  if (!fs.existsSync(ENV_FILE)) {
    console.error('ملف غير موجود:', ENV_FILE)
    process.exit(1)
  }
  const content = fs.readFileSync(ENV_FILE, 'utf8')
  const env = { ...process.env }
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

const env = loadEnv()
if (!env.VERCEL_TOKEN) {
  console.error('مطلوب VERCEL_TOKEN في .env.vercel')
  process.exit(1)
}

console.log('جاري النشر إلى Vercel (Production)...')
const child = spawn('npx', ['vercel', '--prod', '--yes'], {
  stdio: 'inherit',
  shell: true,
  env: { ...env, VERCEL_TOKEN: env.VERCEL_TOKEN },
  cwd: path.join(__dirname, '..'),
})
child.on('close', (code) => process.exit(code || 0))
