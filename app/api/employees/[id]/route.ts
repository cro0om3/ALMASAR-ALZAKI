import { NextRequest, NextResponse } from 'next/server'
import { dbEmployeeService } from '@/lib/data/db-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employee = await dbEmployeeService.getById(params.id)
    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(employee)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch employee', details: error.message },
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
    const employee = await dbEmployeeService.update(params.id, body)
    return NextResponse.json(employee)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update employee', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbEmployeeService.delete(params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete employee', details: error.message },
      { status: 500 }
    )
  }
}
