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

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*, purchase_order_items(*)')
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching purchase orders:', error)
      return NextResponse.json(
        { error: 'Failed to fetch purchase orders', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json((data || []).map(serializePurchaseOrder))
  } catch (error: any) {
    console.error('Error in GET /api/purchase-orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchase orders', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServerClient()
    const now = new Date().toISOString()
    const { items = [], ...orderData } = body
    const id = orderData.id || `po_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const orderRow = {
      id,
      orderNumber: orderData.orderNumber,
      vendorId: orderData.vendorId ?? null,
      customerId: orderData.customerId ?? null,
      quotationId: orderData.quotationId ?? null,
      date: orderData.date,
      expectedDelivery: orderData.expectedDelivery,
      subtotal: orderData.subtotal ?? 0,
      taxRate: orderData.taxRate ?? 0,
      taxAmount: orderData.taxAmount ?? 0,
      discount: orderData.discount ?? 0,
      total: orderData.total ?? 0,
      status: orderData.status || 'draft',
      terms: orderData.terms ?? null,
      notes: orderData.notes ?? null,
      createdAt: orderData.createdAt || now,
      updatedAt: now,
    }

    const { data: order, error: orderError } = await supabase
      .from('purchase_orders')
      .insert(orderRow)
      .select()
      .single()

    if (orderError) {
      console.error('Error creating purchase order:', orderError)
      return NextResponse.json(
        { error: 'Failed to create purchase order', details: orderError.message },
        { status: 500 }
      )
    }

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
      const { error: itemsError } = await supabase.from('purchase_order_items').insert(itemRows)
      if (itemsError) {
        console.error('Error creating purchase order items:', itemsError)
      }
    }

    const { data: full } = await supabase
      .from('purchase_orders')
      .select('*, purchase_order_items(*)')
      .eq('id', id)
      .single()
    return NextResponse.json(serializePurchaseOrder(full || order), { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/purchase-orders:', error)
    return NextResponse.json(
      { error: 'Failed to create purchase order', details: error.message },
      { status: 500 }
    )
  }
}
