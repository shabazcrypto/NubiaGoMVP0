'use client'

import { useEffect, useState } from 'react'
import { useSearchHistoryStore } from '@/store/search-history'
import { Loading } from '@/components/ui/loading'

interface StoreProviderProps {
  children: React.ReactNode
}

export default function StoreProvider({ children }: StoreProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      setIsHydrated(true)
      return
    }

    // Initialize stores with comprehensive error handling
    const initializeStores = async () => {
      try {
        // Check if localStorage is available and accessible
        if (!window.localStorage) {
          // // // console.warn('localStorage not available, skipping store rehydration')
          setIsHydrated(true)
          return
        }

        // Test localStorage access
        try {
          const testKey = '__zustand_test__'
          window.localStorage.setItem(testKey, 'test')
          window.localStorage.removeItem(testKey)
        } catch (error) {
          // // // console.warn('localStorage access blocked, skipping store rehydration:', error)
          setIsHydrated(true)
          return
        }

        // Add a very short timeout to prevent long loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Store rehydration timeout')), 800)
        )
        
        const rehydratePromise = useSearchHistoryStore.persist.rehydrate()
        
        await Promise.race([rehydratePromise, timeoutPromise])
        setIsHydrated(true)
        setError(null)
      } catch (error) {
        // // // console.warn('Store rehydration failed or timed out:', error)
        setError('Continuing without persistence')
        // Continue anyway to prevent infinite loading
        setIsHydrated(true)
      }
    }

    // Very short fallback timeout to ensure we never get stuck
    const fallbackTimeout = setTimeout(() => {
      // // // console.warn('Store provider fallback timeout - forcing hydration')
      setError('Continuing without persistence')
      setIsHydrated(true)
    }, 1200)

    initializeStores()

    return () => clearTimeout(fallbackTimeout)
  }, [])

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-sm">
          {/* Simple, clean logo/icon */}
          <div className="mb-6">
            <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mx-auto">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          
          {/* Clean, simple text */}
          <div className="space-y-2">
            <h2 className="text-lg font-medium text-gray-900">
              Loading...
            </h2>
            <p className="text-sm text-gray-500">
              Please wait while we prepare your dashboard
            </p>
          </div>
          
          {/* Simple progress bar */}
          <div className="mt-6 w-full bg-gray-200 rounded-full h-1">
            <div className="bg-gray-900 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {error && (
        <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded z-50">
          <p className="text-sm">{error}</p>
        </div>
      )}
      {children}
    </>
  )
}
