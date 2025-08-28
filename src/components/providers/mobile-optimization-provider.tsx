'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface MobileOptimizationContextType {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  orientation: 'portrait' | 'landscape'
  screenWidth: number
  screenHeight: number
  touchSupported: boolean
}

const MobileOptimizationContext = createContext<MobileOptimizationContextType | undefined>(undefined)

export function useMobileOptimization() {
  const context = useContext(MobileOptimizationContext)
  if (context === undefined) {
    throw new Error('useMobileOptimization must be used within a MobileOptimizationProvider')
  }
  return context
}

interface MobileOptimizationProviderProps {
  children: ReactNode
}

export function MobileOptimizationProvider({ children }: MobileOptimizationProviderProps) {
  const [screenWidth, setScreenWidth] = useState(0)
  const [screenHeight, setScreenHeight] = useState(0)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    const updateScreenInfo = () => {
      setScreenWidth(window.innerWidth)
      setScreenHeight(window.innerHeight)
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait')
    }

    // Initial setup
    updateScreenInfo()

    // Listen for resize events
    window.addEventListener('resize', updateScreenInfo)
    window.addEventListener('orientationchange', updateScreenInfo)

    return () => {
      window.removeEventListener('resize', updateScreenInfo)
      window.removeEventListener('orientationchange', updateScreenInfo)
    }
  }, [])

  const isMobile = screenWidth < 768
  const isTablet = screenWidth >= 768 && screenWidth < 1024
  const isDesktop = screenWidth >= 1024
  const touchSupported = typeof window !== 'undefined' && 'ontouchstart' in window

  const value: MobileOptimizationContextType = {
    isMobile,
    isTablet,
    isDesktop,
    orientation,
    screenWidth,
    screenHeight,
    touchSupported
  }

  return (
    <MobileOptimizationContext.Provider value={value}>
      {children}
    </MobileOptimizationContext.Provider>
  )
}
