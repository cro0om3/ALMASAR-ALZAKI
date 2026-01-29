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

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }
    return NextResponse.json(serializeVehicle(data))
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch vehicle', details: error.message },
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
    const update: Record<string, unknown> = { ...body, updatedAt: new Date().toISOString() }
    if (body.purchaseDate) update.purchaseDate = body.purchaseDate

    const { data, error } = await supabase
      .from('vehicles')
      .update(update)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update vehicle', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(serializeVehicle(data))
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update vehicle', details: error.message },
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
    const { error } = await supabase.from('vehicles').delete().eq('id', params.id)
    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete vehicle', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete vehicle', details: error.message },
      { status: 500 }
    )
  }
}
