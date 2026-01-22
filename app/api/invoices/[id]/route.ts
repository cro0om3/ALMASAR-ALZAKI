import { NextRequest, NextResponse } from 'next/server'
import { dbInvoiceService } from '@/lib/data/db-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoice = await dbInvoiceService.getById(params.id)
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(invoice)
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
    const invoice = await dbInvoiceService.update(params.id, body)
    return NextResponse.json(invoice)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update invoice', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbInvoiceService.delete(params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete invoice', details: error.message },
      { status: 500 }
    )
  }
}
