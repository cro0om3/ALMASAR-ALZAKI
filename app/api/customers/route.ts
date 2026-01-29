import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching customers:', error)
      return NextResponse.json(
        { error: 'Failed to fetch customers', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(customers || [])
  } catch (error: any) {
    console.error('Error in GET /api/customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServerClient()
    
    // Generate ID if not provided (using cuid-like format)
    const id = body.id || `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Add default values for empty fields to avoid NOT NULL constraint errors
    const customerData = {
      id,
      name: body.name || null,
      email: body.email || null,
      phone: body.phone || null,
      address: body.address || null,
      city: body.city || null,
      state: body.state || null,
      zipCode: body.zipCode || null,
      country: body.country || null,
      idNumber: body.idNumber || null,
      passportNumber: body.passportNumber || null,
      residenceIssueDate: body.residenceIssueDate || null,
      residenceExpiryDate: body.residenceExpiryDate || null,
      nationality: body.nationality || null,
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    // Remove null values that might cause issues
    const data = customerData as Record<string, unknown>
    Object.keys(data).forEach(key => {
      if (data[key] === null || data[key] === '') {
        delete data[key]
      }
    })
    
    const { data: customer, error } = await supabase
      .from('customers')
      .insert(customerData)
      .select()
      .single()

    if (error) {
      console.error('Error creating customer:', error)
      console.error('Customer data attempted:', JSON.stringify(customerData, null, 2))
      return NextResponse.json(
        { error: 'Failed to create customer', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(customer, { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/customers:', error)
    return NextResponse.json(
      { error: 'Failed to create customer', details: error.message },
      { status: 500 }
    )
  }
}
