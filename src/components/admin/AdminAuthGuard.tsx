'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { User } from '@/types'
import { Loader2, Shield, AlertTriangle } from 'lucide-react'
import { ROUTES } from '@/app/routes'

interface AdminAuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'admin'
  fallback?: React.ReactNode
}

export default function AdminAuthGuard({ 
  children, 
  requiredRole = 'admin',
  fallback 
}: AdminAuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

           useEffect(() => {
           console.log('AdminAuthGuard: Auth state changed', { user, loading, checkingAuth })
           
           // TEMPORARY: Disable Firebase authentication completely for now
           console.log('AdminAuthGuard: Firebase disabled - allowing access for testing')
           setIsAuthorized(true)
           setCheckingAuth(false)
           
           // TODO: Re-enable this when Firebase is ready
           // if (process.env.NODE_ENV === 'development') {
           //   console.log('AdminAuthGuard: Development mode - allowing access for testing')
           //   setIsAuthorized(true)
           //   setCheckingAuth(false)
           //   return
           // }
           
           // TODO: Uncomment this when Firebase is ready
           /*
           if (!loading) {
             if (!user) {
               console.log('AdminAuthGuard: No user, redirecting to login')
               router.push(`${ROUTES.AUTH.LOGIN}?redirect=${ROUTES.ADMIN.DASHBOARD}`)
               return
             }

             if (user.role !== 'admin') {
               console.log('AdminAuthGuard: User not admin, redirecting to unauthorized')
               router.push(ROUTES.AUTH.UNAUTHORIZED)
               return
             }

             if (user.status !== 'active') {
               console.log('AdminAuthGuard: User not active, redirecting to suspended')
               router.push(ROUTES.AUTH.ACCOUNT_SUSPENDED)
               return
             }

             setIsAuthorized(true)
             setCheckingAuth(false)
           }
           */
  }, [user, loading, router, requiredRole])

  // Show loading while checking authentication
  if (loading || checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  // Show fallback or default unauthorized message
  if (!isAuthorized) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this admin area. Please contact your system administrator.
          </p>
          <button
            onClick={() => router.push(ROUTES.HOME)}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
