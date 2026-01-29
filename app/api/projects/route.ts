import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

function serializeProject(p: any) {
  return {
    ...p,
    startDate: typeof p.startDate === 'string' ? p.startDate : p.startDate?.toISOString?.(),
    endDate: p.endDate ? (typeof p.endDate === 'string' ? p.endDate : p.endDate?.toISOString?.()) : undefined,
    poDate: p.poDate ? (typeof p.poDate === 'string' ? p.poDate : p.poDate?.toISOString?.()) : undefined,
    assignedVehicles: Array.isArray(p.assignedVehicles) ? p.assignedVehicles : (p.assignedVehicles ? JSON.parse(p.assignedVehicles || '[]') : []),
    createdAt: typeof p.createdAt === 'string' ? p.createdAt : p.createdAt?.toISOString?.(),
    updatedAt: typeof p.updatedAt === 'string' ? p.updatedAt : p.updatedAt?.toISOString?.(),
  }
}

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json(
        { error: 'Failed to fetch projects', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json((data || []).map(serializeProject))
  } catch (error: any) {
    console.error('Error in GET /api/projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServerClient()
    const now = new Date().toISOString()
    const id = body.id || `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const row = {
      id,
      projectNumber: body.projectNumber || `PRJ-${Date.now()}`,
      quotationId: body.quotationId,
      customerId: body.customerId,
      title: body.title,
      description: body.description ?? null,
      startDate: body.startDate,
      endDate: body.endDate ?? null,
      billingType: body.billingType || 'hours',
      hourlyRate: body.hourlyRate ?? null,
      dailyRate: body.dailyRate ?? null,
      fixedAmount: body.fixedAmount ?? null,
      poNumber: body.poNumber ?? null,
      poDate: body.poDate ?? null,
      poReceived: body.poReceived ?? false,
      assignedVehicles: body.assignedVehicles ? JSON.stringify(Array.isArray(body.assignedVehicles) ? body.assignedVehicles : []) : '[]',
      status: body.status || 'draft',
      terms: body.terms ?? null,
      notes: body.notes ?? null,
      createdAt: body.createdAt || now,
      updatedAt: now,
    }

    const { data, error } = await supabase.from('projects').insert(row).select().single()
    if (error) {
      console.error('Error creating project:', error)
      return NextResponse.json(
        { error: 'Failed to create project', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(serializeProject(data), { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/projects:', error)
    return NextResponse.json(
      { error: 'Failed to create project', details: error.message },
      { status: 500 }
    )
  }
}
