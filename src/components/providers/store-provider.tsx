'use client'

import { useEffect, useState } from 'react'
import { useSearchHistoryStore } from '@/store/search-history'
import { Loading } from '@/components/ui/loading'

interface StoreProviderProps {
  children: React.ReactNode
}

export default function StoreProvider({ children }: StoreProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      setIsHydrated(true)
      return
    }

    // Initialize stores with timeout protection
    const initializeStores = async () => {
      try {
        // Add a timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Store rehydration timeout')), 3000)
        )
        
        const rehydratePromise = useSearchHistoryStore.persist.rehydrate()
        
        await Promise.race([rehydratePromise, timeoutPromise])
        setIsHydrated(true)
      } catch (error) {
        console.warn('Store rehydration failed or timed out:', error)
        // Continue anyway to prevent infinite loading
        setIsHydrated(true)
      }
    }

    // Fallback timeout to ensure we never get stuck
    const fallbackTimeout = setTimeout(() => {
      console.warn('Store provider fallback timeout - forcing hydration')
      setIsHydrated(true)
    }, 5000)

    initializeStores()

    return () => clearTimeout(fallbackTimeout)
  }, [])

  if (!isHydrated) {
    return <Loading message="Loading your data..." />
  }

  return <>{children}</>
}
