import { NextRequest, NextResponse } from 'next/server'
import { dbInvoiceService } from '@/lib/data/db-service'

export async function GET() {
  try {
    const invoices = await dbInvoiceService.getAll()
    return NextResponse.json(invoices)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch invoices', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const invoice = await dbInvoiceService.create(body)
    return NextResponse.json(invoice, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create invoice', details: error.message },
      { status: 500 }
    )
  }
}
