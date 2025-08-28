'use client'

import React, { useState, useEffect, ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'

interface PullToRefreshProps {
  children: ReactNode
  onRefresh?: () => Promise<void> | void
  threshold?: number
  disabled?: boolean
}

export default function PullToRefresh({ 
  children, 
  onRefresh, 
  threshold = 80,
  disabled = false 
}: PullToRefreshProps) {
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)
  const [isPulling, setIsPulling] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const pullDistance = Math.max(0, currentY - startY)
  const shouldRefresh = pullDistance > threshold

  useEffect(() => {
    if (disabled) return

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        setStartY(e.touches[0].clientY)
        setIsPulling(true)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (isPulling && window.scrollY === 0) {
        setCurrentY(e.touches[0].clientY)
        if (pullDistance > 0) {
          e.preventDefault()
        }
      }
    }

    const handleTouchEnd = async () => {
      if (isPulling) {
        setIsPulling(false)
        
        if (shouldRefresh && onRefresh) {
          setIsRefreshing(true)
          try {
            await onRefresh()
          } catch (error) {
            // Handle error silently
          } finally {
            setIsRefreshing(false)
          }
        }
        
        setStartY(0)
        setCurrentY(0)
      }
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isPulling, pullDistance, shouldRefresh, onRefresh, disabled])

  const refreshIndicatorStyle = {
    transform: `translateY(${Math.min(pullDistance * 0.5, 60)}px)`,
    opacity: Math.min(pullDistance / threshold, 1),
  }

  return (
    <div className="relative">
      {/* Pull to refresh indicator */}
      <div 
        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full z-50 flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg transition-all duration-200"
        style={refreshIndicatorStyle}
      >
        <RefreshCw 
          className={`w-6 h-6 text-blue-500 ${
            isRefreshing ? 'animate-spin' : shouldRefresh ? 'rotate-180' : ''
          } transition-transform duration-200`}
        />
      </div>

      {/* Content */}
      <div 
        style={{
          transform: isPulling ? `translateY(${Math.min(pullDistance * 0.3, 40)}px)` : 'translateY(0)',
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  )
}
