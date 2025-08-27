import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/services/auth.service'
import { adminUserService } from '@/lib/services/admin/admin-user.service'
import { protectAdminAPI } from '@/lib/middleware/api-auth'

export const POST = protectAdminAPI(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, password, displayName, role } = body

    // Validate required fields
    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create user with specified role
    const user = await authService.register(email, password, displayName, role)

    // If creating an admin, immediately activate them
    if (role === 'admin') {
      await adminUserService.updateUserRole(
        user.uid,
        'admin',
        'active',
        'system',
        'Initial admin user creation'
      )
    }

    return NextResponse.json({
      success: true,
      data: user,
      message: 'User created successfully'
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create user',
        code: 'CREATION_ERROR'
      },
      { status: 500 }
    )
  }
})