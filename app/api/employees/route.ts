import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

function toEmployeeRow(body: any) {
  const now = new Date().toISOString()
  return {
    id: body.id || `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    employeeNumber: body.employeeNumber,
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    phone: body.phone,
    address: body.address,
    city: body.city,
    state: body.state,
    zipCode: body.zipCode,
    country: body.country,
    position: body.position,
    department: body.department,
    hireDate: body.hireDate,
    salary: body.salary ?? 0,
    status: body.status || 'active',
    createdAt: body.createdAt || now,
    updatedAt: now,
  }
}

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching employees:', error)
      return NextResponse.json(
        { error: 'Failed to fetch employees', details: error.message },
        { status: 500 }
      )
    }

    const employees = (data || []).map((e: any) => ({
      ...e,
      hireDate: typeof e.hireDate === 'string' ? e.hireDate : e.hireDate?.toISOString?.(),
      createdAt: typeof e.createdAt === 'string' ? e.createdAt : e.createdAt?.toISOString?.(),
      updatedAt: typeof e.updatedAt === 'string' ? e.updatedAt : e.updatedAt?.toISOString?.(),
    }))
    return NextResponse.json(employees)
  } catch (error: any) {
    console.error('Error in GET /api/employees:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employees', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServerClient()
    const row = toEmployeeRow(body)

    const { data, error } = await supabase
      .from('employees')
      .insert(row)
      .select()
      .single()

    if (error) {
      console.error('Error creating employee:', error)
      return NextResponse.json(
        { error: 'Failed to create employee', details: error.message },
        { status: 500 }
      )
    }

    const employee = {
      ...data,
      hireDate: typeof data.hireDate === 'string' ? data.hireDate : data.hireDate?.toISOString?.(),
      createdAt: typeof data.createdAt === 'string' ? data.createdAt : data.createdAt?.toISOString?.(),
      updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : data.updatedAt?.toISOString?.(),
    }
    return NextResponse.json(employee, { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/employees:', error)
    return NextResponse.json(
      { error: 'Failed to create employee', details: error.message },
      { status: 500 }
    )
  }
}
