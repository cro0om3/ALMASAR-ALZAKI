import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/lib/data/user-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pinCode } = body

    if (!pinCode) {
      return NextResponse.json(
        { error: 'PIN code is required' },
        { status: 400 }
      )
    }

    // Verify PIN code
    const verifiedUser = await userService.verifyPinCode(pinCode)
    
    if (!verifiedUser) {
      return NextResponse.json(
        { error: 'Invalid PIN code' },
        { status: 401 }
      )
    }

    // Don't return hashed PIN code
    const { pinCode: _, ...safeUser } = verifiedUser
    return NextResponse.json(safeUser)
  } catch (error: any) {
    console.error('Login error:', error)
    // Return more specific error message
    const errorMessage = error.message || 'Failed to authenticate'
    return NextResponse.json(
      { 
        error: 'Failed to authenticate', 
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined 
      },
      { status: 500 }
    )
  }
}
