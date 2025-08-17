'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/services/auth.service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useToastStore } from '@/store/toast'

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const router = useRouter()
  const { addToast } = useToastStore()

  useEffect(() => {
    // Check if user is already verified
    checkEmailVerification()
  }, [])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const checkEmailVerification = async () => {
    setIsChecking(true)
    try {
      const isVerified = await authService.checkEmailVerification()
      if (isVerified) {
        addToast({
          type: 'success',
          title: 'Email verified successfully!'
        })
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error checking email verification:', error)
    } finally {
      setIsChecking(false)
    }
  }

  const resendVerificationEmail = async () => {
    setIsLoading(true)
    try {
      await authService.resendEmailVerification()
      setCountdown(60) // 60 second cooldown
      addToast({
        type: 'success',
        title: 'Verification email sent successfully!'
      })
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Failed to send verification email',
        message: error.message || 'Please try again later.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-gray-600">
              We've sent a verification email to your inbox. Please check your email and click the verification link.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100">
                <svg
                  className="h-6 w-6 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={checkEmailVerification}
                disabled={isChecking}
                className="w-full"
                variant="outline"
              >
                {isChecking ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Checking...
                  </>
                ) : (
                  'I have verified my email'
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <Button
                onClick={resendVerificationEmail}
                disabled={isLoading || countdown > 0}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Sending...
                  </>
                ) : countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  'Resend verification email'
                )}
              </Button>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>Didn't receive the email?</p>
              <p>Check your spam folder or try again.</p>
            </div>

            <div className="text-center">
              <Button
                onClick={() => router.push('/login')}
                variant="ghost"
                className="text-sm"
              >
                Back to login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
