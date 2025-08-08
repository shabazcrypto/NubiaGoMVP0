import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/services/auth.service'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    const user = await authService.signIn(email, password)
    const token = await authService.getAuthToken()

    if (!token) {
      return NextResponse.json(
        { error: 'Failed to generate authentication token' },
        { status: 500 }
      )
    }

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified
        },
        token
      },
      message: 'Login successful'
    })

    // Set JWT token as HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error)
    
    // Handle specific email verification error
    if (error.message.includes('verify your email')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email verification required',
          message: error.message,
          requiresVerification: true
        },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Login failed',
        message: error.message || 'Invalid email or password'
      },
      { status: 401 }
    )
  }
} 