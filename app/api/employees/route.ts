import { NextRequest, NextResponse } from 'next/server'
import { dbEmployeeService } from '@/lib/data/db-service'

export async function GET() {
  try {
    const employees = await dbEmployeeService.getAll()
    return NextResponse.json(employees)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch employees', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const employee = await dbEmployeeService.create(body)
    return NextResponse.json(employee, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create employee', details: error.message },
      { status: 500 }
    )
  }
}
