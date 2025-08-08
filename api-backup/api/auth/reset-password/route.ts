import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/services/auth.service'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = resetPasswordSchema.parse(body)
    const { email } = validatedData

    // Send password reset email
    await authService.resetPassword(email)

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent successfully'
    })
  } catch (error: any) {
    console.error('Password reset error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to send password reset email' 
      },
      { status: 400 }
    )
  }
} 