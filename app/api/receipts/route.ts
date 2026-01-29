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

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching receipts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch receipts', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json((data || []).map(serializeReceipt))
  } catch (error: any) {
    console.error('Error in GET /api/receipts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch receipts', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServerClient()
    const now = new Date().toISOString()
    const id = body.id || `rcp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const row = {
      id,
      receiptNumber: body.receiptNumber,
      invoiceId: body.invoiceId,
      customerId: body.customerId,
      date: body.date,
      paymentDate: body.paymentDate,
      amount: body.amount,
      paymentMethod: body.paymentMethod,
      referenceNumber: body.referenceNumber ?? null,
      bankName: body.bankName ?? null,
      notes: body.notes ?? null,
      paymentImageUrl: body.paymentImageUrl ?? null,
      status: body.status || 'issued',
      createdAt: body.createdAt || now,
      updatedAt: now,
    }

    const { data, error } = await supabase.from('receipts').insert(row).select().single()
    if (error) {
      console.error('Error creating receipt:', error)
      return NextResponse.json(
        { error: 'Failed to create receipt', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(serializeReceipt(data), { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/receipts:', error)
    return NextResponse.json(
      { error: 'Failed to create receipt', details: error.message },
      { status: 500 }
    )
  }
}
