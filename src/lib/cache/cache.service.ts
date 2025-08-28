/**
 * 🚀 Edge Request Optimization - Caching Service
 * 
 * Multi-layer caching strategy:
 * 1. Memory Cache (React Query/SWR) - 5 minutes
 * 2. Application Cache (Redis/Upstash) - 15 minutes  
 * 3. CDN Cache - 1 hour
 * 4. Browser Cache - 1 year (static assets)
 */

import { cache } from 'react'

// In-memory cache for development
const memoryCache = new Map<string, { data: any; timestamp: number; ttl: number }>()

// Cache configuration
const CACHE_CONFIG = {
  MEMORY_TTL: 5 * 60 * 1000, // 5 minutes
  REDIS_TTL: 15 * 60 * 1000, // 15 minutes
  CDN_TTL: 60 * 60 * 1000, // 1 hour
  BROWSER_TTL: 365 * 24 * 60 * 60 * 1000, // 1 year
} as const

// Cache keys for different data types
export const CACHE_KEYS = {
  PRODUCTS: 'products',
  PRODUCT_DETAIL: 'product',
  CATEGORIES: 'categories',
  USER_PROFILE: 'user_profile',
  CART: 'cart',
  SEARCH_RESULTS: 'search',
  RECOMMENDATIONS: 'recommendations',
} as const

export type CacheKey = typeof CACHE_KEYS[keyof typeof CACHE_KEYS]

/**
 * Generate cache key with parameters
 */
export function generateCacheKey(key: CacheKey, params?: Record<string, any>): string {
  if (!params) return key
  
  const sortedParams = Object.keys(params)
    .sort()
    .map(k => `${k}:${params[k]}`)
    .join('|')
  
  return `${key}:${sortedParams}`
}

/**
 * Memory cache implementation
 */
class MemoryCacheService {
  private cache = memoryCache

  set(key: string, data: any, ttl: number = CACHE_CONFIG.MEMORY_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    const isExpired = Date.now() - item.timestamp > item.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

/**
 * Redis cache service (for production)
 */
class RedisCacheService {
  private redis: any = null

  async init(): Promise<void> {
    if (process.env.NODE_ENV === 'production' && process.env.UPSTASH_REDIS_REST_URL) {
      try {
        const { Redis } = await import('@upstash/redis')
        this.redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        })
      } catch (error) {
        // // // console.warn('Redis not available, falling back to memory cache:', error)
      }
    }
  }

  async set(key: string, data: any, ttl: number = CACHE_CONFIG.REDIS_TTL): Promise<void> {
    if (!this.redis) return

    try {
      await this.redis.setex(key, Math.floor(ttl / 1000), JSON.stringify(data))
    } catch (error) {
      // // // console.error('Redis set error:', error)
    }
  }

  async get(key: string): Promise<any | null> {
    if (!this.redis) return null

    try {
      const data = await this.redis.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      // // // console.error('Redis get error:', error)
      return null
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.redis) return

    try {
      await this.redis.del(key)
    } catch (error) {
      // // // console.error('Redis delete error:', error)
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.redis) return

    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } catch (error) {
      // // // console.error('Redis invalidate pattern error:', error)
    }
  }
}

// Initialize cache services
const memoryCacheService = new MemoryCacheService()
const redisCacheService = new RedisCacheService()

// Initialize Redis in production
if (process.env.NODE_ENV === 'production') {
  redisCacheService.init()
}

/**
 * Main cache service
 */
export class CacheService {
  /**
   * Get data from cache (memory first, then Redis)
   */
  static async get<T>(key: string): Promise<T | null> {
    // Try memory cache first
    const memoryData = memoryCacheService.get(key)
    if (memoryData) return memoryData

    // Try Redis cache
    const redisData = await redisCacheService.get(key)
    if (redisData) {
      // Store in memory cache for faster subsequent access
      memoryCacheService.set(key, redisData, CACHE_CONFIG.MEMORY_TTL)
      return redisData
    }

    return null
  }

  /**
   * Set data in cache (both memory and Redis)
   */
  static async set(key: string, data: any, ttl?: number): Promise<void> {
    // Set in memory cache
    memoryCacheService.set(key, data, ttl || CACHE_CONFIG.MEMORY_TTL)
    
    // Set in Redis cache
    await redisCacheService.set(key, data, ttl || CACHE_CONFIG.REDIS_TTL)
  }

  /**
   * Delete data from cache
   */
  static async delete(key: string): Promise<void> {
    memoryCacheService.delete(key)
    await redisCacheService.delete(key)
  }

  /**
   * Invalidate cache by pattern
   */
  static async invalidatePattern(pattern: string): Promise<void> {
    await redisCacheService.invalidatePattern(pattern)
    // Note: Memory cache doesn't support pattern invalidation
    // In production, consider clearing memory cache periodically
  }

  /**
   * Clear all caches
   */
  static async clear(): Promise<void> {
    memoryCacheService.clear()
    // Redis clear would require admin privileges, so we skip it
  }

  /**
   * Get cache statistics
   */
  static getStats(): { memorySize: number; memoryKeys: string[] } {
    return {
      memorySize: memoryCache.size,
      memoryKeys: Array.from(memoryCache.keys()),
    }
  }
}

/**
 * React cache wrapper for server components
 */
export const cached = cache(async <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> => {
  // Try to get from cache first
  const cached = await CacheService.get<T>(key)
  if (cached) return cached

  // Fetch fresh data
  const data = await fetcher()
  
  // Store in cache
  await CacheService.set(key, data, ttl)
  
  return data
})

/**
 * Cache middleware for API routes
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl?: number
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args)
    
    // Try cache first
    const cached = await CacheService.get(key)
    if (cached) return cached

    // Execute function
    const result = await fn(...args)
    
    // Cache result
    await CacheService.set(key, result, ttl)
    
    return result
  }) as T
}

/**
 * Preload cache for critical data
 */
export async function preloadCache(): Promise<void> {
  // Preload frequently accessed data
  const preloadTasks: Promise<void>[] = [
    // Add your preload tasks here
    // Example: CacheService.set(CACHE_KEYS.CATEGORIES, await fetchCategories())
  ]

  await Promise.allSettled(preloadTasks)
}

// Cleanup expired memory cache entries every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    memoryCacheService.cleanup()
  }, 5 * 60 * 1000)
}
