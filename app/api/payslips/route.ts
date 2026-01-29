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

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('payslips')
      .select('*')
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching payslips:', error)
      return NextResponse.json(
        { error: 'Failed to fetch payslips', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json((data || []).map(serializePayslip))
  } catch (error: any) {
    console.error('Error in GET /api/payslips:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payslips', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServerClient()
    const now = new Date().toISOString()
    const id = body.id || `ps_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const row = {
      id,
      payslipNumber: body.payslipNumber,
      employeeId: body.employeeId,
      payPeriodStart: body.payPeriodStart,
      payPeriodEnd: body.payPeriodEnd,
      issueDate: body.issueDate,
      baseSalary: body.baseSalary ?? 0,
      overtime: body.overtime ?? 0,
      bonuses: body.bonuses ?? 0,
      deductions: body.deductions ?? 0,
      tax: body.tax ?? 0,
      netPay: body.netPay ?? 0,
      status: body.status || 'draft',
      notes: body.notes ?? null,
      createdAt: body.createdAt || now,
      updatedAt: now,
    }

    const { data, error } = await supabase.from('payslips').insert(row).select().single()
    if (error) {
      console.error('Error creating payslip:', error)
      return NextResponse.json(
        { error: 'Failed to create payslip', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(serializePayslip(data), { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/payslips:', error)
    return NextResponse.json(
      { error: 'Failed to create payslip', details: error.message },
      { status: 500 }
    )
  }
}
