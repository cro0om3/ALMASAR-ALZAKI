import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

function serializeInvoice(inv: any) {
  const items = (inv.invoice_items || inv.items || []).map((it: any) => ({
    id: it.id,
    invoiceId: it.invoiceId,
    description: it.description,
    quantity: it.quantity,
    unitPrice: it.unitPrice,
    discount: it.discount ?? 0,
    tax: it.tax,
    total: it.total,
    createdAt: typeof it.createdAt === 'string' ? it.createdAt : it.createdAt?.toISOString?.(),
    updatedAt: typeof it.updatedAt === 'string' ? it.updatedAt : it.updatedAt?.toISOString?.(),
  }))
  return {
    ...inv,
    items,
    invoice_items: undefined,
    date: typeof inv.date === 'string' ? inv.date : inv.date?.toISOString?.(),
    dueDate: typeof inv.dueDate === 'string' ? inv.dueDate : inv.dueDate?.toISOString?.(),
    createdAt: typeof inv.createdAt === 'string' ? inv.createdAt : inv.createdAt?.toISOString?.(),
    updatedAt: typeof inv.updatedAt === 'string' ? inv.updatedAt : inv.updatedAt?.toISOString?.(),
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('invoices')
      .select('*, invoice_items(*)')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(serializeInvoice(data))
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch invoice', details: error.message },
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
    const id = params.id
    const { items = [], ...invoiceData } = body
    const now = new Date().toISOString()

    const update = {
      ...invoiceData,
      date: invoiceData.date,
      dueDate: invoiceData.dueDate,
      updatedAt: now,
    }

    const { error: updError } = await supabase.from('invoices').update(update).eq('id', id)
    if (updError) {
      return NextResponse.json(
        { error: 'Failed to update invoice', details: updError.message },
        { status: 500 }
      )
    }

    await supabase.from('invoice_items').delete().eq('invoiceId', id)
    if (items.length > 0) {
      const itemRows = items.map((it: any, i: number) => ({
        id: it.id || `ii_${id}_${i}_${Date.now()}`,
        invoiceId: id,
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discount: it.discount ?? 0,
        tax: it.tax ?? 0,
        total: it.total,
        createdAt: now,
        updatedAt: now,
      }))
      await supabase.from('invoice_items').insert(itemRows)
    }

    const { data: full } = await supabase
      .from('invoices')
      .select('*, invoice_items(*)')
      .eq('id', id)
      .single()
    return NextResponse.json(serializeInvoice(full!))
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update invoice', details: error.message },
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
    const { error } = await supabase.from('invoices').delete().eq('id', params.id)
    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete invoice', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete invoice', details: error.message },
      { status: 500 }
    )
  }
}
