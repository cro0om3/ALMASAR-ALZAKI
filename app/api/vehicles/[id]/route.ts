import { NextRequest, NextResponse } from 'next/server'
import { dbVehicleService } from '@/lib/data/db-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vehicle = await dbVehicleService.getById(params.id)
    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(vehicle)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch vehicle', details: error.message },
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
    const vehicle = await dbVehicleService.update(params.id, body)
    return NextResponse.json(vehicle)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update vehicle', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbVehicleService.delete(params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete vehicle', details: error.message },
      { status: 500 }
    )
  }
}
