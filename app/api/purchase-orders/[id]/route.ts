import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

function serializePurchaseOrder(po: any) {
  const items = (po.purchase_order_items || po.items || []).map((it: any) => ({
    id: it.id,
    purchaseOrderId: it.purchaseOrderId,
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
    ...po,
    items,
    purchase_order_items: undefined,
    date: typeof po.date === 'string' ? po.date : po.date?.toISOString?.(),
    expectedDelivery: typeof po.expectedDelivery === 'string' ? po.expectedDelivery : po.expectedDelivery?.toISOString?.(),
    createdAt: typeof po.createdAt === 'string' ? po.createdAt : po.createdAt?.toISOString?.(),
    updatedAt: typeof po.updatedAt === 'string' ? po.updatedAt : po.updatedAt?.toISOString?.(),
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*, purchase_order_items(*)')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(serializePurchaseOrder(data))
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch purchase order', details: error.message },
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
    const { items = [], ...orderData } = body
    const now = new Date().toISOString()

    const update = {
      ...orderData,
      date: orderData.date,
      expectedDelivery: orderData.expectedDelivery,
      updatedAt: now,
    }

    const { error: updError } = await supabase
      .from('purchase_orders')
      .update(update)
      .eq('id', id)
    if (updError) {
      return NextResponse.json(
        { error: 'Failed to update purchase order', details: updError.message },
        { status: 500 }
      )
    }

    await supabase.from('purchase_order_items').delete().eq('purchaseOrderId', id)
    if (items.length > 0) {
      const itemRows = items.map((it: any, i: number) => ({
        id: it.id || `poi_${id}_${i}_${Date.now()}`,
        purchaseOrderId: id,
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discount: it.discount ?? 0,
        tax: it.tax ?? 0,
        total: it.total,
        createdAt: now,
        updatedAt: now,
      }))
      await supabase.from('purchase_order_items').insert(itemRows)
    }

    const { data: full } = await supabase
      .from('purchase_orders')
      .select('*, purchase_order_items(*)')
      .eq('id', id)
      .single()
    return NextResponse.json(serializePurchaseOrder(full!))
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update purchase order', details: error.message },
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
    const { error } = await supabase.from('purchase_orders').delete().eq('id', params.id)
    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete purchase order', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete purchase order', details: error.message },
      { status: 500 }
    )
  }
}
