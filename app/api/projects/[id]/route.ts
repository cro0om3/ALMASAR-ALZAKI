import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

function serializeProject(p: any) {
  return {
    ...p,
    startDate: typeof p.startDate === 'string' ? p.startDate : p.startDate?.toISOString?.(),
    endDate: p.endDate ? (typeof p.endDate === 'string' ? p.endDate : p.endDate?.toISOString?.()) : undefined,
    poDate: p.poDate ? (typeof p.poDate === 'string' ? p.poDate : p.poDate?.toISOString?.()) : undefined,
    assignedVehicles: Array.isArray(p.assignedVehicles) ? p.assignedVehicles : (typeof p.assignedVehicles === 'string' ? (p.assignedVehicles ? JSON.parse(p.assignedVehicles) : []) : []),
    createdAt: typeof p.createdAt === 'string' ? p.createdAt : p.createdAt?.toISOString?.(),
    updatedAt: typeof p.updatedAt === 'string' ? p.updatedAt : p.updatedAt?.toISOString?.(),
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(serializeProject(data))
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch project', details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const supabase = createServerClient()
    const update: Record<string, unknown> = {
      ...body,
      updatedAt: new Date().toISOString(),
    }
    if (body.assignedVehicles != null) {
      update.assignedVehicles = JSON.stringify(Array.isArray(body.assignedVehicles) ? body.assignedVehicles : [])
    }
    if (body.startDate) update.startDate = body.startDate
    if (body.endDate !== undefined) update.endDate = body.endDate
    if (body.poDate !== undefined) update.poDate = body.poDate

    const { data, error } = await supabase
      .from('projects')
      .update(update)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update project', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(serializeProject(data))
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update project', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { error } = await supabase.from('projects').delete().eq('id', params.id)
    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete project', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete project', details: error.message },
      { status: 500 }
    )
  }
}
