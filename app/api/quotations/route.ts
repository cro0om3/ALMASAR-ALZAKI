import { NextRequest, NextResponse } from 'next/server'
import { dbQuotationService } from '@/lib/data/db-service'

export async function GET() {
  try {
    const quotations = await dbQuotationService.getAll()
    return NextResponse.json(quotations)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch quotations', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const quotation = await dbQuotationService.create(body)
    return NextResponse.json(quotation, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create quotation', details: error.message },
      { status: 500 }
    )
  }
}
