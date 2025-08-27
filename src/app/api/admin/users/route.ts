import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/services/auth.service'
import { adminUserService } from '@/lib/services/admin/admin-user.service'
import { protectAdminAPI } from '@/lib/middleware/api-auth'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

async function hasExistingUsers() {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'))
    return !usersSnapshot.empty
  } catch (error) {
    console.error('Error checking for existing users:', error)
    return true // Assume users exist on error to be safe
  }
}

export async function POST(request: NextRequest) {
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

    // Check if this is the first user
    const hasUsers = await hasExistingUsers()

    // If users exist, require admin protection
    if (hasUsers) {
      return protectAdminAPI(async (req) => {
        const user = await authService.register(email, password, displayName, role)

        if (role === 'admin') {
          await adminUserService.updateUserRole(
            user.uid,
            'admin',
            'active',
            'system',
            'Admin user creation'
          )
        }

        return NextResponse.json({
          success: true,
          data: user,
          message: 'User created successfully'
        }, { status: 201 })
      })(request)
    }

    // This is the first user, allow creation without protection
    const user = await authService.register(email, password, displayName, 'admin')

    // Immediately activate the first admin
    await adminUserService.updateUserRole(
      user.uid,
      'admin',
      'active',
      'system',
      'First admin user creation'
    )

    return NextResponse.json({
      success: true,
      data: user,
      message: 'First admin user created successfully'
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
}