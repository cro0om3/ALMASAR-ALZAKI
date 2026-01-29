import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/lib/data/user-service'

export async function GET() {
  try {
    const users = await userService.getAll()
    const safeUsers = users.map(({ pinCode, ...user }) => ({
      ...user,
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
      updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
    }))
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
    const user = await userService.create({ email, name, pinCode, role })
    const { pinCode: _, ...safeUser } = user
    return NextResponse.json(
      {
        ...safeUser,
        createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
        updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
      },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create user', details: error.message },
      { status: 500 }
    )
  }
}
