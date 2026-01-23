import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/lib/data/user-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, pinCode } = body

    if (!email || !pinCode) {
      return NextResponse.json(
        { error: 'Email and PIN code are required' },
        { status: 400 }
      )
    }

    const verifiedUser = await userService.verifyPinCode(email, pinCode)
    if (!verifiedUser) {
      return NextResponse.json(
        { error: 'Invalid email or PIN code' },
        { status: 401 }
      )
    }

    // Don't return hashed PIN code
    const { pinCode: _, ...safeUser } = verifiedUser
    return NextResponse.json(safeUser)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to authenticate', details: error.message },
      { status: 500 }
    )
  }
}
