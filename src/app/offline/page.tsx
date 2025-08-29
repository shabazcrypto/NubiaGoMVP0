'use client'

import React from 'react'
import Link from 'next/link'
import { WifiOff, RefreshCw, Home } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
            <WifiOff className="h-12 w-12 text-gray-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            You're Offline
          </h1>
          
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            It looks like you've lost your internet connection. Don't worry, you can still browse some of our cached content.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Try Again</span>
          </button>
          
          <Link
            href="/"
            className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
          >
            <Home className="h-5 w-5" />
            <span>Go to Homepage</span>
          </Link>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">What you can do:</h3>
          <ul className="text-sm text-blue-800 space-y-1 text-left">
            <li>• Browse previously visited pages</li>
            <li>• View cached product information</li>
            <li>• Check your cart (if previously loaded)</li>
            <li>• Try refreshing when connection returns</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
