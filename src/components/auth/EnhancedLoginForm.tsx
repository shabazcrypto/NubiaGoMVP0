'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { cn } from '@/lib/utils'

interface LoginFormProps {
  redirectUrl?: string
  className?: string
}

export function EnhancedLoginForm({ redirectUrl = '/customer', className }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({})
  
  const router = useRouter()
  const { signIn, loading, error: authError, clearError } = useFirebaseAuth()

  const validateField = (name: string, value: string) => {
    const errors: {[key: string]: string} = {}
    
    switch (name) {
      case 'email':
        if (!value) {
          errors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Please enter a valid email address'
        }
        break
      case 'password':
        if (!value) {
          errors.password = 'Password is required'
        } else if (value.length < 6) {
          errors.password = 'Password must be at least 6 characters'
        }
        break
    }
    
    return errors
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }))
    }
    
    // Clear general error
    if (error) setError('')
    if (authError) clearError()
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const errors = validateField(name, value)
    setFieldErrors(prev => ({ ...prev, ...errors }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    clearError()
    
    // Validate all fields
    const emailErrors = validateField('email', formData.email)
    const passwordErrors = validateField('password', formData.password)
    const allErrors = { ...emailErrors, ...passwordErrors }
    
    if (Object.keys(allErrors).length > 0) {
      setFieldErrors(allErrors)
      return
    }

    setIsLoading(true)
    try {
      await signIn(formData.email, formData.password)
      
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('rememberLogin', 'true')
      }
      
      router.push(redirectUrl)
    } catch (err: any) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = formData.email && formData.password && Object.keys(fieldErrors).length === 0

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold font-heading">
          Welcome back
        </CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Error Alert */}
        {(error || authError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || authError}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="email"
                name="email"
                type="email" 
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={cn(
                  "pl-10 transition-all duration-200",
                  fieldErrors.email && "border-destructive focus-visible:ring-destructive"
                )}
                disabled={isLoading}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-sm text-destructive">{fieldErrors.email}</p>
            )}
          </div>
          
          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link 
                href="/forgot-password" 
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={cn(
                  "pl-10 pr-10 transition-all duration-200",
                  fieldErrors.password && "border-destructive focus-visible:ring-destructive"
                )}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {fieldErrors.password && (
              <p className="text-sm text-destructive">{fieldErrors.password}</p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="remember" 
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
              disabled={isLoading}
            />
            <Label 
              htmlFor="remember" 
              className="text-sm font-normal cursor-pointer"
            >
              Remember me for 30 days
            </Label>
          </div>
          
          {/* Submit Button */}
          <Button 
            type="submit"
            className="w-full"
            size="lg"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        
        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" disabled={isLoading}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>
          <Button variant="outline" disabled={isLoading}>
            <svg className="mr-2 h-4 w-4" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Link 
            href="/register" 
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </div>
        
        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            <span>Secure Login</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            <span>SSL Protected</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export default EnhancedLoginForm
