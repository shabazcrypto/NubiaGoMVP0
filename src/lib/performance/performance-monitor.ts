/**
 * 🚀 Edge Request Optimization - Performance Monitor
 * 
 * Features:
 * - Real User Monitoring (RUM)
 * - Core Web Vitals tracking
 * - Edge function performance monitoring
 * - Request/response time tracking
 * - Error tracking and reporting
 */

// Performance metrics storage
interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number[] // Largest Contentful Paint
  fid: number[] // First Input Delay
  cls: number[] // Cumulative Layout Shift
  ttfb: number[] // Time to First Byte
  fcp: number[] // First Contentful Paint
  
  // Custom metrics
  edgeRequests: number
  cacheHits: number
  cacheMisses: number
  apiCalls: number
  staticAssets: number
  
  // Error tracking
  errors: Array<{
    message: string
    stack?: string
    timestamp: number
    url: string
    userAgent: string
  }>
  
  // Performance marks
  marks: Map<string, number>
  
  // Navigation timing
  navigationTiming?: PerformanceNavigationTiming
}

// Global performance instance
let performanceMonitor: PerformanceMonitor | null = null

/**
 * Performance Monitor Class
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics
  private observers: Map<string, PerformanceObserver>
  private isInitialized = false
  private reportInterval: NodeJS.Timeout | null = null

  constructor() {
    this.metrics = {
      lcp: [],
      fid: [],
      cls: [],
      ttfb: [],
      fcp: [],
      edgeRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      apiCalls: 0,
      staticAssets: 0,
      errors: [],
      marks: new Map(),
    }
    
    this.observers = new Map()
  }

  /**
   * Initialize performance monitoring
   */
  init(): void {
    if (this.isInitialized || typeof window === 'undefined') return
    
    this.isInitialized = true
    
    // Set up Core Web Vitals observers
    this.setupCoreWebVitals()
    
    // Set up error tracking
    this.setupErrorTracking()
    
    // Set up navigation timing
    this.setupNavigationTiming()
    
    // Start periodic reporting
    this.startReporting()
    
    console.log('🚀 Performance Monitor initialized')
  }

  /**
   * Set up Core Web Vitals monitoring
   */
  private setupCoreWebVitals(): void {
    // Largest Contentful Paint
    this.observeMetric('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1]
      if (lastEntry) {
        this.metrics.lcp.push(lastEntry.startTime)
        this.mark('lcp', lastEntry.startTime)
      }
    })

    // First Input Delay
    this.observeMetric('first-input', (entries) => {
      const firstInput = entries[0]
      if (firstInput) {
        this.metrics.fid.push(firstInput.processingStart - firstInput.startTime)
        this.mark('fid', firstInput.processingStart - firstInput.startTime)
      }
    })

    // Cumulative Layout Shift
    this.observeMetric('layout-shift', (entries) => {
      let clsValue = 0
      entries.forEach((entry) => {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
        }
      })
      this.metrics.cls.push(clsValue)
      this.mark('cls', clsValue)
    })

    // First Contentful Paint
    this.observeMetric('paint', (entries) => {
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.fcp.push(entry.startTime)
          this.mark('fcp', entry.startTime)
        }
      })
    })
  }

  /**
   * Set up error tracking
   */
  private setupErrorTracking(): void {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        stack: event.error?.stack,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      })
    })

    // Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      })
    })
  }

  /**
   * Set up navigation timing
   */
  private setupNavigationTiming(): void {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigationEntries = performance.getEntriesByType('navigation')
      if (navigationEntries.length > 0) {
        const navEntry = navigationEntries[0] as PerformanceNavigationTiming
        this.metrics.navigationTiming = navEntry
        this.metrics.ttfb.push(navEntry.responseStart - navEntry.requestStart)
        this.mark('ttfb', navEntry.responseStart - navEntry.requestStart)
      }
    }
  }

  /**
   * Observe performance metric
   */
  private observeMetric(type: string, callback: (entries: PerformanceEntryList) => void): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver(callback)
        observer.observe({ type, buffered: true })
        this.observers.set(type, observer)
      } catch (error) {
        console.warn(`Failed to observe ${type}:`, error)
      }
    }
  }

  /**
   * Track custom metric
   */
  trackMetric(name: string, value: number): void {
    switch (name) {
      case 'edge-request':
        this.metrics.edgeRequests++
        break
      case 'cache-hit':
        this.metrics.cacheHits++
        break
      case 'cache-miss':
        this.metrics.cacheMisses++
        break
      case 'api-call':
        this.metrics.apiCalls++
        break
      case 'static-asset':
        this.metrics.staticAssets++
        break
      default:
        this.mark(name, value)
    }
  }

  /**
   * Track error
   */
  trackError(error: PerformanceMetrics['errors'][0]): void {
    this.metrics.errors.push(error)
    
    // Report critical errors immediately
    if (error.message.includes('critical') || error.message.includes('fatal')) {
      this.reportMetrics('error')
    }
  }

  /**
   * Mark performance point
   */
  mark(name: string, value: number): void {
    this.metrics.marks.set(name, value)
    
    // Use Performance API mark if available
    if ('performance' in window && 'mark' in performance) {
      performance.mark(name)
    }
  }

  /**
   * Measure between two marks
   */
  measure(name: string, startMark: string, endMark: string): number | null {
    if ('performance' in window && 'measure' in performance) {
      try {
        const measure = performance.measure(name, startMark, endMark)
        return measure.duration
      } catch (error) {
        console.warn(`Failed to measure ${name}:`, error)
      }
    }
    return null
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return {
      ...this.metrics,
      marks: new Map(this.metrics.marks), // Clone to prevent external mutations
    }
  }

  /**
   * Get Core Web Vitals summary
   */
  getCoreWebVitals(): {
    lcp: number | null
    fid: number | null
    cls: number | null
    ttfb: number | null
    fcp: number | null
  } {
    return {
      lcp: this.metrics.lcp.length > 0 ? Math.max(...this.metrics.lcp) : null,
      fid: this.metrics.fid.length > 0 ? Math.min(...this.metrics.fid) : null,
      cls: this.metrics.cls.length > 0 ? Math.max(...this.metrics.cls) : null,
      ttfb: this.metrics.ttfb.length > 0 ? Math.min(...this.metrics.ttfb) : null,
      fcp: this.metrics.fcp.length > 0 ? Math.min(...this.metrics.fcp) : null,
    }
  }

  /**
   * Start periodic reporting
   */
  private startReporting(): void {
    // Report every 30 seconds
    this.reportInterval = setInterval(() => {
      this.reportMetrics('periodic')
    }, 30000)
  }

  /**
   * Report metrics to analytics
   */
  private async reportMetrics(type: 'periodic' | 'error' | 'pageview'): Promise<void> {
    const metrics = this.getMetrics()
    const coreWebVitals = this.getCoreWebVitals()
    
    const report = {
      type,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      coreWebVitals,
      metrics: {
        edgeRequests: metrics.edgeRequests,
        cacheHits: metrics.cacheHits,
        cacheMisses: metrics.cacheMisses,
        apiCalls: metrics.apiCalls,
        staticAssets: metrics.staticAssets,
        cacheHitRate: metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses) || 0,
      },
      errors: type === 'error' ? metrics.errors.slice(-5) : [], // Only send recent errors
      marks: Object.fromEntries(metrics.marks),
    }

    try {
      // Send to analytics endpoint
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      })
    } catch (error) {
      console.warn('Failed to report performance metrics:', error)
    }
  }

  /**
   * Clean up observers
   */
  destroy(): void {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers.clear()
    
    if (this.reportInterval) {
      clearInterval(this.reportInterval)
      this.reportInterval = null
    }
    
    this.isInitialized = false
  }
}

