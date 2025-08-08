import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/services/auth.service'
import { z } from 'zod'

const roleChangeSchema = z.object({
  uid: z.string(),
  newRole: z.enum(['customer', 'supplier', 'admin']),
  newStatus: z.enum(['active', 'suspended', 'pending']),
  reason: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { uid, newRole, newStatus, reason } = roleChangeSchema.parse(body)

    // Handle the role change
    await authService.handleRoleChange(uid, newRole, newStatus)

    return NextResponse.json({
      success: true,
      message: `User role updated to ${newRole} with status ${newStatus}`,
      data: {
        uid,
        newRole,
        newStatus,
        reason
      }
    })
  } catch (error: any) {
    console.error('Role change error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update user role'
      },
      { status: 400 }
    )
  }
} 