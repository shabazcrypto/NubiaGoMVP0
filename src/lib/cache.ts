// Simple localStorage cache implementation
interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  namespace?: string // Namespace for cache keys
}

class SimpleCache {
  private namespace: string

  constructor(options: CacheOptions = {}) {
    this.namespace = options.namespace || 'app'
  }

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    const fullKey = `${this.namespace}:${key}`
    
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      }
      
      localStorage.setItem(fullKey, JSON.stringify(item))
    } catch (error) {
      // Silently fail if localStorage is not available
    }
  }

  get<T>(key: string): T | null {
    const fullKey = `${this.namespace}:${key}`
    
    try {
      const itemStr = localStorage.getItem(fullKey)
      if (!itemStr) return null

      const item: CacheItem<T> = JSON.parse(itemStr)
      
      // Check if item has expired
      if (Date.now() - item.timestamp > item.ttl) {
        localStorage.removeItem(fullKey)
        return null
      }

      return item.data
    } catch (error) {
      return null
    }
  }

  has(key: string): boolean {
    const fullKey = `${this.namespace}:${key}`
    return localStorage.getItem(fullKey) !== null
  }

  delete(key: string): boolean {
    const fullKey = `${this.namespace}:${key}`
    try {
      localStorage.removeItem(fullKey)
      return true
    } catch (error) {
      return false
    }
  }

  clear(): void {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(`${this.namespace}:`)) {
        localStorage.removeItem(key)
      }
    })
  }
}

// Export simple cache instance
export const cache = new SimpleCache({ namespace: 'nubiaGo' })

// Cache utilities
export const cacheUtils = {
  // Debounce function for API calls
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  },

  // Throttle function for API calls
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  },
}

// Default export for convenience
export default cache 