import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    if (!prisma) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Prisma is not initialized',
          message: 'Please check DATABASE_URL environment variable'
        },
        { status: 500 }
      )
    }

    // Try to query the database
    const customerCount = await prisma.customer.count()
    const quotationCount = await prisma.quotation.count()
    const invoiceCount = await prisma.invoice.count()

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      data: {
        customers: customerCount,
        quotations: quotationCount,
        invoices: invoiceCount,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Database connection failed',
        details: error.toString(),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
