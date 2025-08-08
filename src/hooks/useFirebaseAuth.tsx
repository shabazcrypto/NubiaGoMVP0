'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { authService, UserProfile } from '@/lib/firebase/auth-service'

// Create the context
const FirebaseAuthContext = createContext<UseFirebaseAuthReturn | undefined>(undefined)

interface UseFirebaseAuthReturn {
  user: UserProfile | null
  loading: boolean
  error: string | null
  
  // Authentication methods
  signInWithEmail: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithFacebook: () => Promise<void>
  registerWithEmail: (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string,
    role?: 'customer' | 'supplier',
    phone?: string
  ) => Promise<void>
  signOut: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<void>
  
  // Utility methods
  clearError: () => void
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

function useFirebaseAuthInternal(): UseFirebaseAuthReturn {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user)
      setLoading(false)
      if (user) {
        setError(null)
      }
    })

    return () => {
      unsubscribe()
      authService.cleanupListeners()
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Email/Password sign in
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      await authService.signInWithEmail(email, password)
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Google sign in
  const signInWithGoogle = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await authService.signInWithGoogle()
    } catch (error: any) {
      setError(error.message)
      setLoading(false)
      throw error
    }
  }, [])

  // Facebook sign in
  const signInWithFacebook = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await authService.signInWithFacebook()
    } catch (error: any) {
      setError(error.message)
      setLoading(false)
      throw error
    }
  }, [])

  // Email registration
  const registerWithEmail = useCallback(async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string,
    role: 'customer' | 'supplier' = 'customer',
    phone?: string
  ) => {
    setLoading(true)
    setError(null)
    try {
      await authService.registerWithEmail(email, password, firstName, lastName, role, phone)
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Sign out
  const signOut = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await authService.signOut()
      setUser(null)
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Send password reset
  const sendPasswordReset = useCallback(async (email: string) => {
    setError(null)
    try {
      await authService.sendPasswordResetEmail(email)
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }, [])

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) return
    
    setError(null)
    try {
      await authService.updateUserProfile(user.uid, updates)
      // The profile will be updated through the auth state listener
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }, [user])

  return {
    user,
    loading,
    error,
    signInWithEmail,
    signInWithGoogle,
    signInWithFacebook,
    registerWithEmail,
    signOut,
    sendPasswordReset,
    clearError,
    updateProfile
  }
}

// Provider component
interface FirebaseAuthProviderProps {
  children: ReactNode
}

export function FirebaseAuthProvider({ children }: FirebaseAuthProviderProps) {
  const auth = useFirebaseAuthInternal()
  
  return (
    <FirebaseAuthContext.Provider value={auth}>
      {children}
    </FirebaseAuthContext.Provider>
  )
}

// Hook to use the auth context
export function useFirebaseAuth(): UseFirebaseAuthReturn {
  const context = useContext(FirebaseAuthContext)
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider')
  }
  return context
}
