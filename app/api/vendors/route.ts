import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select('*')
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching vendors:', error)
      return NextResponse.json(
        { error: 'Failed to fetch vendors', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(vendors || [])
  } catch (error: any) {
    console.error('Error in GET /api/vendors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vendors', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServerClient()
    
    // Generate ID if not provided (using cuid-like format)
    const id = body.id || `vend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Add default values for empty fields to avoid NOT NULL constraint errors
    const vendorData = {
      id,
      name: body.name || null,
      email: body.email || null,
      phone: body.phone || null,
      address: body.address || null,
      city: body.city || null,
      state: body.state || null,
      zipCode: body.zipCode || null,
      country: body.country || null,
      contactPerson: body.contactPerson || null,
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    // Remove null values that might cause issues
    const data = vendorData as Record<string, unknown>
    Object.keys(data).forEach(key => {
      if (data[key] === null || data[key] === '') {
        delete data[key]
      }
    })
    
    const { data: vendor, error } = await supabase
      .from('vendors')
      .insert(vendorData)
      .select()
      .single()

    if (error) {
      console.error('Error creating vendor:', error)
      console.error('Vendor data attempted:', JSON.stringify(vendorData, null, 2))
      return NextResponse.json(
        { error: 'Failed to create vendor', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(vendor, { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/vendors:', error)
    return NextResponse.json(
      { error: 'Failed to create vendor', details: error.message },
      { status: 500 }
    )
  }
}
