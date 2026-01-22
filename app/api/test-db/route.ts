import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Check if DATABASE_URL is set
    const hasDatabaseUrl = !!process.env.DATABASE_URL
    
    // Test database connection
    if (!prisma) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Prisma is not initialized',
          message: 'Please check DATABASE_URL environment variable',
          hasDatabaseUrl,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }

    // Test connection first
    await prisma.$connect()

    // Check all tables exist
    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `

    const expectedTables = [
      'users',
      'customers',
      'vendors',
      'vehicles',
      'employees',
      'quotations',
      'quotation_items',
      'invoices',
      'invoice_items',
      'purchase_orders',
      'purchase_order_items',
      'receipts',
      'payslips'
    ]

    const foundTables = tables.map(t => t.table_name)
    const missingTables = expectedTables.filter(t => !foundTables.includes(t))

    // Try to query the database
    const customerCount = await prisma.customer.count()
    const quotationCount = await prisma.quotation.count()
    const invoiceCount = await prisma.invoice.count()
    const employeeCount = await prisma.employee.count()
    const vehicleCount = await prisma.vehicle.count()
    const vendorCount = await prisma.vendor.count()

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      database: {
        url: process.env.DATABASE_URL ? 'Set ✅' : 'Not set ❌',
        connected: true,
        tables: {
          total: tables.length,
          expected: expectedTables.length,
          found: foundTables,
          missing: missingTables,
        },
      },
      data: {
        customers: customerCount,
        quotations: quotationCount,
        invoices: invoiceCount,
        employees: employeeCount,
        vehicles: vehicleCount,
        vendors: vendorCount,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Database connection failed',
        details: error.toString(),
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
