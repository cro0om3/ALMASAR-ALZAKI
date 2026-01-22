import { NextRequest, NextResponse } from 'next/server'
import { dbPurchaseOrderService } from '@/lib/data/db-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await dbPurchaseOrderService.getById(params.id)
    if (!order) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(order)
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
    const order = await dbPurchaseOrderService.update(params.id, body)
    return NextResponse.json(order)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update purchase order', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbPurchaseOrderService.delete(params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete purchase order', details: error.message },
      { status: 500 }
    )
  }
}
