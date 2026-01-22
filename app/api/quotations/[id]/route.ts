import { NextRequest, NextResponse } from 'next/server'
import { dbQuotationService } from '@/lib/data/db-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quotation = await dbQuotationService.getById(params.id)
    if (!quotation) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(quotation)
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
    const quotation = await dbQuotationService.update(params.id, body)
    return NextResponse.json(quotation)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update quotation', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbQuotationService.delete(params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete quotation', details: error.message },
      { status: 500 }
    )
  }
}
