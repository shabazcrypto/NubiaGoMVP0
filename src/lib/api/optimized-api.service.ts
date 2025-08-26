/**
 * 🚀 Edge Request Optimization - Optimized API Service
 * 
 * Features:
 * - Request deduplication
 * - Request batching
 * - Intelligent caching
 * - Retry logic with exponential backoff
 * - Request queuing
 */

import { CacheService, CACHE_KEYS, generateCacheKey } from '../cache/cache.service'

// Request deduplication map
const pendingRequests = new Map<string, Promise<any>>()

// Request queue for batching
const requestQueue = new Map<string, Array<{ resolve: (value: any) => void; reject: (error: any) => void }>>()

// Configuration
const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  TIMEOUT: 10000, // 10 seconds
  MAX_RETRIES: 3,
  BATCH_DELAY: 50, // 50ms delay for batching
  CACHE_TTL: 15 * 60 * 1000, // 15 minutes
} as const

// Request types
export interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  url: string
  data?: any
  params?: Record<string, any>
  headers?: Record<string, string>
  cache?: boolean
  ttl?: number
  retry?: boolean
}

export interface BatchRequest {
  id: string
  requests: ApiRequest[]
}

export interface ApiResponse<T = any> {
  data: T
  status: number
  headers: Record<string, string>
  cached: boolean
}

/**
 * Generate request key for deduplication
 */
function generateRequestKey(request: ApiRequest): string {
  const { method, url, data, params } = request
  const paramsStr = params ? JSON.stringify(params) : ''
  const dataStr = data ? JSON.stringify(data) : ''
  return `${method}:${url}:${paramsStr}:${dataStr}`
}

/**
 * Generate cache key for API response
 */
function generateApiCacheKey(request: ApiRequest): string {
  const { method, url, params } = request
  const paramsStr = params ? JSON.stringify(params) : ''
  return `api:${method}:${url}:${paramsStr}`
}

/**
 * Retry logic with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = API_CONFIG.MAX_RETRIES
): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        throw lastError
      }

      // Exponential backoff: 2^attempt * 1000ms
      const delay = Math.pow(2, attempt) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

/**
 * Make a single API request with caching and retry logic
 */
async function makeRequest<T>(request: ApiRequest): Promise<ApiResponse<T>> {
  const requestKey = generateRequestKey(request)
  const cacheKey = generateApiCacheKey(request)

  // Check if request is already pending (deduplication)
  if (pendingRequests.has(requestKey)) {
    const result = await pendingRequests.get(requestKey)!
    return { ...result, cached: false }
  }

  // Check cache for GET requests
  if (request.method === 'GET' && request.cache !== false) {
    const cached = await CacheService.get<T>(cacheKey)
    if (cached) {
      return {
        data: cached,
        status: 200,
        headers: { 'x-cache': 'HIT' },
        cached: true,
      }
    }
  }

  // Create the request promise
  const requestPromise = retryWithBackoff(async () => {
    const { method, url, data, params, headers } = request
    
    // Build URL with query parameters
    const urlObj = new URL(url, API_CONFIG.BASE_URL)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        urlObj.searchParams.append(key, String(value))
      })
    }

    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
    }

    // Add body for non-GET requests
    if (method !== 'GET' && data) {
      fetchOptions.body = JSON.stringify(data)
    }

    // Make the request
    const response = await fetch(urlObj.toString(), fetchOptions)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const responseData = await response.json()
    
    // Cache successful GET requests
    if (method === 'GET' && request.cache !== false) {
      await CacheService.set(cacheKey, responseData, request.ttl || API_CONFIG.CACHE_TTL)
    }

    return {
      data: responseData,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      cached: false,
    }
  })

  // Store the promise for deduplication
  pendingRequests.set(requestKey, requestPromise)

  try {
    const result = await requestPromise
    return result
  } finally {
    // Clean up the pending request
    pendingRequests.delete(requestKey)
  }
}

/**
 * Batch multiple requests into a single call
 */
