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
    // Initialize stores
    useSearchHistoryStore.persist.rehydrate()
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return <Loading message="Loading your data..." />
  }

  return <>{children}</>
}
