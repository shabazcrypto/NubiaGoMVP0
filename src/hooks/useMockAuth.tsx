'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { User } from '@/types'
import { mockAuthService } from '@/lib/mock-services'

// ============================================================================
// MOCK AUTH CONTEXT
// ============================================================================

interface MockAuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName?: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  verifyEmail: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined)

// ============================================================================
// MOCK AUTH PROVIDER
// ============================================================================

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('mock-user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        mockAuthService.setCurrentUser(parsedUser)
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('mock-user')
      }
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const user = await mockAuthService.signIn(email, password)
      setUser(user)
      localStorage.setItem('mock-user', JSON.stringify(user))
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      setLoading(true)
      const user = await mockAuthService.signUp(email, password, displayName)
      setUser(user)
      localStorage.setItem('mock-user', JSON.stringify(user))
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await mockAuthService.signOut()
      setUser(null)
      localStorage.removeItem('mock-user')
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    // Mock password reset - just log the email
    console.log('Password reset requested for:', email)
    // In a real app, this would send an email
  }

  const verifyEmail = async () => {
    // Mock email verification
    if (user) {
      const updatedUser = { ...user, emailVerified: true }
      setUser(updatedUser)
      localStorage.setItem('mock-user', JSON.stringify(updatedUser))
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates, updatedAt: new Date() }
      setUser(updatedUser)
      localStorage.setItem('mock-user', JSON.stringify(updatedUser))
    }
  }

  const value: MockAuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    verifyEmail,
    updateProfile
  }

  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  )
}

// ============================================================================
// MOCK AUTH HOOK
// ============================================================================

export function useMockAuth() {
  const context = useContext(MockAuthContext)
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider')
  }
  return context
}

// ============================================================================
// MOCK AUTH UTILITIES
// ============================================================================

export function useMockAuthState() {
  const { user, loading } = useMockAuth()
  return { user, loading }
}

export function RequireMockAuth({ 
  children, 
  roles 
}: { 
  children: React.ReactNode
  roles: Array<'customer' | 'supplier' | 'admin'>
}) {
  const { user, loading } = useMockAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access this page.</p>
          <a href="/login" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
            Sign In
          </a>
        </div>
      </div>
    )
  }

  if (!user.role || !roles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
          <a href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
            Go Home
          </a>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 