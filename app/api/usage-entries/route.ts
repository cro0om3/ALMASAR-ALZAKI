import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

function serializeEntry(e: any) {
  return {
    ...e,
    date: typeof e.date === 'string' ? e.date : e.date?.toISOString?.(),
    createdAt: typeof e.createdAt === 'string' ? e.createdAt : e.createdAt?.toISOString?.(),
    updatedAt: typeof e.updatedAt === 'string' ? e.updatedAt : e.updatedAt?.toISOString?.(),
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const supabase = createServerClient()
    let query = supabase.from('usage_entries').select('*').order('date', { ascending: false })
    if (projectId) query = query.eq('projectId', projectId)
    const { data, error } = await query
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch usage entries', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json((data || []).map(serializeEntry))
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch usage entries', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServerClient()
    const now = new Date().toISOString()
    const id = body.id || `use_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const row = {
      id,
      projectId: body.projectId,
      vehicleId: body.vehicleId,
      date: body.date,
      hours: body.hours ?? null,
      days: body.days ?? null,
      startTime: body.startTime ?? null,
      endTime: body.endTime ?? null,
      description: body.description,
      location: body.location ?? null,
      rate: body.rate ?? 0,
      total: body.total ?? 0,
      invoiced: body.invoiced ?? false,
      invoiceId: body.invoiceId ?? null,
      createdAt: now,
      updatedAt: now,
    }
    const { data, error } = await supabase.from('usage_entries').insert(row).select().single()
    if (error) {
      return NextResponse.json(
        { error: 'Failed to create usage entry', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(serializeEntry(data), { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create usage entry', details: error.message },
      { status: 500 }
    )
  }
}
