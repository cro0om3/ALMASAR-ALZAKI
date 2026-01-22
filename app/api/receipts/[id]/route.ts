import { NextRequest, NextResponse } from 'next/server'
import { dbReceiptService } from '@/lib/data/db-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const receipt = await dbReceiptService.getById(params.id)
    if (!receipt) {
      return NextResponse.json(
        { error: 'Receipt not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(receipt)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch receipt', details: error.message },
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
    const receipt = await dbReceiptService.update(params.id, body)
    return NextResponse.json(receipt)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update receipt', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbReceiptService.delete(params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete receipt', details: error.message },
      { status: 500 }
    )
  }
}
