'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { usePWA } from '@/hooks/usePWA'

interface MobileOptimizationContextType {
  // Network information
  networkSpeed: 'slow' | 'medium' | 'fast'
  isOnline: boolean
  connectionType: string | null
  
  // Performance metrics
  performanceMetrics: {
    fcp: number | null
    lcp: number | null
    cls: number | null
    fid: number | null
  }
  
  // Mobile-specific features
  isMobile: boolean
  supportsTouch: boolean
  supportsPWA: boolean
  
  // Offline capabilities
  isOffline: boolean
  offlineDataAvailable: boolean
  
  // Utility functions
  getOptimalImageQuality: (imageUrl: string) => string
  shouldUseLowQuality: () => boolean
  getNetworkOptimizedSettings: () => {
    imageQuality: 'low' | 'medium' | 'high'
    enableAnimations: boolean
    enableAutoPlay: boolean
    cacheStrategy: 'aggressive' | 'balanced' | 'minimal'
  }
}

const MobileOptimizationContext = createContext<MobileOptimizationContextType | undefined>(undefined)

interface MobileOptimizationProviderProps {
  children: ReactNode
}

export function MobileOptimizationProvider({ children }: MobileOptimizationProviderProps) {
  const { isOnline } = useNetworkStatus()
  const { isInstalled, isUpdateAvailable } = usePWA()
  
  const [networkSpeed, setNetworkSpeed] = useState<'slow' | 'medium' | 'fast'>('medium')
  const [connectionType, setConnectionType] = useState<string | null>(null)
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fcp: null,
    lcp: null,
    cls: null,
    fid: null
  })
  const [isMobile, setIsMobile] = useState(false)
  const [supportsTouch, setSupportsTouch] = useState(false)
  const [supportsPWA, setSupportsPWA] = useState(false)
  const [offlineDataAvailable, setOfflineDataAvailable] = useState(false)

  // Detect mobile device and capabilities
  useEffect(() => {
    const checkMobileCapabilities = () => {
      // Check if device is mobile
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /mobile|android|iphone|ipad|phone|tablet/i.test(userAgent)
      setIsMobile(isMobileDevice)

      // Check touch support
      setSupportsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)

      // Check PWA support
      setSupportsPWA('serviceWorker' in navigator && 'PushManager' in window)
    }

    checkMobileCapabilities()
  }, [])

  // Network speed detection
  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      
      const updateNetworkInfo = () => {
        if (connection.effectiveType) {
          const effectiveType = connection.effectiveType
          if (effectiveType === 'slow-2g' || effectiveType === '2g') {
            setNetworkSpeed('slow')
          } else if (effectiveType === '3g') {
            setNetworkSpeed('medium')
          } else {
            setNetworkSpeed('fast')
          }
        }
        
        if (connection.type) {
          setConnectionType(connection.type)
        }
      }

      updateNetworkInfo()
      connection.addEventListener('change', updateNetworkInfo)
      
      return () => connection.removeEventListener('change', updateNetworkInfo)
    }
  }, [])

  // Performance monitoring
  useEffect(() => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
        if (fcpEntry) {
          setPerformanceMetrics(prev => ({ ...prev, fcp: fcpEntry.startTime }))
        }
      })
      fcpObserver.observe({ entryTypes: ['paint'] })

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        if (lastEntry) {
          setPerformanceMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }))
        }
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        setPerformanceMetrics(prev => ({ ...prev, cls: clsValue }))
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const fidEntry = entries.find(entry => entry.name === 'first-input')
        if (fidEntry) {
          setPerformanceMetrics(prev => ({ ...prev, fid: fidEntry.processingStart - fidEntry.startTime }))
        }
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      return () => {
        fcpObserver.disconnect()
        lcpObserver.disconnect()
        clsObserver.disconnect()
        fidObserver.disconnect()
      }
    }
  }, [])

  // Check offline data availability
  useEffect(() => {
    const checkOfflineData = async () => {
      try {
        // Check if we have cached products
        if ('indexedDB' in window) {
          // This is a simplified check - in a real app you'd check actual data
          setOfflineDataAvailable(true)
        } else if ('localStorage' in window) {
          const cachedProducts = localStorage.getItem('cached_products')
          setOfflineDataAvailable(!!cachedProducts)
        }
      } catch (error) {
        console.warn('Error checking offline data:', error)
        setOfflineDataAvailable(false)
      }
    }

    checkOfflineData()
  }, [])

  // Utility functions
  const getOptimalImageQuality = (imageUrl: string): string => {
    if (networkSpeed === 'slow') {
      return imageUrl.replace(/\.(jpg|jpeg|png)$/i, '-low.$1')
    } else if (networkSpeed === 'medium') {
      return imageUrl.replace(/\.(jpg|jpeg|png)$/i, '-medium.$1')
    }
    return imageUrl
  }

  const shouldUseLowQuality = (): boolean => {
    return networkSpeed === 'slow' || !isOnline
  }

  const getNetworkOptimizedSettings = () => {
    const baseSettings = {
      imageQuality: 'medium' as const,
      enableAnimations: true,
      enableAutoPlay: true,
      cacheStrategy: 'balanced' as const
    }

    if (networkSpeed === 'slow') {
      return {
        ...baseSettings,
        imageQuality: 'low',
        enableAnimations: false,
        enableAutoPlay: false,
        cacheStrategy: 'aggressive'
      }
    } else if (networkSpeed === 'medium') {
      return {
        ...baseSettings,
        imageQuality: 'medium',
        enableAnimations: true,
        enableAutoPlay: false,
        cacheStrategy: 'balanced'
      }
    } else {
      return {
        ...baseSettings,
        imageQuality: 'high',
        enableAnimations: true,
        enableAutoPlay: true,
        cacheStrategy: 'minimal'
      }
    }
  }

  const contextValue: MobileOptimizationContextType = {
    networkSpeed,
    isOnline,
    connectionType,
    performanceMetrics,
    isMobile,
    supportsTouch,
    supportsPWA,
    isOffline: !isOnline,
    offlineDataAvailable,
    getOptimalImageQuality,
    shouldUseLowQuality,
    getNetworkOptimizedSettings
  }

  return (
    <MobileOptimizationContext.Provider value={contextValue}>
      {children}
    </MobileOptimizationContext.Provider>
  )
}

export function useMobileOptimization() {
  const context = useContext(MobileOptimizationContext)
  if (context === undefined) {
    throw new Error('useMobileOptimization must be used within a MobileOptimizationProvider')
  }
  return context
}
