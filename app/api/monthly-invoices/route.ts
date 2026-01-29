import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

function serializeInvoice(inv: any) {
  return {
    ...inv,
    date: typeof inv.date === 'string' ? inv.date : inv.date?.toISOString?.(),
    dueDate: typeof inv.dueDate === 'string' ? inv.dueDate : inv.dueDate?.toISOString?.(),
    usageEntries: Array.isArray(inv.usageEntries) ? inv.usageEntries : (typeof inv.usageEntries === 'string' ? (inv.usageEntries ? JSON.parse(inv.usageEntries) : []) : []),
    createdAt: typeof inv.createdAt === 'string' ? inv.createdAt : inv.createdAt?.toISOString?.(),
    updatedAt: typeof inv.updatedAt === 'string' ? inv.updatedAt : inv.updatedAt?.toISOString?.(),
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const supabase = createServerClient()
    let query = supabase.from('monthly_invoices').select('*').order('createdAt', { ascending: false })
    if (projectId) query = query.eq('projectId', projectId)
    const { data, error } = await query
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch monthly invoices', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json((data || []).map(serializeInvoice))
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch monthly invoices', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServerClient()
    const now = new Date().toISOString()
    const id = body.id || `mi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const row = {
      id,
      invoiceNumber: body.invoiceNumber,
      projectId: body.projectId,
      customerId: body.customerId,
      month: body.month,
      year: body.year,
      usageEntries: body.usageEntries ? JSON.stringify(Array.isArray(body.usageEntries) ? body.usageEntries : []) : '[]',
      totalHours: body.totalHours ?? null,
      totalDays: body.totalDays ?? null,
      subtotal: body.subtotal ?? 0,
      taxRate: body.taxRate ?? 0,
      taxAmount: body.taxAmount ?? 0,
      total: body.total ?? 0,
      status: body.status || 'draft',
      date: body.date,
      dueDate: body.dueDate,
      paidAmount: body.paidAmount ?? 0,
      notes: body.notes ?? null,
      createdAt: now,
      updatedAt: now,
    }
    const { data, error } = await supabase.from('monthly_invoices').insert(row).select().single()
    if (error) {
      return NextResponse.json(
        { error: 'Failed to create monthly invoice', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(serializeInvoice(data), { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create monthly invoice', details: error.message },
      { status: 500 }
    )
  }
}
