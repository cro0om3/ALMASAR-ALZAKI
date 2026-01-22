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
          message: 'Please run: npx prisma generate',
          hasDatabaseUrl,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }

    // Test connection first with timeout
    try {
      await Promise.race([
        prisma.$connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
        )
      ])
    } catch (connectError: any) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to connect to database',
          errorType: 'Connection Error',
          errorDetails: connectError.message,
          hasDatabaseUrl,
          databaseUrlPreview: process.env.DATABASE_URL 
            ? `${process.env.DATABASE_URL.substring(0, 50)}...` 
            : 'Not set',
          solution: 'Check DATABASE_URL in Vercel Environment Variables and ensure Supabase project is active',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }

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
    // More detailed error information
    const errorMessage = error.message || 'Database connection failed'
    const errorDetails = error.toString()
    const errorCode = error.code || 'UNKNOWN'
    
    // Check specific error types
    let errorType = 'Unknown error'
    if (errorMessage.includes('does not exist')) {
      errorType = 'Table does not exist - Run supabase-schema.sql in Supabase SQL Editor'
    } else if (errorMessage.includes('connection') || errorMessage.includes('ECONNREFUSED')) {
      errorType = 'Connection failed - Check DATABASE_URL in Vercel Environment Variables'
    } else if (errorMessage.includes('authentication')) {
      errorType = 'Authentication failed - Check database password in DATABASE_URL'
    } else if (errorMessage.includes('timeout')) {
      errorType = 'Connection timeout - Check if Supabase project is active'
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        errorType,
        errorCode,
        details: errorDetails,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlPreview: process.env.DATABASE_URL 
          ? `${process.env.DATABASE_URL.substring(0, 30)}...` 
          : 'Not set',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
