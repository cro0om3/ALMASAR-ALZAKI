import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

function serializeEmployee(e: any) {
  return {
    ...e,
    hireDate: typeof e.hireDate === 'string' ? e.hireDate : e.hireDate?.toISOString?.(),
    createdAt: typeof e.createdAt === 'string' ? e.createdAt : e.createdAt?.toISOString?.(),
    updatedAt: typeof e.updatedAt === 'string' ? e.updatedAt : e.updatedAt?.toISOString?.(),
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(serializeEmployee(data))
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
    const id = params.id
    const body = await request.json()
    const supabase = createServerClient()

    const update: Record<string, unknown> = { ...body, updatedAt: new Date().toISOString() }
    if (body.hireDate) update.hireDate = body.hireDate

    const { data, error } = await supabase
      .from('employees')
      .update(update)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update employee', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(serializeEmployee(data))
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update employee', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const supabase = createServerClient()
    const { error } = await supabase.from('employees').delete().eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete employee', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete employee', details: error.message },
      { status: 500 }
    )
  }
}
