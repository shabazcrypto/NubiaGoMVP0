import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/services/auth.service'
import { z } from 'zod'

const verifyEmailSchema = z.object({
  action: z.enum(['check', 'resend'])
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = verifyEmailSchema.parse(body)

    if (action === 'check') {
      const isVerified = await authService.checkEmailVerification()
      
      return NextResponse.json({
        success: true,
        data: {
          emailVerified: isVerified
        }
      })
    } else if (action === 'resend') {
      await authService.resendEmailVerification()
      
      return NextResponse.json({
        success: true,
        message: 'Verification email sent successfully'
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action'
      },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Email verification error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Email verification failed'
      },
      { status: 400 }
    )
  }
} 