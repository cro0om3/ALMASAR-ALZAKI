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
    console.error('Error in GET /api/settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings', details: String(error) },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServerClient()

    const { data: existing } = await supabase
      .from('app_settings')
      .select('settings')
      .eq('id', SETTINGS_ID)
      .single()

    const currentSettings = (existing?.settings as Record<string, unknown>) || {}
    const merged = { ...currentSettings, ...body, updatedAt: new Date().toISOString() }

    const { error } = await supabase
      .from('app_settings')
      .upsert(
        { id: SETTINGS_ID, settings: merged, updatedAt: new Date().toISOString() },
        { onConflict: 'id' }
      )

    if (error) {
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
