import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data: vendor, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(vendor)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch vendor', details: error.message },
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
    
    const { data: vendor, error } = await supabase
      .from('vendors')
      .update({ ...body, updatedAt: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update vendor', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(vendor)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update vendor', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete vendor', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete vendor', details: error.message },
      { status: 500 }
    )
  }
}
