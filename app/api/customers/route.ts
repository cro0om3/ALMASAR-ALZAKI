import { NextRequest, NextResponse } from 'next/server'
import { dbCustomerService } from '@/lib/data/db-service'

export async function GET() {
  try {
    const customers = await dbCustomerService.getAll()
    return NextResponse.json(customers)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const customer = await dbCustomerService.create(body)
    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}
