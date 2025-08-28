import { collection, doc, getDoc, getDocs, query, where, writeBatch, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { logger } from '@/lib/utils/logger'
import { AdminUser } from '@/types'

class AdminUserService {
  // Get user by ID
  async getUserById(uid: string): Promise<AdminUser | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        return {
          uid: userDoc.id,
          ...userDoc.data()
        } as AdminUser
      }
      return null
    } catch (error) {
      logger.error('Error fetching user:', error)
      throw new Error('Failed to fetch user')
    }
  }

  // Update user role and status
  async updateUserRole(
    uid: string, 
    newRole: 'customer' | 'supplier' | 'admin',
    newStatus: 'active' | 'pending' | 'suspended',
    adminId: string,
    reason?: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      // Update user document
      const userRef = doc(db, 'users', uid)
      batch.update(userRef, {
        role: newRole,
        status: newStatus,
        updatedAt: serverTimestamp(),
        lastModifiedBy: adminId,
        lastModifiedAt: serverTimestamp()
      })

      // Log admin action
      const actionRef = doc(collection(db, 'admin_actions'))
      batch.set(actionRef, {
        adminId,
        action: 'update_user_role',
        targetUserId: uid,
        oldRole: (await this.getUserById(uid))?.role,
        newRole,
        oldStatus: (await this.getUserById(uid))?.status,
        newStatus,
        reason,
        timestamp: serverTimestamp(),
        metadata: {
          ipAddress: 'admin-dashboard',
          userAgent: 'admin-service'
        }
      })

      await batch.commit()
      logger.info(`User ${uid} role updated to ${newRole} by admin ${adminId}`)
    } catch (error) {
      logger.error('Error updating user role:', error)
      throw new Error('Failed to update user role')
    }
  }

  // Get all users
  async getAllUsers(): Promise<AdminUser[]> {
    try {
      const snapshot = await getDocs(collection(db, 'users'))
      return snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as AdminUser[]
    } catch (error) {
      logger.error('Error fetching users:', error)
      throw new Error('Failed to fetch users')
    }
  }

  // Get users by role
  async getUsersByRole(role: string): Promise<AdminUser[]> {
    try {
      const q = query(collection(db, 'users'), where('role', '==', role))
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as AdminUser[]
    } catch (error) {
      logger.error('Error fetching users by role:', error)
      throw new Error('Failed to fetch users')
    }
  }

  // Get users by status
  async getUsersByStatus(status: string): Promise<AdminUser[]> {
    try {
      const q = query(collection(db, 'users'), where('status', '==', status))
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as AdminUser[]
    } catch (error) {
      logger.error('Error fetching users by status:', error)
      throw new Error('Failed to fetch users')
    }
  }
}

export const adminUserService = new AdminUserService()
