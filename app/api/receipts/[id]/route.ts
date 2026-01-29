import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

function serializeReceipt(r: any) {
  return {
    ...r,
    date: typeof r.date === 'string' ? r.date : r.date?.toISOString?.(),
    paymentDate: typeof r.paymentDate === 'string' ? r.paymentDate : r.paymentDate?.toISOString?.(),
    createdAt: typeof r.createdAt === 'string' ? r.createdAt : r.createdAt?.toISOString?.(),
    updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : r.updatedAt?.toISOString?.(),
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Receipt not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(serializeReceipt(data))
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch receipt', details: error.message },
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
    if (body.date) update.date = body.date
    if (body.paymentDate) update.paymentDate = body.paymentDate

    const { data, error } = await supabase
      .from('receipts')
      .update(update)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update receipt', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(serializeReceipt(data))
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update receipt', details: error.message },
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
    const { error } = await supabase.from('receipts').delete().eq('id', params.id)
    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete receipt', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete receipt', details: error.message },
      { status: 500 }
    )
  }
}
