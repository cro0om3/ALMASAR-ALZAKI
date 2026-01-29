import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

function serializeVehicle(v: any) {
  return {
    ...v,
    purchaseDate: typeof v.purchaseDate === 'string' ? v.purchaseDate : v.purchaseDate?.toISOString?.(),
    createdAt: typeof v.createdAt === 'string' ? v.createdAt : v.createdAt?.toISOString?.(),
    updatedAt: typeof v.updatedAt === 'string' ? v.updatedAt : v.updatedAt?.toISOString?.(),
  }
}

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching vehicles:', error)
      return NextResponse.json(
        { error: 'Failed to fetch vehicles', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json((data || []).map(serializeVehicle))
  } catch (error: any) {
    console.error('Error in GET /api/vehicles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicles', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServerClient()
    const now = new Date().toISOString()
    const id = body.id || `veh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const row = {
      id,
      make: body.make,
      model: body.model,
      year: body.year,
      licensePlate: body.licensePlate,
      vin: body.vin,
      color: body.color,
      mileage: body.mileage ?? 0,
      purchaseDate: body.purchaseDate,
      purchasePrice: body.purchasePrice,
      status: body.status || 'active',
      notes: body.notes ?? null,
      createdAt: body.createdAt || now,
      updatedAt: now,
    }

    const { data, error } = await supabase.from('vehicles').insert(row).select().single()

    if (error) {
      console.error('Error creating vehicle:', error)
      return NextResponse.json(
        { error: 'Failed to create vehicle', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(serializeVehicle(data), { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/vehicles:', error)
    return NextResponse.json(
      { error: 'Failed to create vehicle', details: error.message },
      { status: 500 }
    )
  }
}