/**
 * Get or create performance monitor instance
 */
export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor()
  }
  return performanceMonitor
}

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring(): void {
  const monitor = getPerformanceMonitor()
  monitor.init()
}

/**
 * Track custom metric
 */
export function trackMetric(name: string, value: number): void {
  const monitor = getPerformanceMonitor()
  monitor.trackMetric(name, value)
}

/**
 * Track error
 */
export function trackError(error: { message: string; stack?: string }): void {
  const monitor = getPerformanceMonitor()
  monitor.trackError({
    ...error,
    timestamp: Date.now(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  })
}

/**
 * Mark performance point
 */
export function mark(name: string, value?: number): void {
  const monitor = getPerformanceMonitor()
  if (value !== undefined) {
    monitor.mark(name, value)
  } else {
    monitor.mark(name, Date.now())
  }
}

/**
 * Measure between two marks
 */
export function measure(name: string, startMark: string, endMark: string): number | null {
  const monitor = getPerformanceMonitor()
  return monitor.measure(name, startMark, endMark)
}

// Initialize on client-side
if (typeof window !== 'undefined') {
  // Initialize after page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPerformanceMonitoring)
  } else {
    initPerformanceMonitoring()
  }
  
  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      const monitor = getPerformanceMonitor()
      monitor.reportMetrics('pageview')
    }
  })
}
