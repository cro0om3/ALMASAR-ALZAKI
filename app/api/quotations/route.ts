import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

function serializeQuotation(q: any) {
  const items = (q.quotation_items || q.items || []).map((it: any) => ({
    id: it.id,
    quotationId: it.quotationId,
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
    ...q,
    items,
    quotation_items: undefined,
    date: typeof q.date === 'string' ? q.date : q.date?.toISOString?.(),
    validUntil: typeof q.validUntil === 'string' ? q.validUntil : q.validUntil?.toISOString?.(),
    createdAt: typeof q.createdAt === 'string' ? q.createdAt : q.createdAt?.toISOString?.(),
    updatedAt: typeof q.updatedAt === 'string' ? q.updatedAt : q.updatedAt?.toISOString?.(),
  }
}

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('quotations')
      .select('*, quotation_items(*)')
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching quotations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch quotations', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json((data || []).map(serializeQuotation))
  } catch (error: any) {
    console.error('Error in GET /api/quotations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quotations', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServerClient()
    const now = new Date().toISOString()
    const { items = [], ...quotationData } = body
    const id = quotationData.id || `qt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const quotationRow = {
      id,
      quotationNumber: quotationData.quotationNumber,
      customerId: quotationData.customerId,
      date: quotationData.date,
      validUntil: quotationData.validUntil,
      subtotal: quotationData.subtotal ?? 0,
      taxRate: quotationData.taxRate ?? 0,
      taxAmount: quotationData.taxAmount ?? 0,
      discount: quotationData.discount ?? 0,
      total: quotationData.total ?? 0,
      status: quotationData.status || 'draft',
      terms: quotationData.terms ?? null,
      notes: quotationData.notes ?? null,
      createdAt: quotationData.createdAt || now,
      updatedAt: now,
    }

    const { data: quotation, error: qError } = await supabase
      .from('quotations')
      .insert(quotationRow)
      .select()
      .single()

    if (qError) {
      console.error('Error creating quotation:', qError)
      return NextResponse.json(
        { error: 'Failed to create quotation', details: qError.message },
        { status: 500 }
      )
    }

    if (items.length > 0) {
      const itemRows = items.map((it: any, i: number) => ({
        id: it.id || `qi_${id}_${i}_${Date.now()}`,
        quotationId: id,
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discount: it.discount ?? 0,
        tax: it.tax ?? 0,
        total: it.total,
        createdAt: now,
        updatedAt: now,
      }))
      const { error: itemsError } = await supabase.from('quotation_items').insert(itemRows)
      if (itemsError) {
        console.error('Error creating quotation items:', itemsError)
      }
    }

    const { data: full } = await supabase
      .from('quotations')
      .select('*, quotation_items(*)')
      .eq('id', id)
      .single()
    return NextResponse.json(serializeQuotation(full || quotation), { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/quotations:', error)
    return NextResponse.json(
      { error: 'Failed to create quotation', details: error.message },
      { status: 500 }
    )
  }
}
