import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

function serializePayslip(p: any) {
  return {
    ...p,
    payPeriodStart: typeof p.payPeriodStart === 'string' ? p.payPeriodStart : p.payPeriodStart?.toISOString?.(),
    payPeriodEnd: typeof p.payPeriodEnd === 'string' ? p.payPeriodEnd : p.payPeriodEnd?.toISOString?.(),
    issueDate: typeof p.issueDate === 'string' ? p.issueDate : p.issueDate?.toISOString?.(),
    createdAt: typeof p.createdAt === 'string' ? p.createdAt : p.createdAt?.toISOString?.(),
    updatedAt: typeof p.updatedAt === 'string' ? p.updatedAt : p.updatedAt?.toISOString?.(),
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('payslips')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Payslip not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(serializePayslip(data))
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
    const supabase = createServerClient()
    const update: Record<string, unknown> = { ...body, updatedAt: new Date().toISOString() }
    if (body.payPeriodStart) update.payPeriodStart = body.payPeriodStart
    if (body.payPeriodEnd) update.payPeriodEnd = body.payPeriodEnd
    if (body.issueDate) update.issueDate = body.issueDate

    const { data, error } = await supabase
      .from('payslips')
      .update(update)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update payslip', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(serializePayslip(data))
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update payslip', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { error } = await supabase.from('payslips').delete().eq('id', params.id)
    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete payslip', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete payslip', details: error.message },
      { status: 500 }
    )
  }
}
