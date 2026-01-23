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
    
    // More specific error messages
    let errorMessage = error.message || 'Failed to authenticate'
    let errorDetails = undefined
    
    if (errorMessage.includes('Can\'t reach database server') || 
        errorMessage.includes('Connection timeout') ||
        errorMessage.includes('DATABASE_URL')) {
      errorMessage = 'Database connection failed. Please check environment variables.'
      errorDetails = process.env.NODE_ENV === 'development' ? error.message : 'Check DATABASE_URL in Vercel Settings'
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorDetails || error.message : errorDetails
      },
      { status: 500 }
    )
  }
}