async function batchRequests<T>(requests: ApiRequest[]): Promise<ApiResponse<T>[]> {
  const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // Create batch request
  const batchRequest: BatchRequest = {
    id: batchId,
    requests,
  }

  // Make batch API call
  const response = await makeRequest({
    method: 'POST',
    url: '/api/batch',
    data: batchRequest,
    cache: false,
  })

  return response.data
}

/**
 * Queue requests for batching
 */
function queueRequest<T>(request: ApiRequest): Promise<ApiResponse<T>> {
  const queueKey = `${request.method}:${request.url}`
  
  return new Promise((resolve, reject) => {
    if (!requestQueue.has(queueKey)) {
      requestQueue.set(queueKey, [])
      
      // Process queue after delay
      setTimeout(async () => {
        const queue = requestQueue.get(queueKey)!
        requestQueue.delete(queueKey)
        
        try {
          const results = await batchRequests([request])
          queue.forEach(({ resolve }) => resolve(results[0]))
        } catch (error) {
          queue.forEach(({ reject }) => reject(error))
        }
      }, API_CONFIG.BATCH_DELAY)
    }
    
    requestQueue.get(queueKey)!.push({ resolve, reject })
  })
}

/**
 * Main API service class
 */
export class OptimizedApiService {
  /**
   * Make a single API request
   */
  static async request<T>(request: ApiRequest): Promise<ApiResponse<T>> {
    // Use batching for GET requests to the same endpoint
    if (request.method === 'GET' && request.url.includes('/products')) {
      return queueRequest<T>(request)
    }
    
    return makeRequest<T>(request)
  }

  /**
   * Make multiple API requests with batching
   */
  static async batch<T>(requests: ApiRequest[]): Promise<ApiResponse<T>[]> {
    if (requests.length === 1) {
      const result = await this.request<T>(requests[0])
      return [result]
    }

    return batchRequests<T>(requests)
  }

  /**
   * GET request with caching
   */
  static async get<T>(
    url: string,
    params?: Record<string, any>,
    options?: Partial<ApiRequest>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'GET',
      url,
      params,
      cache: true,
      ...options,
    })
  }

  /**
   * POST request
   */
  static async post<T>(
    url: string,
    data?: any,
    options?: Partial<ApiRequest>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
      cache: false,
      ...options,
    })
  }

  /**
   * PUT request
   */
  static async put<T>(
    url: string,
    data?: any,
    options?: Partial<ApiRequest>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
      cache: false,
      ...options,
    })
  }

  /**
   * DELETE request
   */
  static async delete<T>(
    url: string,
    options?: Partial<ApiRequest>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      url,
      cache: false,
      ...options,
    })
  }

  /**
   * Preload critical data
   */
  static async preload(): Promise<void> {
    const preloadRequests = [
      this.get('/api/categories'),
      this.get('/api/products/featured'),
      this.get('/api/config'),
    ]

    await Promise.allSettled(preloadRequests)
  }

  /**
   * Invalidate cache for specific patterns
   */
  static async invalidateCache(pattern: string): Promise<void> {
    await CacheService.invalidatePattern(`api:${pattern}`)
  }

  /**
   * Get request statistics
   */
  static getStats(): {
    pendingRequests: number
    queuedRequests: number
    cacheStats: ReturnType<typeof CacheService.getStats>
  } {
    return {
      pendingRequests: pendingRequests.size,
      queuedRequests: Array.from(requestQueue.values()).reduce((sum, queue) => sum + queue.length, 0),
      cacheStats: CacheService.getStats(),
    }
  }
}

/**
 * Hook for React components
 */
export function useOptimizedApi() {
  return {
    get: OptimizedApiService.get,
    post: OptimizedApiService.post,
    put: OptimizedApiService.put,
    delete: OptimizedApiService.delete,
    batch: OptimizedApiService.batch,
    invalidateCache: OptimizedApiService.invalidateCache,
  }
}

/**
 * Preload critical API data on app startup
 */
if (typeof window !== 'undefined') {
  // Preload on client-side
  OptimizedApiService.preload()
}
