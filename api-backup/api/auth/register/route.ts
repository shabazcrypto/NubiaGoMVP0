import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/services/auth.service'
import { z } from 'zod'

const customerRegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().optional(),
  role: z.literal('customer').optional()
})

const supplierRegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string(),
  role: z.literal('supplier'),
  businessName: z.string().min(1, 'Business name is required'),
  businessType: z.string().min(1, 'Business type is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  mobileMoneyNumber: z.string().optional(),
  preferredCurrency: z.string().optional(),
  documents: z.array(z.any()).optional() // File uploads
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Determine registration type and validate
    let validatedData: any
    let user: any

    if (body.role === 'supplier') {
      // Supplier registration
      validatedData = supplierRegisterSchema.parse(body)
      
      // Handle supplier registration with approval workflow
      user = await authService.registerSupplier(
        validatedData.email,
        validatedData.password,
        validatedData.displayName,
        validatedData.businessName,
        validatedData.businessType,
        validatedData.phoneNumber,
        validatedData.documents || []
      )

      return NextResponse.json({
        success: true,
        data: {
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            status: user.status,
            emailVerified: user.emailVerified
          }
        },
        message: 'Supplier registration successful. Please check your email for verification and wait for admin approval.'
      })
    } else {
      // Customer registration
      validatedData = customerRegisterSchema.parse(body)
      
      user = await authService.register(
        validatedData.email,
        validatedData.password,
        validatedData.displayName,
        validatedData.role || 'customer'
      )

      return NextResponse.json({
        success: true,
        data: {
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            status: user.status,
            emailVerified: user.emailVerified
          }
        },
        message: 'Registration successful. Please check your email for verification.'
      })
    }
  } catch (error: any) {
    console.error('Registration error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Registration failed'
      },
      { status: 400 }
    )
  }
} 