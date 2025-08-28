// Performance optimization hooks and utilities
import { useEffect, useRef, useState, useCallback } from 'react'

// ============================================================================
// INTERSECTION OBSERVER HOOK
// ============================================================================

interface UseIntersectionObserverOptions {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver<T extends Element>(
  options: UseIntersectionObserverOptions = {}
) {
  const {
    threshold = 0.1,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false
  } = options

  const elementRef = useRef<T>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasBeenVisible, setHasBeenVisible] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Don't re-observe if it was already visible and we want to freeze
    if (freezeOnceVisible && hasBeenVisible) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting
        setIsIntersecting(isElementIntersecting)

        if (isElementIntersecting) {
          setHasBeenVisible(true)
        }
      },
      {
        threshold,
        root,
        rootMargin
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, root, rootMargin, freezeOnceVisible, hasBeenVisible])

  return {
    elementRef,
    isIntersecting: freezeOnceVisible ? hasBeenVisible : isIntersecting
  }
}

// ============================================================================
// LAZY IMAGE HOOK
// ============================================================================

interface UseLazyImageOptions {
  src: string
  fallbackSrc?: string
  threshold?: number
  rootMargin?: string
}

export function useLazyImage(options: UseLazyImageOptions) {
  const { src, fallbackSrc = '/fallback-product.jpg', threshold = 0.1, rootMargin = '50px' } = options
  
  const [imageSrc, setImageSrc] = useState<string>('')
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  
  const { elementRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold,
    rootMargin,
    freezeOnceVisible: true
  })

  useEffect(() => {
    if (isIntersecting && src && !imageSrc) {
      setImageSrc(src)
    }
  }, [isIntersecting, src, imageSrc])

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    setHasError(false)
  }, [])

  const handleError = useCallback(() => {
    setHasError(true)
    setIsLoaded(false)
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc)
    }
  }, [imageSrc, fallbackSrc])

  return {
    elementRef,
    imageSrc: imageSrc || fallbackSrc,
    isLoaded,
    hasError,
    isIntersecting,
    handleLoad,
    handleError
  }
}

// ============================================================================
// PERFORMANCE MONITORING HOOKS
// ============================================================================

export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef<number>(0)
  const [renderTime, setRenderTime] = useState<number>(0)

  useEffect(() => {
    renderStartTime.current = performance.now()
  }, [])

  useEffect(() => {
    const endTime = performance.now()
    const duration = endTime - renderStartTime.current
    setRenderTime(duration)
    
    // Log slow renders in development
    if (process.env.NODE_ENV === 'development' && duration > 16) {
      // // // console.warn(`Slow render detected in ${componentName}: ${duration.toFixed(2)}ms`)
    }
  }, [componentName])

  return { renderTime }
}

// ============================================================================
// DEBOUNCE HOOK
// ============================================================================

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

// ============================================================================
// THROTTLE HOOK
// ============================================================================

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout>()

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now()

      if (now - lastRun.current >= delay) {
        callback(...args)
        lastRun.current = now
      } else {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
          callback(...args)
          lastRun.current = Date.now()
        }, delay - (now - lastRun.current))
      }
    }) as T,
    [callback, delay]
  )
}

// ============================================================================
// PRELOAD UTILITIES
// ============================================================================

export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve()
      return
    }

    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

export function preloadImages(srcs: string[]): Promise<void[]> {
  return Promise.all(srcs.map(preloadImage))
}

// ============================================================================
// MEMORY MANAGEMENT
// ============================================================================

export function useMemoryCleanup(cleanup: () => void, deps: any[] = []) {
  useEffect(() => {
    return cleanup
  }, deps)
}

// ============================================================================
// EXPORTS
// ============================================================================

export * from './bundle-optimizer'
