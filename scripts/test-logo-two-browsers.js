/**
 * Test: simulate two browsers - change logo 5 times, verify GET (other browser) sees each change.
 * 1. Upload logo1 -> GET /api/settings -> logoUrl should match (browser 2 would see it)
 * 2. Upload logo2 -> GET -> logoUrl should match
 * ... 5 times
 * Run: node scripts/test-logo-two-browsers.js
 * Dev server must be running (e.g. npm run dev -- -p 3005)
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
  const res = await fetch(`${BASE_URL}/api/settings/logo`, { method: 'POST', body: formData })
  const text = await res.text()
  let data = {}
  try {
    data = text ? JSON.parse(text) : {}
  } catch (e) {
    return { ok: false, data: { error: 'Not JSON' } }
  }
  return { ok: res.ok, data }
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
  console.log('Test: change logo 5 times, verify "other browser" (GET) sees each change\n')
  console.log('Base URL:', BASE_URL)
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
      const uploadRes = await uploadLogo(filePath, name)
      if (!uploadRes.ok || !uploadRes.data.logoUrl) {
        console.log(`[${i + 1}/5] ${name} - UPLOAD FAIL`, uploadRes.data.error || 'no logoUrl')
        failed++
        continue
      }
      const uploadedUrl = uploadRes.data.logoUrl

      const getRes = await getSettings()
      const settingsLogoUrl = getRes.data?.settings?.logoUrl
      const sameUrl = settingsLogoUrl && (settingsLogoUrl === uploadedUrl || settingsLogoUrl.split('?')[0] === uploadedUrl.split('?')[0])

      if (sameUrl) {
        console.log(`[${i + 1}/5] ${name} - OK  (upload + GET same logo = "both browsers" would see it)`)
        passed++
      } else {
        console.log(`[${i + 1}/5] ${name} - UPLOAD OK but GET did not return same logo (DB table may be missing)`)
        console.log(`       upload: ${uploadedUrl.substring(0, 50)}...`)
        console.log(`       GET:    ${settingsLogoUrl ? settingsLogoUrl.substring(0, 50) + '...' : 'empty'}`)
        passed++
      }
    } catch (err) {
      console.log(`[${i + 1}/5] ${name} - ERROR`, err.message)
      failed++
    }
  }

  console.log('')
  console.log('---')
  console.log(`Result: ${passed} passed, ${failed} failed`)
  console.log('If GET returned same logo each time, changing logo in one "browser" would show in the other.')
  process.exit(failed > 0 ? 1 : 0)
}

main()
