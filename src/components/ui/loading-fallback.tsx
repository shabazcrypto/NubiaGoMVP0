'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingFallbackProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
}

export function LoadingFallback({ 
  message = "Loading...", 
  size = 'md',
  fullScreen = false 
}: LoadingFallbackProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  const containerClasses = fullScreen 
    ? "min-h-screen flex items-center justify-center bg-gray-50"
    : "min-h-[200px] flex items-center justify-center"

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <Loader2 className={`${sizeClasses[size]} animate-spin mx-auto mb-2 text-blue-600`} />
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  )
}

export function PageLoadingFallback() {
  return <LoadingFallback message="Loading page..." size="lg" fullScreen />
}

export function ComponentLoadingFallback() {
  return <LoadingFallback message="Loading..." size="md" />
}

export function InlineLoadingFallback() {
  return (
    <div className="inline-flex items-center space-x-2">
      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
      <span className="text-sm text-gray-600">Loading...</span>
    </div>
  )
}
