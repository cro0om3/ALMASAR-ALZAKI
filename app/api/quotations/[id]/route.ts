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

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('quotations')
      .select('*, quotation_items(*)')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(serializeQuotation(data))
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch quotation', details: error.message },
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
    const { items = [], ...quotationData } = body
    const now = new Date().toISOString()

    const update = {
      ...quotationData,
      date: quotationData.date,
      validUntil: quotationData.validUntil,
      updatedAt: now,
    }

    const { error: updError } = await supabase
      .from('quotations')
      .update(update)
      .eq('id', id)

    if (updError) {
      return NextResponse.json(
        { error: 'Failed to update quotation', details: updError.message },
        { status: 500 }
      )
    }

    await supabase.from('quotation_items').delete().eq('quotationId', id)
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
      await supabase.from('quotation_items').insert(itemRows)
    }

    const { data: full } = await supabase
      .from('quotations')
      .select('*, quotation_items(*)')
      .eq('id', id)
      .single()
    return NextResponse.json(serializeQuotation(full!))
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update quotation', details: error.message },
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
    const { error } = await supabase.from('quotations').delete().eq('id', params.id)
    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete quotation', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete quotation', details: error.message },
      { status: 500 }
    )
  }
}
