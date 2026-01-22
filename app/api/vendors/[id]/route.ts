import { NextRequest, NextResponse } from 'next/server'
import { dbVendorService } from '@/lib/data/db-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendor = await dbVendorService.getById(params.id)
    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(vendor)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch vendor', details: error.message },
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
    const vendor = await dbVendorService.update(params.id, body)
    return NextResponse.json(vendor)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update vendor', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbVendorService.delete(params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete vendor', details: error.message },
      { status: 500 }
    )
  }
}
