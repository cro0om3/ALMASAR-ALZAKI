import { NextRequest, NextResponse } from 'next/server'
import { dbPayslipService } from '@/lib/data/db-service'

export async function GET() {
  try {
    const payslips = await dbPayslipService.getAll()
    return NextResponse.json(payslips)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch payslips', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const payslip = await dbPayslipService.create(body)
    return NextResponse.json(payslip, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create payslip', details: error.message },
      { status: 500 }
    )
  }
}
