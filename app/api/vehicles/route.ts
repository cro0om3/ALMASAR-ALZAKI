import { NextRequest, NextResponse } from 'next/server'
import { dbVehicleService } from '@/lib/data/db-service'

export async function GET() {
  try {
    const vehicles = await dbVehicleService.getAll()
    return NextResponse.json(vehicles)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch vehicles', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const vehicle = await dbVehicleService.create(body)
    return NextResponse.json(vehicle, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create vehicle', details: error.message },
      { status: 500 }
    )
  }
}
