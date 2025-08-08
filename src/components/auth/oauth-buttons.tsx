'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'

interface OAuthButtonsProps {
  mode: 'login' | 'register'
  onError?: (error: string) => void
  onSuccess?: () => void
  disabled?: boolean
  className?: string
}

export function OAuthButtons({ 
  mode, 
  onError, 
  onSuccess, 
  disabled = false,
  className = '' 
}: OAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'facebook' | null>(null)
  const { signInWithGoogle, signInWithFacebook } = useFirebaseAuth()
  const router = useRouter()

  const handleGoogleAuth = async () => {
    if (disabled || loadingProvider) return
    
    setLoadingProvider('google')
    try {
      await signInWithGoogle()
      onSuccess?.()
      router.push('/customer')
    } catch (error: any) {
      onError?.(error.message)
    } finally {
      setLoadingProvider(null)
    }
  }

  const handleFacebookAuth = async () => {
    if (disabled || loadingProvider) return
    
    setLoadingProvider('facebook')
    try {
      await signInWithFacebook()
      onSuccess?.()
      router.push('/customer')
    } catch (error: any) {
      onError?.(error.message)
    } finally {
      setLoadingProvider(null)
    }
  }

  const isLoading = loadingProvider !== null || disabled

  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      {/* Google Button */}
      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={isLoading}
        className="w-full inline-flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loadingProvider === 'google' ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path 
              fill="#4285F4" 
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path 
              fill="#34A853" 
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path 
              fill="#FBBC05" 
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path 
              fill="#EA4335" 
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        {loadingProvider !== 'google' && (
          <span className="ml-2">
            {mode === 'login' ? 'Sign in' : 'Sign up'} with Google
          </span>
        )}
      </button>

      {/* Facebook Button */}
      <button
        type="button"
        onClick={handleFacebookAuth}
        disabled={isLoading}
        className="w-full inline-flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loadingProvider === 'facebook' ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        )}
        {loadingProvider !== 'facebook' && (
          <span className="ml-2">
            {mode === 'login' ? 'Sign in' : 'Sign up'} with Facebook
          </span>
        )}
      </button>
    </div>
  )
}

// Individual button components for more flexibility
export function GoogleAuthButton({ 
  mode, 
  onError, 
  onSuccess, 
  disabled = false,
  className = '',
  fullWidth = true 
}: OAuthButtonsProps & { fullWidth?: boolean }) {
  const [loading, setLoading] = useState(false)
  const { signInWithGoogle } = useFirebaseAuth()
  const router = useRouter()

  const handleClick = async () => {
    if (disabled || loading) return
    
    setLoading(true)
    try {
      await signInWithGoogle()
      onSuccess?.()
      router.push('/customer')
    } catch (error: any) {
      onError?.(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || disabled}
      className={`${fullWidth ? 'w-full' : ''} inline-flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path 
              fill="#4285F4" 
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path 
              fill="#34A853" 
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path 
              fill="#FBBC05" 
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path 
              fill="#EA4335" 
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="ml-2">
            {mode === 'login' ? 'Sign in' : 'Sign up'} with Google
          </span>
        </>
      )}
    </button>
  )
}

export function FacebookAuthButton({ 
  mode, 
  onError, 
  onSuccess, 
  disabled = false,
  className = '',
  fullWidth = true 
}: OAuthButtonsProps & { fullWidth?: boolean }) {
  const [loading, setLoading] = useState(false)
  const { signInWithFacebook } = useFirebaseAuth()
  const router = useRouter()

  const handleClick = async () => {
    if (disabled || loading) return
    
    setLoading(true)
    try {
      await signInWithFacebook()
      onSuccess?.()
      router.push('/customer')
    } catch (error: any) {
      onError?.(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || disabled}
      className={`${fullWidth ? 'w-full' : ''} inline-flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      ) : (
        <>
          <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span className="ml-2">
            {mode === 'login' ? 'Sign in' : 'Sign up'} with Facebook
          </span>
        </>
      )}
    </button>
  )
}
