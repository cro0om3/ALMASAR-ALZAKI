import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/lib/data/user-service'

export async function GET() {
  try {
    const users = await userService.getAll()
    // Don't return hashed PIN codes
    const safeUsers = users.map(({ pinCode, ...user }) => user)
    return NextResponse.json(safeUsers)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, pinCode, role } = body

    if (!email || !name || !pinCode || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const user = await userService.create({
      email,
      name,
      pinCode,
      role,
    })

    // Don't return hashed PIN code
    const { pinCode: _, ...safeUser } = user
    return NextResponse.json(safeUser, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create user', details: error.message },
      { status: 500 }
    )
  }
}
