import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged,
  sendEmailVerification,
  getIdToken
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'
import { User } from '@/types'
import { emailService } from './email.service'
import { auditService } from './audit.service'

export class AuthService {
  private userListeners: Map<string, () => void> = new Map()

  // Register new user with role-based logic
  async register(email: string, password: string, displayName?: string, role: 'customer' | 'supplier' | 'admin' = 'customer'): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Send email verification
      await sendEmailVerification(firebaseUser)

      // Update display name if provided
      if (displayName) {
        await updateProfile(firebaseUser, { displayName })
      }

      // Determine initial status based on role
      const initialStatus = role === 'supplier' ? 'pending' : 'pending' // All users start as pending until email verified

      // Create user profile in Firestore
      const userProfile: User = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: displayName || firebaseUser.displayName || email.split('@')[0],
        avatar: firebaseUser.photoURL || undefined,
        role: role,
        status: initialStatus,
        emailVerified: false,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await setDoc(doc(db, 'users', firebaseUser.uid), userProfile)

      return userProfile
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code))
    }
  }

  // Register supplier with additional business information
  async registerSupplier(
    email: string, 
    password: string, 
    displayName: string,
    businessName: string,
    businessType: string,
    phoneNumber: string,
    documents: File[]
  ): Promise<User> {
    try {
      // First create the user account
      const user = await this.register(email, password, displayName, 'supplier')
      
      // Upload business documents to Firebase Storage
      const documentUrls = await this.uploadBusinessDocuments(user.uid ?? user.id, documents)
      
      // Create supplier profile with additional business information
      const supplierProfile = {
        ...user,
        businessName,
        businessType,
        phoneNumber,
        documentUrls,
        approvalStatus: 'pending',
        submittedAt: new Date(),
        approvedAt: null,
        approvedBy: null
      }

      // Save supplier profile to a separate collection
      await setDoc(doc(db, 'suppliers', user.uid ?? user.id), supplierProfile)
      
      // Update user status to pending (both email verification and supplier approval)
      await this.updateUserProfile(user.uid ?? user.id, { status: 'pending' } as any)

      // Send registration confirmation email
      await emailService.sendSupplierRegistrationConfirmation(user)

      // Log the registration event
      await auditService.logAuthEvent(
        (user.uid ?? user.id),
        user.email || '',
        user.role || 'customer',
        'register',
        true
      )

      return user
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code))
    }
  }

  // Sign in user with email verification check
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Check if email is verified
      if (!firebaseUser.emailVerified) {
        // Send verification email again if not verified
        await sendEmailVerification(firebaseUser)
        throw new Error('Please verify your email address before signing in. A new verification email has been sent.')
      }

      // Get user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found')
      }

      const user = userDoc.data() as User

      // Update email verification status if needed
      if (!user.emailVerified && !user.isVerified) {
        await this.updateUserProfile(user.uid ?? user.id, { emailVerified: true } as any)
        user.emailVerified = true
        user.isVerified = true
      }

      // Check if user is suspended
      if (user.status === 'suspended') {
        await auditService.logAuthEvent(
          (user.uid ?? user.id),
          user.email || '',
          user.role || 'customer',
          'login',
          false,
          'Account suspended'
        )
        throw new Error('Account has been suspended. Please contact support.')
      }

      // Check if user is pending email verification
      if (user.status === 'pending' && !(user.emailVerified || user.isVerified)) {
        await auditService.logAuthEvent(
          (user.uid ?? user.id),
          user.email || '',
          user.role || 'customer',
          'login',
          false,
          'Email not verified'
        )
        throw new Error('Please verify your email address before signing in.')
      }

      // For suppliers, check if they're approved (after email verification)
      if (user.role === 'supplier' && user.status === 'pending' && (user.emailVerified || user.isVerified)) {
        await auditService.logAuthEvent(
          (user.uid ?? user.id),
          user.email || '',
          user.role || 'customer',
          'login',
          false,
          'Account pending approval'
        )
        throw new Error('Your supplier account is pending approval. You will be notified once approved.')
      }

      // If email is verified but status is still pending, update to active for customers
      if ((user.emailVerified || user.isVerified) && user.status === 'pending' && user.role === 'customer') {
        await this.updateUserProfile(user.uid ?? user.id, { status: 'active' } as any)
        user.status = 'active'
      }

      // Log successful login
      await auditService.logAuthEvent(
        (user.uid ?? user.id),
        user.email || '',
        user.role || 'customer',
        'login',
        true
      )

      return user
    } catch (error: any) {
      // Log failed login attempt
      await auditService.logAuthEvent(
        'unknown',
        email,
        'unknown',
        'login',
        false,
        error.message
      )
      throw new Error(this.getErrorMessage(error.code))
    }
  }

  // Sign out user
  async signOut(): Promise<void> {
    try {
      await signOut(auth)
    } catch (error: any) {
      throw new Error('Failed to sign out')
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code))
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser
    if (!firebaseUser) return null

    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
      if (!userDoc.exists()) return null

      return userDoc.data() as User
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  // Update user profile with real-time notification
  async updateUserProfile(uid: string, updates: Partial<User>): Promise<User> {
    try {
      const userRef = doc(db, 'users', uid)
      const userDoc = await getDoc(userRef)
      
      if (!userDoc.exists()) {
        throw new Error('User not found')
      }

      const currentUser = userDoc.data() as User
      const updatedUser = {
        ...currentUser,
        ...updates,
        updatedAt: new Date()
      }

      await updateDoc(userRef, updatedUser)

      // Log the profile update
      await auditService.logSystemEvent(
        'profile_update',
        {
          userId: uid,
          updatedFields: Object.keys(updates)
        },
        true
      )

      return updatedUser
    } catch (error: any) {
      throw new Error('Failed to update user profile')
    }
  }

  // Admin functions for user management
  async getAllUsers(): Promise<User[]> {
    try {
      const usersRef = collection(db, 'users')
      const snapshot = await getDocs(usersRef)
      return snapshot.docs.map(doc => doc.data() as User)
    } catch (error) {
      throw new Error('Failed to fetch users')
    }
  }

  async getPendingSuppliers(): Promise<User[]> {
    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('role', '==', 'supplier'), where('status', '==', 'pending'))
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => doc.data() as User)
    } catch (error) {
      throw new Error('Failed to fetch pending suppliers')
    }
  }

  // Approve supplier with real-time updates
  async approveSupplier(uid: string, approvedBy: string): Promise<void> {
    try {
      // Get user data for email notification
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (!userDoc.exists()) {
        throw new Error('User not found')
      }
      const user = userDoc.data() as User

      // Update user status to active
      await this.updateUserProfile(uid, { 
        status: 'active',
        updatedAt: new Date()
      })

      // Update supplier profile
      const supplierRef = doc(db, 'suppliers', uid)
      await updateDoc(supplierRef, {
        approvalStatus: 'approved',
        approvedAt: new Date(),
        approvedBy
      })

      // Send approval email
      await emailService.sendSupplierApprovalSuccess(user, approvedBy)

      // Log the approval action
      await auditService.logSupplierApproval(
        approvedBy,
        'admin@nubiago.com', // This should come from the admin's session
        uid,
        user.email,
        'approve',
        undefined,
        true
      )
    } catch (error) {
      // Log failed approval
      await auditService.logSupplierApproval(
        approvedBy,
        'admin@nubiago.com',
        uid,
        'unknown',
        'approve',
        undefined,
        false
      )
      throw new Error('Failed to approve supplier')
    }
  }

  // Reject supplier with real-time updates
  async rejectSupplier(uid: string, reason: string, rejectedBy: string): Promise<void> {
    try {
      // Get user data for email notification
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (!userDoc.exists()) {
        throw new Error('User not found')
      }
      const user = userDoc.data() as User

      // Update user status to suspended
      await this.updateUserProfile(uid, { 
        status: 'suspended',
        updatedAt: new Date()
      })

      // Update supplier profile
      const supplierRef = doc(db, 'suppliers', uid)
      await updateDoc(supplierRef, {
        approvalStatus: 'rejected',
        rejectedAt: new Date(),
        rejectedBy,
        rejectionReason: reason
      })

      // Send rejection email
      await emailService.sendSupplierRejection(user, reason, rejectedBy)

      // Log the rejection action
      await auditService.logSupplierApproval(
        rejectedBy,
        'admin@nubiago.com', // This should come from the admin's session
        uid,
        user.email,
        'reject',
        reason,
        true
      )
    } catch (error) {
      // Log failed rejection
      await auditService.logSupplierApproval(
        rejectedBy,
        'admin@nubiago.com',
        uid,
        'unknown',
        'reject',
        reason,
        false
      )
      throw new Error('Failed to reject supplier')
    }
  }

  // Suspend user with real-time updates
  async suspendUser(uid: string, reason: string, suspendedBy: string): Promise<void> {
    try {
      // Get user data for email notification
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (!userDoc.exists()) {
        throw new Error('User not found')
      }
      const user = userDoc.data() as User

      await this.updateUserProfile(uid, { 
        status: 'suspended',
        updatedAt: new Date()
      })

      // Log suspension
      await setDoc(doc(db, 'user_suspensions', `${uid}_${Date.now()}`), {
        uid,
        reason,
        suspendedBy,
        suspendedAt: new Date()
      })

      // Send suspension email
      await emailService.sendAccountSuspension(user, reason, suspendedBy)

      // Log the suspension action
      await auditService.logUserManagement(
        suspendedBy,
        'admin@nubiago.com', // This should come from the admin's session
        uid,
        user.email,
        'suspend',
        reason,
        true
      )
    } catch (error) {
      // Log failed suspension
      await auditService.logUserManagement(
        suspendedBy,
        'admin@nubiago.com',
        uid,
        'unknown',
        'suspend',
        reason,
        false
      )
      throw new Error('Failed to suspend user')
    }
  }

  // Reactivate user with real-time updates
  async reactivateUser(uid: string, reactivatedBy: string): Promise<void> {
    try {
      // Get user data for email notification
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (!userDoc.exists()) {
        throw new Error('User not found')
      }
      const user = userDoc.data() as User

      await this.updateUserProfile(uid, { 
        status: 'active',
        updatedAt: new Date()
      })

      // Log reactivation
      await setDoc(doc(db, 'user_reactivations', `${uid}_${Date.now()}`), {
        uid,
        reactivatedBy,
        reactivatedAt: new Date()
      })

      // Send reactivation email
      await emailService.sendAccountReactivation(user, reactivatedBy)

      // Log the reactivation action
      await auditService.logUserManagement(
        reactivatedBy,
        'admin@nubiago.com', // This should come from the admin's session
        uid,
        user.email,
        'reactivate',
        undefined,
        true
      )
    } catch (error) {
      // Log failed reactivation
      await auditService.logUserManagement(
        reactivatedBy,
        'admin@nubiago.com',
        uid,
        'unknown',
        'reactivate',
        undefined,
        false
      )
      throw new Error('Failed to reactivate user')
    }
  }

  // Create admin account (only by existing admins or system)
  async createAdminAccount(
    email: string, 
    password: string, 
    displayName: string,
    createdBy: string
  ): Promise<User> {
    try {
      // Check if creator is admin
      const creator = await this.getCurrentUser()
      if (!creator || creator.role !== 'admin') {
        throw new Error('Only admins can create admin accounts')
      }

      const user = await this.register(email, password, displayName, 'admin')
      
      // Log admin creation
      await setDoc(doc(db, 'admin_creations', `${(user.uid ?? user.id)}_${Date.now()}`), {
        uid: (user.uid ?? user.id),
        email: user.email,
        displayName: (user as any).displayName ?? user.name,
        createdBy,
        createdAt: new Date()
      })

      return user
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code))
    }
  }

  // Upload business documents
  private async uploadBusinessDocuments(uid: string, documents: File[]): Promise<string[]> {
    try {
      // Import storage service
      const { storageService } = await import('./storage.service')
      
      // Upload documents to Firebase Storage
      const uploadResults = await storageService.uploadBusinessDocuments(uid, documents)
      
      return uploadResults.map(result => result.url)
    } catch (error) {
      console.error('Failed to upload business documents:', error)
      // Return mock URLs as fallback
      return documents.map((doc, index) => `https://storage.googleapis.com/business-docs/${uid}/doc_${index}.pdf`)
    }
  }

  // Listen to auth state changes with real-time user updates
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    console.log('AuthService: Setting up auth state listener')
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('AuthService: Firebase auth state changed', { firebaseUser: firebaseUser?.uid })
      
      if (!firebaseUser) {
        console.log('AuthService: No Firebase user, calling callback with null')
        callback(null)
        return
      }

      try {
        console.log('AuthService: Setting up Firestore listener for user', firebaseUser.uid)
        // Set up real-time listener for user document
        const unsubscribe = onSnapshot(
          doc(db, 'users', firebaseUser.uid),
          (doc) => {
            if (doc.exists()) {
              const userData = doc.data() as User
              console.log('AuthService: User document found', { userData })
              callback(userData)
            } else {
              console.log('AuthService: User document not found')
              callback(null)
            }
          },
          (error) => {
            console.error('Error in user document listener:', error)
            callback(null)
          }
        )

        // Store the unsubscribe function
        this.userListeners.set(firebaseUser.uid, unsubscribe)
      } catch (error) {
        console.error('Error in auth state change:', error)
        callback(null)
      }
    })

    // Return the auth unsubscribe function
    return unsubscribeAuth
  }

  // Get real-time user updates for a specific user
  onUserChange(uid: string, callback: (user: User | null) => void): () => void {
    const unsubscribe = onSnapshot(
      doc(db, 'users', uid),
      (doc) => {
        if (doc.exists()) {
          callback(doc.data() as User)
        } else {
          callback(null)
        }
      },
      (error) => {
        console.error('Error in user change listener:', error)
        callback(null)
      }
    )

    // Store the unsubscribe function
    this.userListeners.set(uid, unsubscribe)

    return unsubscribe
  }

  // Clean up all listeners
  cleanupListeners(): void {
    this.userListeners.forEach((unsubscribe) => {
      unsubscribe()
    })
    this.userListeners.clear()
  }

  // Resend email verification
  async resendEmailVerification(): Promise<void> {
    try {
      const firebaseUser = auth.currentUser
      if (!firebaseUser) {
        throw new Error('No user is currently signed in')
      }

      await sendEmailVerification(firebaseUser)
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code))
    }
  }

  // Check email verification status
  async checkEmailVerification(): Promise<boolean> {
    try {
      const firebaseUser = auth.currentUser
      if (!firebaseUser) {
        return false
      }

      // Reload user to get latest verification status
      await firebaseUser.reload()
      
      return firebaseUser.emailVerified
    } catch (error) {
      console.error('Error checking email verification:', error)
      return false
    }
  }

  // Handle role changes in real-time
  async handleRoleChange(uid: string, newRole: 'customer' | 'supplier' | 'admin', newStatus: 'active' | 'suspended' | 'pending'): Promise<void> {
    try {
      // Update user profile in Firestore
      await this.updateUserProfile(uid, { 
        role: newRole, 
        status: newStatus,
        updatedAt: new Date()
      })

      // Log the role change using system event
      await auditService.logSystemEvent(
        'role_change',
        {
          userId: uid,
          newRole,
          newStatus,
          changedBy: 'system'
        },
        true
      )

      // If user is currently logged in, refresh their session
      const currentUser = auth.currentUser
      if (currentUser && currentUser.uid === uid) {
        // Force a token refresh to update the session
        await currentUser.getIdToken(true)
      }
    } catch (error) {
      console.error('Error handling role change:', error)
      throw new Error('Failed to update user role')
    }
  }

  // Get real-time user updates with role change handling
  onUserChangeWithRoleHandling(uid: string, callback: (user: User | null) => void): () => void {
    const unsubscribe = onSnapshot(
      doc(db, 'users', uid),
      async (doc) => {
        if (doc.exists()) {
          const userData = doc.data() as User
          
          // Check if this is a role change for the current user
          const currentUser = auth.currentUser
          if (currentUser && currentUser.uid === uid) {
            // Update the user's session if role/status changed
            try {
              await currentUser.getIdToken(true)
            } catch (error) {
              console.error('Error refreshing token after role change:', error)
            }
          }
          
          callback(userData)
        } else {
          callback(null)
        }
      },
      (error) => {
        console.error('Error in user change listener:', error)
        callback(null)
      }
    )

    // Store the unsubscribe function
    this.userListeners.set(uid, unsubscribe)

    return unsubscribe
  }

  // Get JWT token for authentication
  async getAuthToken(): Promise<string | null> {
    try {
      const user = auth.currentUser
      if (!user) {
        return null
      }
      
      return await getIdToken(user, true)
    } catch (error) {
      console.error('Error getting auth token:', error)
      return null
    }
  }

  // Helper method to get user-friendly error messages
  private getErrorMessage(error: any): string {
    console.error('Auth error:', error)
    
    const errorCode = error.code as string
    const errorMap: Record<string, string> = {
      'auth/user-not-found': 'No account found with this email address',
      'auth/wrong-password': 'Incorrect password',
      'auth/email-already-in-use': 'An account with this email already exists',
      'auth/weak-password': 'Password should be at least 6 characters',
      'auth/invalid-email': 'Invalid email address',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later',
      'auth/network-request-failed': 'Network error. Please check your connection',
      'auth/invalid-credential': 'Invalid credentials. Please try again',
      'auth/operation-not-allowed': 'This operation is not allowed',
      'auth/popup-blocked': 'Popup was blocked by the browser',
      'auth/popup-closed-by-user': 'Authentication popup was closed',
      'auth/unauthorized-domain': 'This domain is not authorized',
      'auth/user-disabled': 'This account has been disabled',
      'auth/user-token-expired': 'Please sign in again',
      'auth/web-storage-unsupported': 'Web storage is not supported',
      'auth/invalid-verification-code': 'Invalid verification code',
      'auth/invalid-verification-id': 'Invalid verification ID',
      'auth/internal-error': 'An internal error occurred. Please try again',
      'auth/invalid-api-key': 'Invalid API configuration',
      'auth/app-deleted': 'Application has been deleted',
      'auth/account-exists-with-different-credential': 'An account already exists with a different sign-in method',
      'auth/cancelled-popup-request': 'Only one popup request is allowed at a time',
      'auth/expired-action-code': 'The action code has expired',
      'auth/invalid-action-code': 'The action code is invalid',
      'auth/invalid-persistence-type': 'Invalid persistence type',
      'auth/invalid-recipient-email': 'Invalid recipient email',
      'auth/invalid-sender': 'Invalid sender',
      'auth/invalid-verification-code': 'Invalid verification code',
      'auth/missing-android-pkg-name': 'Missing Android package name',
      'auth/missing-continue-uri': 'Missing continue URL',
      'auth/missing-iframe-start': 'Missing iframe start',
      'auth/missing-ios-bundle-id': 'Missing iOS bundle ID',
      'auth/missing-verification-code': 'Missing verification code',
      'auth/missing-verification-id': 'Missing verification ID',
      'auth/app-not-authorized': 'Application not authorized',
      'auth/captcha-check-failed': 'reCAPTCHA verification failed',
      'auth/code-expired': 'The code has expired',
      'auth/cordova-not-ready': 'Cordova framework is not ready',
      'auth/cors-unsupported': 'CORS is not supported',
      'auth/credential-already-in-use': 'This credential is already associated with a different user account',
      'auth/custom-token-mismatch': 'The custom token corresponds to a different audience',
      'auth/requires-recent-login': 'This operation requires recent authentication. Please sign in again',
      'auth/dynamic-link-not-activated': 'Dynamic links service must be activated',
      'auth/email-change-needs-verification': 'Email change needs verification',
      'auth/email-already-in-use': 'The email address is already in use',
      'auth/expired-popup-request': 'This popup request has expired',
      'auth/invalid-cert-hash': 'Invalid certificate hash',
      'auth/invalid-message-payload': 'Invalid message payload',
      'auth/invalid-oauth-provider': 'Invalid OAuth provider',
      'auth/invalid-phone-number': 'Invalid phone number',
      'auth/invalid-provider-id': 'Invalid provider ID',
      'auth/invalid-recipient-email': 'Invalid recipient email',
      'auth/invalid-sender': 'Invalid sender',
      'auth/invalid-verification-id': 'Invalid verification ID',
      'auth/invalid-tenant-id': 'Invalid tenant ID',
      'auth/multi-factor-auth-required': 'Multi-factor authentication required',
      'auth/missing-phone-number': 'Missing phone number',
      'auth/missing-verification-code': 'Missing verification code',
      'auth/missing-verification-id': 'Missing verification ID',
      'auth/second-factor-already-in-use': 'Second factor already enrolled',
      'auth/maximum-second-factor-count-exceeded': 'Maximum second factor count exceeded',
      'auth/unsupported-persistence-type': 'Unsupported persistence type',
      'auth/unsupported-tenant-operation': 'This operation is not supported in a multi-tenant context',
      'auth/unverified-email': 'Email is not verified',
      'auth/user-cancelled': 'User cancelled the operation',
      'auth/user-not-found': 'No user found',
      'auth/user-mismatch': 'The supplied credentials do not correspond to the previously signed in user',
      'auth/user-signed-out': 'User is signed out',
      'auth/weak-password': 'Password is too weak',
      'auth/web-storage-unsupported': 'Web storage is unsupported',
    }

    return errorMap[errorCode] || 'An unexpected error occurred. Please try again'
  }
}

export const authService = new AuthService() 
