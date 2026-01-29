import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

const SETTINGS_ID = 'default'

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('app_settings')
      .select('settings, updatedAt')
      .eq('id', SETTINGS_ID)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ settings: {}, updatedAt: null })
      }
      const hint = (error as { hint?: string }).hint ?? ''
      if (error.message?.includes('Invalid API key') || (error.message?.includes('invalid') && hint.includes('API key'))) {
        console.warn('Settings: Invalid Supabase API key — check Vercel env vars (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY). Returning empty settings.')
        return NextResponse.json({ settings: {}, updatedAt: null })
      }
      console.error('Error fetching settings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch settings', details: error.message },
        { status: 500 }
      )
    }

    const res = NextResponse.json({
      settings: data?.settings || {},
      updatedAt: data?.updatedAt || null,
    })
    res.headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=120')
    return res
  } catch (error: unknown) {
    const msg = String(error ?? '')
    if (msg.includes('Invalid API key') || msg.includes('Missing Supabase')) {
      console.warn('Settings GET:', msg)
      return NextResponse.json({ settings: {}, updatedAt: null })
    }
    console.error('Error in GET /api/settings', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings', details: msg },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServerClient()

    const { data: existing, error: fetchError } = await supabase
      .from('app_settings')
      .select('settings')
      .eq('id', SETTINGS_ID)
      .single()

    const fetchErrMsg = (fetchError as { message?: string; hint?: string })?.message ?? ''
    const fetchErrHint = (fetchError as { hint?: string })?.hint ?? ''
    if (fetchError && (fetchErrMsg.includes('Invalid API key') || fetchErrHint.includes('API key'))) {
      console.warn('Settings PUT: Invalid Supabase API key — check Vercel env vars.')
      return NextResponse.json({
        settings: { ...body, updatedAt: new Date().toISOString() },
        savedToDatabase: false,
        warning: 'Invalid Supabase API key. Add correct NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel Environment Variables.',
      })
    }

    const currentSettings = (existing?.settings as Record<string, unknown>) || {}
    const merged = { ...currentSettings, ...body, updatedAt: new Date().toISOString() }

    const { error } = await supabase
      .from('app_settings')
      .upsert(
        { id: SETTINGS_ID, settings: merged, updatedAt: new Date().toISOString() },
        { onConflict: 'id' }
      )

    if (error) {
      const errMsg = (error as { message?: string }).message ?? ''
      if (errMsg.includes('Invalid API key')) {
        return NextResponse.json({
          settings: merged,
          savedToDatabase: false,
          warning: 'Invalid Supabase API key. Add correct keys in Vercel Environment Variables.',
        })
      }
      console.error('Error updating settings (table may not exist):', error.message)
      return NextResponse.json({
        settings: merged,
        savedToDatabase: false,
        warning: 'Create app_settings table in Supabase for cross-device sync (see supabase-schema.sql).',
      })
    }

    return NextResponse.json({ settings: merged, savedToDatabase: true })
  } catch (error: unknown) {
    console.error('Error in PUT /api/settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings', details: String(error) },
      { status: 500 }
    )
  }
}
