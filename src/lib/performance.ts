import { useEffect, useRef, useCallback, useState, useMemo } from 'react'

// ============================================================================
// PERFORMANCE OPTIMIZATION UTILITIES
// ============================================================================

// Image lazy loading with Intersection Observer
export function useLazyImage() {
  const imgRef = useRef<HTMLImageElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const img = imgRef.current
    if (!img) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    observer.observe(img)
    return () => observer.unobserve(img)
  }, [])

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
  }, [])

  return { imgRef, isLoaded, isInView, handleLoad }
}

// Debounce hook for performance
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Throttle hook for performance
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now())

  return useCallback(
    (...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args)
        lastRun.current = Date.now()
      }
    },
    [callback, delay]
  ) as T
}

// Virtual scrolling hook for large lists
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const visibleItemCount = Math.ceil(containerHeight / itemHeight)
  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(startIndex + visibleItemCount + 1, items.length)

  const visibleItems = items.slice(startIndex, endIndex)
  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight

  const handleScroll = useThrottle((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, 16)

  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex,
    endIndex
  }
}

// Memory management for large datasets
export function useMemoryOptimization<T>(
  data: T[],
  maxItems: number = 1000
) {
  const [optimizedData, setOptimizedData] = useState<T[]>([])

  useEffect(() => {
    if (data.length <= maxItems) {
      setOptimizedData(data)
    } else {
      // Keep only the most recent items
      setOptimizedData(data.slice(-maxItems))
    }
  }, [data, maxItems])

  return optimizedData
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0)
  const startTime = useRef(performance.now())

  useEffect(() => {
    renderCount.current++
    const endTime = performance.now()
    const renderTime = endTime - startTime.current

    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`)
    }

    startTime.current = performance.now()
  })

  return { renderCount: renderCount.current }
}

// Bundle size optimization - dynamic imports
export const lazyImport = {
  // Lazy load heavy components
  ProductSearch: () => import('@/components/product/product-search'),
  ShoppingCart: () => import('@/components/cart/shopping-cart'),
  Wishlist: () => import('@/components/wishlist/wishlist'),
  ChatInterface: () => import('@/components/chat/chat-interface'),
  PaymentForm: () => import('@/components/payment/payment-form'),
  ShippingCalculator: () => import('@/components/shipping/shipping-calculator'),
  FileUpload: () => import('@/components/ui/file-upload'),
  ImageUpload: () => import('@/components/ui/image-upload'),
  Modal: () => import('@/components/ui/modal'),
  Toast: () => import('@/components/ui/toast'),
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver<T extends HTMLElement = HTMLElement>(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const ref = useRef<T>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasIntersected) {
          setIsIntersecting(true)
          setHasIntersected(true)
          observer.unobserve(element)
        }
      },
      { threshold: 0.1, ...options }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [hasIntersected, options])

  return { ref, isIntersecting, hasIntersected }
}

// Memoization hook for expensive calculations
export function useMemoizedValue<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(factory, deps)
}

// Resource preloading hook
export function usePreloadResources(resources: string[]) {
  useEffect(() => {
    resources.forEach((resource) => {
      if (resource.endsWith('.css')) {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'style'
        link.href = resource
        document.head.appendChild(link)
      } else if (resource.endsWith('.js')) {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'script'
        link.href = resource
        document.head.appendChild(link)
      }
    })
  }, [resources])
}

// Performance metrics tracking
export function usePerformanceMetrics(componentName: string) {
  const metrics = useRef({
    mountTime: 0,
    renderCount: 0,
    totalRenderTime: 0,
  })

  useEffect(() => {
    const startTime = performance.now()
    metrics.current.mountTime = startTime

    return () => {
      const endTime = performance.now()
      const totalTime = endTime - metrics.current.mountTime
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} lifecycle:`, {
          totalTime: `${totalTime.toFixed(2)}ms`,
          renderCount: metrics.current.renderCount,
          averageRenderTime: `${(metrics.current.totalRenderTime / metrics.current.renderCount).toFixed(2)}ms`,
        })
      }
    }
  }, [componentName])

  useEffect(() => {
    metrics.current.renderCount++
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      metrics.current.totalRenderTime += endTime - startTime
    }
  })

  return metrics.current
}

// Bundle size analyzer
export function useBundleAnalyzer() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      // @ts-ignore
      if (window.__NEXT_DATA__) {
        console.log('Bundle analysis available at: http://localhost:8888')
      }
    }
  }, [])
}

// Performance optimization for lists
export function useOptimizedList<T>(
  items: T[],
  pageSize: number = 20
) {
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return items.slice(startIndex, endIndex)
  }, [items, currentPage, pageSize])

  const hasMore = useMemo(() => {
    return currentPage * pageSize < items.length
  }, [items.length, currentPage, pageSize])

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setIsLoading(true)
      setTimeout(() => {
        setCurrentPage(prev => prev + 1)
        setIsLoading(false)
      }, 100)
    }
  }, [hasMore, isLoading])

  useEffect(() => {
    if (items.length > 0 && paginatedItems.length === 0) {
      loadMore()
    }
  }, [items])

  return {
    items: paginatedItems,
    currentPage,
    hasMore,
    isLoading,
    loadMore,
    totalItems: items.length,
  }
} 