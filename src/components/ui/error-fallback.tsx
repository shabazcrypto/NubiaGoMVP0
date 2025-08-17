'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'

interface ErrorFallbackProps {
  error?: Error
  resetError?: () => void
  errorId?: string
  showDetails?: boolean
  title?: string
  description?: string
  showHomeButton?: boolean
  showBackButton?: boolean
  showResetButton?: boolean
}

export function ErrorFallback({
  error,
  resetError,
  errorId,
  showDetails = false,
  title = "Something went wrong",
  description = "We encountered an unexpected error. Please try again or contact support if the problem persists.",
  showHomeButton = true,
  showBackButton = true,
  showResetButton = true
}: ErrorFallbackProps) {
  const handleGoHome = () => {
    window.location.href = '/'
  }

  const handleGoBack = () => {
    window.history.back()
  }

  const handleReset = () => {
    if (resetError) {
      resetError()
    } else {
      window.location.reload()
    }
  }

  return (
    <div className="min-h-[400px] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        
        <h1 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h1>
        
        {/* Display actual error message if available */}
        {error && showDetails && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm font-medium text-red-800 mb-1">
              Error Details:
            </p>
            <p className="text-sm text-red-700">
              {error.message || error.toString()}
            </p>
          </div>
        )}
        
        <p className="text-sm text-gray-600 mb-6">
          {description}
        </p>

        {errorId && (
          <p className="text-xs text-gray-400 mb-6">
            Error ID: {errorId}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showResetButton && (
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          )}
          
          {showBackButton && (
            <button
              onClick={handleGoBack}
              className="inline-flex items-center justify-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          )}
          
          {showHomeButton && (
            <button
              onClick={handleGoHome}
              className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </button>
          )}
        </div>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-6 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
              Developer Information
            </summary>
            <div className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-800 overflow-auto">
              <pre>{error.stack}</pre>
            </div>
          </details>
        )}

        <div className="mt-6 text-xs text-gray-500">
          <p>Still having trouble?</p>
          <div className="mt-2 space-y-1">
            <p>📞 +234 123 456 7890</p>
            <p>✉️ support@nubiago.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
