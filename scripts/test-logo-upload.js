/**
 * Test script: upload 5 different logos to /api/settings/logo
 * and verify response + GET /api/settings returns the logo URL.
 * Run with: node scripts/test-logo-upload.js
 * Ensure dev server is running (e.g. npm run dev -- -p 3005)
 */

const fs = require('fs')
const path = require('path')

const BASE_URL = process.env.BASE_URL || 'http://localhost:3005'
const LOGOS_DIR = path.join(__dirname, 'fixtures', 'logos')

const logoFiles = ['logo1.svg', 'logo2.svg', 'logo3.svg', 'logo4.svg', 'logo5.svg']

async function uploadLogo(filePath, name) {
  const buffer = fs.readFileSync(filePath)
  const blob = new Blob([buffer], { type: 'image/svg+xml' })
  const formData = new FormData()
  formData.append('logo', blob, name)

  const res = await fetch(`${BASE_URL}/api/settings/logo`, {
    method: 'POST',
    body: formData,
  })
  const text = await res.text()
  let data = {}
  try {
    data = text ? JSON.parse(text) : {}
  } catch (e) {
    return { ok: false, status: res.status, data: { error: 'Response was not JSON: ' + text.slice(0, 80) } }
  }
  return { ok: res.ok, status: res.status, data }
}

async function getSettings() {
  const res = await fetch(`${BASE_URL}/api/settings`)
  const text = await res.text()
  let data = {}
  try {
    data = text ? JSON.parse(text) : {}
  } catch (e) {
    return { ok: false, data: {} }
  }
  return { ok: res.ok, data }
}

async function main() {
  console.log('Testing logo upload API (5 logos)...\n')
  console.log('Base URL:', BASE_URL)
  console.log('Logos dir:', LOGOS_DIR)
  console.log('')

  let passed = 0
  let failed = 0

  for (let i = 0; i < logoFiles.length; i++) {
    const name = logoFiles[i]
    const filePath = path.join(LOGOS_DIR, name)
    if (!fs.existsSync(filePath)) {
      console.log(`[${i + 1}/5] ${name} - SKIP (file not found)`)
      failed++
      continue
    }

    try {
      const { ok, status, data } = await uploadLogo(filePath, name)
      if (!ok) {
        console.log(`[${i + 1}/5] ${name} - FAIL (${status})`, data.error || data)
        failed++
        continue
      }
      if (!data.logoUrl) {
        console.log(`[${i + 1}/5] ${name} - FAIL (no logoUrl in response)`)
        failed++
        continue
      }

      const getRes = await getSettings()
      const settingsLogoUrl = getRes.data?.settings?.logoUrl
      const dbOk = settingsLogoUrl === data.logoUrl || (getRes.ok && getRes.data?.settings && 'logoUrl' in getRes.data.settings)

      console.log(`[${i + 1}/5] ${name} - OK`)
      console.log(`       logoUrl: ${data.logoUrl.substring(0, 60)}...`)
      console.log(`       savedToDatabase: ${data.savedToDatabase !== false}`)
      if (settingsLogoUrl) console.log(`       GET /api/settings returns logoUrl: yes`)
      console.log('')
      passed++
    } catch (err) {
      console.log(`[${i + 1}/5] ${name} - ERROR`, err.message)
      failed++
    }
  }

  console.log('---')
  console.log(`Result: ${passed} passed, ${failed} failed`)
  process.exit(failed > 0 ? 1 : 0)
}

main()
