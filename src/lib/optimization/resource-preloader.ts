'use client'

interface PreloadConfig {
  priority: 'high' | 'medium' | 'low'
  delay?: number
  maxConcurrent?: number
  retryAttempts?: number
  timeout?: number
}

interface ResourceMetrics {
  url: string
  loadTime: number
  success: boolean
  timestamp: number
  fromCache: boolean
}

interface UserBehaviorPattern {
  pageViews: string[]
  timeSpent: Record<string, number>
  interactions: string[]
  deviceType: 'mobile' | 'desktop' | 'tablet'
  connectionSpeed: 'slow' | 'medium' | 'fast'
}

class IntelligentResourcePreloader {
  private preloadQueue: Map<string, PreloadConfig> = new Map()
  private loadingResources: Set<string> = new Set()
  private loadedResources: Set<string> = new Set()
  private failedResources: Set<string> = new Set()
  private metrics: ResourceMetrics[] = []
  private userBehavior: UserBehaviorPattern
  private maxConcurrentLoads = 6
  private isEnabled = true

  constructor() {
    this.userBehavior = this.initializeUserBehavior()
    this.startPreloadProcessor()
    this.initializeNetworkMonitoring()
  }

  private initializeUserBehavior(): UserBehaviorPattern {
    return {
      pageViews: [],
      timeSpent: {},
      interactions: [],
      deviceType: this.detectDeviceType(),
      connectionSpeed: this.detectConnectionSpeed()
    }
  }

