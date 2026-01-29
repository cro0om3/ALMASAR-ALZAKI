import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(customer)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch customer', details: error.message },
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
    
    const { data: customer, error } = await supabase
      .from('customers')
      .update({ ...body, updatedAt: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update customer', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(customer)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update customer', details: error.message },
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
      .from('customers')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete customer', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete customer', details: error.message },
      { status: 500 }
    )
  }
}
