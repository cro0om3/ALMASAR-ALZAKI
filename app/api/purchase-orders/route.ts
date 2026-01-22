import { NextRequest, NextResponse } from 'next/server'
import { dbPurchaseOrderService } from '@/lib/data/db-service'

export async function GET() {
  try {
    const orders = await dbPurchaseOrderService.getAll()
    return NextResponse.json(orders)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch purchase orders', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const order = await dbPurchaseOrderService.create(body)
    return NextResponse.json(order, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create purchase order', details: error.message },
      { status: 500 }
    )
  }
}