  private detectDeviceType(): 'mobile' | 'desktop' | 'tablet' {
    if (typeof window === 'undefined') return 'desktop'
    
    const userAgent = navigator.userAgent.toLowerCase()
    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
      return 'mobile'
    }
    if (/tablet|ipad/i.test(userAgent)) {
      return 'tablet'
    }
    return 'desktop'
  }

  private detectConnectionSpeed(): 'slow' | 'medium' | 'fast' {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) {
      return 'medium'
    }

    const connection = (navigator as any).connection
    if (!connection) return 'medium'

    const effectiveType = connection.effectiveType
    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        return 'slow'
      case '3g':
        return 'medium'
      case '4g':
      default:
        return 'fast'
    }
  }

  private initializeNetworkMonitoring() {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection
      connection?.addEventListener('change', () => {
        this.userBehavior.connectionSpeed = this.detectConnectionSpeed()
        this.adjustPreloadingStrategy()
      })
    }
  }

  private adjustPreloadingStrategy() {
    const { connectionSpeed, deviceType } = this.userBehavior

    // Adjust concurrent loads based on connection and device
    if (connectionSpeed === 'slow' || deviceType === 'mobile') {
      this.maxConcurrentLoads = 2
    } else if (connectionSpeed === 'medium') {
      this.maxConcurrentLoads = 4
    } else {
      this.maxConcurrentLoads = 6
    }

    // Pause preloading on slow connections
    this.isEnabled = connectionSpeed !== 'slow'
  }

  // Public API methods
  preloadImage(url: string, config: Partial<PreloadConfig> = {}): Promise<void> {
    const finalConfig: PreloadConfig = {
      priority: 'medium',
      delay: 0,
      maxConcurrent: this.maxConcurrentLoads,
      retryAttempts: 2,
      timeout: 10000,
      ...config
    }

    this.preloadQueue.set(url, finalConfig)
    return this.processPreloadQueue()
  }

  preloadRoute(route: string, config: Partial<PreloadConfig> = {}): Promise<void> {
    return this.preloadResource(route, 'route', config)
  }

  preloadScript(url: string, config: Partial<PreloadConfig> = {}): Promise<void> {
    return this.preloadResource(url, 'script', config)
  }

  preloadStylesheet(url: string, config: Partial<PreloadConfig> = {}): Promise<void> {
    return this.preloadResource(url, 'stylesheet', config)
  }

  preloadFont(url: string, config: Partial<PreloadConfig> = {}): Promise<void> {
    return this.preloadResource(url, 'font', config)
  }

  private async preloadResource(
    url: string, 
    type: 'image' | 'route' | 'script' | 'stylesheet' | 'font',
    config: Partial<PreloadConfig> = {}
  ): Promise<void> {
    if (this.loadedResources.has(url) || this.loadingResources.has(url)) {
      return Promise.resolve()
    }

    const finalConfig: PreloadConfig = {
      priority: 'medium',
      delay: 0,
      retryAttempts: 2,
      timeout: 10000,
      ...config
    }

    this.loadingResources.add(url)
    const startTime = performance.now()

    try {
      await this.executePreload(url, type, finalConfig)
      
      const loadTime = performance.now() - startTime
      this.recordMetrics(url, loadTime, true, false)
      this.loadedResources.add(url)
      
    } catch (error) {
      const loadTime = performance.now() - startTime
      this.recordMetrics(url, loadTime, false, false)
      this.failedResources.add(url)
      
      // Retry logic
      if (finalConfig.retryAttempts && finalConfig.retryAttempts > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        return this.preloadResource(url, type, {
          ...finalConfig,
          retryAttempts: finalConfig.retryAttempts - 1
        })
      }
      
      throw error
    } finally {
      this.loadingResources.delete(url)
    }
  }

  private async executePreload(
    url: string, 
    type: 'image' | 'route' | 'script' | 'stylesheet' | 'font',
    config: PreloadConfig
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Preload timeout for ${url}`))
      }, config.timeout)

      const cleanup = () => clearTimeout(timeout)

      switch (type) {
        case 'image':
          const img = new Image()
          img.onload = () => {
            cleanup()
            resolve()
          }
          img.onerror = () => {
            cleanup()
            reject(new Error(`Failed to preload image: ${url}`))
          }
          img.src = url
          break

        case 'route':
          fetch(url, { method: 'HEAD' })
            .then(() => {
              cleanup()
              resolve()
            })
            .catch(error => {
              cleanup()
              reject(error)
            })
          break

        case 'script':
          const script = document.createElement('script')
          script.onload = () => {
            cleanup()
            resolve()
          }
          script.onerror = () => {
            cleanup()
            reject(new Error(`Failed to preload script: ${url}`))
          }
          script.src = url
          script.async = true
          document.head.appendChild(script)
          break

        case 'stylesheet':
          const link = document.createElement('link')
          link.onload = () => {
            cleanup()
            resolve()
          }
          link.onerror = () => {
            cleanup()
            reject(new Error(`Failed to preload stylesheet: ${url}`))
          }
          link.rel = 'stylesheet'
          link.href = url
          document.head.appendChild(link)
          break

        case 'font':
          const fontLink = document.createElement('link')
          fontLink.onload = () => {
            cleanup()
            resolve()
          }
          fontLink.onerror = () => {
            cleanup()
            reject(new Error(`Failed to preload font: ${url}`))
          }
          fontLink.rel = 'preload'
          fontLink.as = 'font'
          fontLink.href = url
          fontLink.setAttribute('crossorigin', 'anonymous')
          document.head.appendChild(fontLink)
          break

        default:
          cleanup()
          reject(new Error(`Unknown preload type: ${type}`))
      }
    })
  }

  private async processPreloadQueue(): Promise<void> {
    if (!this.isEnabled || this.preloadQueue.size === 0) {
      return Promise.resolve()
    }

    const availableSlots = this.maxConcurrentLoads - this.loadingResources.size
    if (availableSlots <= 0) {
      return Promise.resolve()
    }

    // Sort by priority
    const sortedQueue = Array.from(this.preloadQueue.entries()).sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b[1].priority] - priorityOrder[a[1].priority]
    })

    const promises: Promise<void>[] = []
    let processed = 0

    for (const [url, config] of sortedQueue) {
      if (processed >= availableSlots) break
      
      this.preloadQueue.delete(url)
      
      if (config.delay && config.delay > 0) {
        promises.push(
          new Promise(resolve => {
            setTimeout(() => {
              this.preloadResource(url, 'image', config).finally(resolve)
            }, config.delay)
          })
        )
      } else {
        promises.push(this.preloadResource(url, 'image', config))
      }
      
      processed++
    }

    await Promise.allSettled(promises)
  }

  private startPreloadProcessor() {
    setInterval(() => {
      this.processPreloadQueue()
    }, 1000)
  }

  private recordMetrics(url: string, loadTime: number, success: boolean, fromCache: boolean) {
    this.metrics.push({
      url,
      loadTime,
      success,
      timestamp: Date.now(),
      fromCache
    })

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }
  }

  // User behavior tracking
  trackPageView(page: string) {
    this.userBehavior.pageViews.push(page)
    if (this.userBehavior.pageViews.length > 50) {
      this.userBehavior.pageViews = this.userBehavior.pageViews.slice(-50)
    }
  }

  trackTimeSpent(page: string, duration: number) {
    this.userBehavior.timeSpent[page] = duration
  }

  trackInteraction(interaction: string) {
    this.userBehavior.interactions.push(interaction)
    if (this.userBehavior.interactions.length > 100) {
      this.userBehavior.interactions = this.userBehavior.interactions.slice(-100)
    }
  }

  // Intelligent preloading based on user behavior
  predictAndPreload() {
    const predictions = this.generatePredictions()
    
    predictions.forEach(({ url, priority }) => {
      this.preloadImage(url, { priority })
    })
  }

  private generatePredictions(): Array<{ url: string; priority: 'high' | 'medium' | 'low' }> {
    const predictions: Array<{ url: string; priority: 'high' | 'medium' | 'low' }> = []
    
    // Analyze page view patterns
    const recentPages = this.userBehavior.pageViews.slice(-10)
    const pageFrequency = recentPages.reduce((acc, page) => {
      acc[page] = (acc[page] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Predict next likely pages
    Object.entries(pageFrequency).forEach(([page, frequency]) => {
      if (frequency > 2) {
        predictions.push({
          url: page,
          priority: frequency > 5 ? 'high' : 'medium'
        })
      }
    })

    return predictions
  }

  // Analytics and reporting
  getMetrics() {
    const totalRequests = this.metrics.length
    const successfulRequests = this.metrics.filter(m => m.success).length
    const averageLoadTime = this.metrics.reduce((sum, m) => sum + m.loadTime, 0) / totalRequests
    const cacheHitRate = this.metrics.filter(m => m.fromCache).length / totalRequests

    return {
      totalRequests,
      successfulRequests,
      successRate: successfulRequests / totalRequests,
      averageLoadTime,
      cacheHitRate,
      loadedResources: this.loadedResources.size,
      failedResources: this.failedResources.size,
      queueSize: this.preloadQueue.size,
      activeLoads: this.loadingResources.size
    }
  }

  // Cleanup methods
  clearCache() {
    this.loadedResources.clear()
    this.failedResources.clear()
    this.metrics = []
  }

  pause() {
    this.isEnabled = false
  }

  resume() {
    this.isEnabled = true
  }
}

// Global instance
export const resourcePreloader = new IntelligentResourcePreloader()

// React hook for resource preloading
export function useResourcePreloader() {
  const preloadImage = (url: string, priority: 'high' | 'medium' | 'low' = 'medium') => {
    return resourcePreloader.preloadImage(url, { priority })
  }

  const preloadRoute = (route: string, priority: 'high' | 'medium' | 'low' = 'medium') => {
    return resourcePreloader.preloadRoute(route, { priority })
  }

  const trackPageView = (page: string) => {
    resourcePreloader.trackPageView(page)
  }

  const getMetrics = () => {
    return resourcePreloader.getMetrics()
  }

  return {
    preloadImage,
    preloadRoute,
    trackPageView,
    getMetrics
  }
}

// Utility functions for common preloading scenarios
export const preloadUtils = {
  // Preload critical above-the-fold images
  preloadCriticalImages: (urls: string[]) => {
    urls.forEach(url => {
      resourcePreloader.preloadImage(url, { priority: 'high', delay: 0 })
    })
  },

  // Preload next page in sequence
  preloadNextPage: (currentPage: string, pageSequence: string[]) => {
    const currentIndex = pageSequence.indexOf(currentPage)
    if (currentIndex !== -1 && currentIndex < pageSequence.length - 1) {
      const nextPage = pageSequence[currentIndex + 1]
      resourcePreloader.preloadRoute(nextPage, { priority: 'medium', delay: 1000 })
    }
  },

  // Preload based on hover intent
  preloadOnHover: (element: HTMLElement, url: string) => {
    let hoverTimeout: NodeJS.Timeout

    element.addEventListener('mouseenter', () => {
      hoverTimeout = setTimeout(() => {
        resourcePreloader.preloadImage(url, { priority: 'high' })
      }, 200)
    })

    element.addEventListener('mouseleave', () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout)
      }
    })
  },

  // Preload for mobile touch interactions
  preloadOnTouch: (element: HTMLElement, url: string) => {
    element.addEventListener('touchstart', () => {
      resourcePreloader.preloadImage(url, { priority: 'high' })
    }, { passive: true })
  }
}
