import { NextRequest, NextResponse } from 'next/server'
import { dbVendorService } from '@/lib/data/db-service'

export async function GET() {
  try {
    const vendors = await dbVendorService.getAll()
    return NextResponse.json(vendors)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch vendors', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const vendor = await dbVendorService.create(body)
    return NextResponse.json(vendor, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create vendor', details: error.message },
      { status: 500 }
    )
  }
}
