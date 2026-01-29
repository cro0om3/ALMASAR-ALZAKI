import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import sharp from 'sharp'

const SETTINGS_ID = 'default'
const BUCKET = 'company-assets'
const MAX_SIZE = 512

/** Normalize any image buffer: optimize raster images (resize + PNG), leave SVG as-is */
async function optimizeImage(buffer: Buffer, mime: string): Promise<{ buffer: Buffer; mime: string; ext: string }> {
  const isSvg = mime.includes('svg')
  if (isSvg) {
    return { buffer, mime: 'image/svg+xml', ext: 'svg' }
  }

  try {
    const optimized = await sharp(buffer)
      .resize(MAX_SIZE, MAX_SIZE, { fit: 'inside', withoutEnlargement: true })
      .png()
      .toBuffer()
    return { buffer: optimized, mime: 'image/png', ext: 'png' }
  } catch {
    const ext = mime.includes('png') ? 'png' : mime.includes('jpeg') || mime.includes('jpg') ? 'jpg' : mime.includes('webp') ? 'webp' : mime.includes('gif') ? 'gif' : 'png'
    return { buffer, mime: mime || 'image/png', ext }
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const contentType = request.headers.get('content-type') || ''

    let buffer: Buffer
    let contentTypeLogo: string

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('logo') as File | null
      if (!file || !(file instanceof Blob)) {
        return NextResponse.json(
          { error: 'No logo file provided. Use form field "logo".' },
          { status: 400 }
        )
      }
      buffer = Buffer.from(await file.arrayBuffer())
      contentTypeLogo = file.type || 'image/png'
    } else if (contentType.includes('application/json')) {
      let body: { base64?: string }
      try {
        body = await request.json()
      } catch {
        return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
      }
      const base64 = body.base64
      if (!base64 || typeof base64 !== 'string') {
        return NextResponse.json(
          { error: 'No base64 image provided. Send { base64: "data:image/..." }.' },
          { status: 400 }
        )
      }
      const match = base64.match(/^data:([^;]+);base64,(.+)$/)
      if (!match) {
        return NextResponse.json(
          { error: 'Invalid base64 format. Use data:image/...;base64,...' },
          { status: 400 }
        )
      }
      contentTypeLogo = match[1] || 'image/png'
      buffer = Buffer.from(match[2], 'base64')
    } else {
      return NextResponse.json(
        { error: 'Send multipart/form-data with "logo" file or JSON { base64: "data:image/..." }.' },
        { status: 400 }
      )
    }

    if (!buffer.length) {
      return NextResponse.json({ error: 'Empty file.' }, { status: 400 })
    }

    const { buffer: finalBuffer, mime: finalMime, ext } = await optimizeImage(buffer, contentTypeLogo)
    const path = `logo.${ext}`

    const { data: buckets } = await supabase.storage.listBuckets()
    const hasBucket = buckets?.some((b) => b.name === BUCKET)
    if (!hasBucket) {
      const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: 5242880,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/gif'],
      })
      if (createErr) {
        console.error('Storage bucket create error:', createErr)
        return NextResponse.json(
          { error: 'Could not create storage bucket.', details: createErr.message },
          { status: 500 }
        )
      }
    }

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, finalBuffer, { contentType: finalMime, upsert: true })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload logo.', details: uploadError.message },
        { status: 500 }
      )
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
    const logoUrl = urlData.publicUrl

    const { data: existing } = await supabase
      .from('app_settings')
      .select('settings')
      .eq('id', SETTINGS_ID)
      .single()

    const currentSettings = (existing?.settings as Record<string, unknown>) || {}
    const merged = { ...currentSettings, logoUrl, updatedAt: new Date().toISOString() }

    const { error: upsertError } = await supabase
      .from('app_settings')
      .upsert(
        { id: SETTINGS_ID, settings: merged, updatedAt: new Date().toISOString() },
        { onConflict: 'id' }
      )

    if (upsertError) {
      console.error('Failed to save logo URL to database:', upsertError)
      return NextResponse.json({
        logoUrl,
        savedToDatabase: false,
        warning: 'Run app_settings table SQL in Supabase for cross-device sync.',
      })
    }

    return NextResponse.json({ logoUrl, savedToDatabase: true })
  } catch (error: unknown) {
    console.error('Error in POST /api/settings/logo:', error)
    return NextResponse.json(
      { error: 'Failed to upload logo', details: String(error) },
      { status: 500 }
    )
  }
}
