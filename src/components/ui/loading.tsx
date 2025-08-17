import React from 'react'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  showProgress?: boolean
  className?: string
}

export function Loading({ 
  size = 'md', 
  text = 'Loading...', 
  showProgress = false,
  className = '' 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Simple spinner */}
      <div className={`${sizeClasses[size]} border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-3`} />
      
      {/* Text */}
      {text && (
        <p className={`${textSizes[size]} text-gray-700 font-medium`}>
          {text}
        </p>
      )}
      
      {/* Progress bar */}
      {showProgress && (
        <div className="w-32 bg-gray-200 rounded-full h-1 mt-3">
          <div className="bg-gray-900 h-1 rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>
      )}
    </div>
  )
}

// Full screen loading component
export function FullScreenLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-sm">
        {/* Simple, clean logo/icon */}
        <div className="mb-6">
          <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mx-auto">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
        
        {/* Clean, simple text */}
        <div className="space-y-2">
          <h2 className="text-lg font-medium text-gray-900">
            {text}
          </h2>
          <p className="text-sm text-gray-500">
            Please wait while we prepare your dashboard
          </p>
        </div>
        
        {/* Simple progress bar */}
        <div className="mt-6 w-full bg-gray-200 rounded-full h-1">
          <div className="bg-gray-900 h-1 rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  )
}

// Inline loading component
export function InlineLoading({ size = 'sm', text }: { size?: 'sm' | 'md' | 'lg', text?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin`} />
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  )
}
