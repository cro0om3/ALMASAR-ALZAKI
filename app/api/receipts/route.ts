import { NextRequest, NextResponse } from 'next/server'
import { dbReceiptService } from '@/lib/data/db-service'

export async function GET() {
  try {
    const receipts = await dbReceiptService.getAll()
    return NextResponse.json(receipts)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch receipts', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const receipt = await dbReceiptService.create(body)
    return NextResponse.json(receipt, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create receipt', details: error.message },
      { status: 500 }
    )
  }
}
