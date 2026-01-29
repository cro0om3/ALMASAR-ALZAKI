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

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('invoices')
      .select('*, invoice_items(*)')
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching invoices:', error)
      return NextResponse.json(
        { error: 'Failed to fetch invoices', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json((data || []).map(serializeInvoice))
  } catch (error: any) {
    console.error('Error in GET /api/invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServerClient()
    const now = new Date().toISOString()
    const { items = [], ...invoiceData } = body
    const id = invoiceData.id || `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const invoiceRow = {
      id,
      invoiceNumber: invoiceData.invoiceNumber,
      quotationId: invoiceData.quotationId ?? null,
      customerId: invoiceData.customerId,
      date: invoiceData.date,
      dueDate: invoiceData.dueDate,
      subtotal: invoiceData.subtotal ?? 0,
      taxRate: invoiceData.taxRate ?? 0,
      taxAmount: invoiceData.taxAmount ?? 0,
      discount: invoiceData.discount ?? 0,
      total: invoiceData.total ?? 0,
      paidAmount: invoiceData.paidAmount ?? 0,
      status: invoiceData.status || 'draft',
      terms: invoiceData.terms ?? null,
      notes: invoiceData.notes ?? null,
      createdAt: invoiceData.createdAt || now,
      updatedAt: now,
    }

    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .insert(invoiceRow)
      .select()
      .single()

    if (invError) {
      console.error('Error creating invoice:', invError)
      return NextResponse.json(
        { error: 'Failed to create invoice', details: invError.message },
        { status: 500 }
      )
    }

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
      const { error: itemsError } = await supabase.from('invoice_items').insert(itemRows)
      if (itemsError) {
        console.error('Error creating invoice items:', itemsError)
      }
    }

    const { data: full } = await supabase
      .from('invoices')
      .select('*, invoice_items(*)')
      .eq('id', id)
      .single()
    return NextResponse.json(serializeInvoice(full || invoice), { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/invoices:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice', details: error.message },
      { status: 500 }
    )
  }
}
