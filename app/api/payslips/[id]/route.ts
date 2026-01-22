import { NextRequest, NextResponse } from 'next/server'
import { dbPayslipService } from '@/lib/data/db-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payslip = await dbPayslipService.getById(params.id)
    if (!payslip) {
      return NextResponse.json(
        { error: 'Payslip not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(payslip)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch payslip', details: error.message },
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
    const payslip = await dbPayslipService.update(params.id, body)
    return NextResponse.json(payslip)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update payslip', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbPayslipService.delete(params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete payslip', details: error.message },
      { status: 500 }
    )
  }
}
