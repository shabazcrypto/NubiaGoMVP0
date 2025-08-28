'use client'

import React from 'react'

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  errorCount: number
  memoryUsage?: number
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map()
  private observers: PerformanceObserver[] = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers()
    }
  }

  private initializeObservers() {
    try {
      // Monitor long tasks
      if ('PerformanceObserver' in window) {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) {
              // // // console.warn(`Long task detected: ${entry.duration}ms`, entry)
            }
          })
        })
        longTaskObserver.observe({ entryTypes: ['longtask'] })
        this.observers.push(longTaskObserver)

        // Monitor layout shifts
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (entry.value > 0.1) {
              // // // console.warn(`Layout shift detected: ${entry.value}`, entry)
            }
          })
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.push(clsObserver)
      }
    } catch (error) {
      // // // console.warn('Performance monitoring not available:', error)
    }
  }

  recordPageLoad(pageName: string) {
    if (typeof window === 'undefined') return

    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const loadTime = navigationTiming ? navigationTiming.loadEventEnd - navigationTiming.fetchStart : 0

    this.metrics.set(pageName, {
      loadTime,
      renderTime: 0,
      errorCount: 0,
      memoryUsage: (performance as any).memory?.usedJSHeapSize
    })

    if (loadTime > 3000) {
      // // // console.warn(`Slow page load detected for ${pageName}: ${loadTime}ms`)
    }
  }

  recordComponentRender(componentName: string, renderTime: number) {
    const existing = this.metrics.get(componentName) || {
      loadTime: 0,
      renderTime: 0,
      errorCount: 0
    }

    this.metrics.set(componentName, {
      ...existing,
      renderTime
    })

    if (renderTime > 100) {
      // // // console.warn(`Slow component render detected for ${componentName}: ${renderTime}ms`)
    }
  }

  recordError(source: string, error: Error) {
    const existing = this.metrics.get(source) || {
      loadTime: 0,
      renderTime: 0,
      errorCount: 0
    }

    this.metrics.set(source, {
      ...existing,
      errorCount: existing.errorCount + 1
    })

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(source, error)
    }
  }

  private sendToAnalytics(source: string, error: Error) {
    // Send to external monitoring service
    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'exception', {
          description: `${source}: ${error.message}`,
          fatal: false
        })
      }
    } catch (err) {
      // // // console.warn('Failed to send analytics:', err)
    }
  }

  getMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics)
  }

  clearMetrics() {
    this.metrics.clear()
  }

  destroy() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for component performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const startTime = React.useRef<number>(0)

  React.useEffect(() => {
    startTime.current = performance.now()
    
    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime.current
      performanceMonitor.recordComponentRender(componentName, renderTime)
    }
  }, [componentName])

  const recordError = React.useCallback((error: Error) => {
    performanceMonitor.recordError(componentName, error)
  }, [componentName])

  return { recordError }
}

// Performance optimization utilities
export const performanceUtils = {
  // Debounce function for expensive operations
  debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
    let timeout: NodeJS.Timeout
    return ((...args: any[]) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(this, args), wait)
    }) as T
  },

  // Throttle function for frequent events
  throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
    let inThrottle: boolean
    return ((...args: any[]) => {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }) as T
  },

  // Lazy loading helper
  createLazyComponent<T extends React.ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>
  ) {
    return React.lazy(importFunc)
  },

  // Memory cleanup helper
  createCleanupFunction(callbacks: (() => void)[]) {
    return () => {
      callbacks.forEach(callback => {
        try {
          callback()
        } catch (error) {
          // // // console.warn('Cleanup error:', error)
        }
      })
    }
  }
}
