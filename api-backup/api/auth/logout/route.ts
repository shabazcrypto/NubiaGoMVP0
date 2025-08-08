import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/services/auth.service'

export async function POST(request: NextRequest) {
  try {
    await authService.signOut()

    const response = NextResponse.json({
      success: true,
      message: 'Logout successful'
    })

    // Clear the auth token cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0 // Expire immediately
    })

    return response
  } catch (error: any) {
    console.error('Logout error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Logout failed',
        message: error.message || 'Failed to logout'
      },
      { status: 500 }
    )
  }
} 