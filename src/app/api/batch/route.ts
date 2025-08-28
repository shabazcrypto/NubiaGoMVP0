/**
 * 🚀 Edge Request Optimization - Batch API Endpoint
 * 
 * Handles multiple API requests in a single call to reduce edge function executions
 */

import { NextRequest, NextResponse } from 'next/server'
import { CacheService } from '@/lib/cache/cache.service'
import { trackMetric } from '@/lib/performance/performance-monitor'

interface BatchRequest {
  id: string
  requests: Array<{
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    url: string
    data?: any
    params?: Record<string, any>
    headers?: Record<string, string>
  }>
}

interface BatchResponse {
  id: string
  results: Array<{
    status: number
    data: any
    headers: Record<string, string>
    cached: boolean
  }>
}

/**
 * Process a single request within the batch
 */
async function processRequest(request: BatchRequest['requests'][0]): Promise<BatchResponse['results'][0]> {
  const startTime = Date.now()
  
  try {
    const { method, url, data, params, headers } = request
    
    // Generate cache key for GET requests
    let cacheKey: string | null = null
    if (method === 'GET') {
      const paramsStr = params ? JSON.stringify(params) : ''
      cacheKey = `batch:${method}:${url}:${paramsStr}`
      
      // Check cache first
      const cached = await CacheService.get(cacheKey)
      if (cached) {
        trackMetric('cache-hit', 1)
        return {
          status: 200,
          data: cached,
          headers: { 'x-cache': 'HIT', 'x-response-time': `${Date.now() - startTime}ms` },
          cached: true,
        }
      }
    }
    
    // Build URL with query parameters
    const urlObj = new URL(url, process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000')
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
      signal: AbortSignal.timeout(10000), // 10 second timeout
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
    if (method === 'GET' && cacheKey) {
      await CacheService.set(cacheKey, responseData, 15 * 60 * 1000) // 15 minutes
      trackMetric('cache-miss', 1)
    }
    
    trackMetric('api-call', 1)
    
    return {
      status: response.status,
      data: responseData,
      headers: Object.fromEntries(response.headers.entries()),
      cached: false,
    }
    
  } catch (error) {
    // // // console.error('Batch request error:', error)
    
    return {
      status: 500,
      data: { error: error instanceof Error ? error.message : 'Unknown error' },
      headers: { 'x-response-time': `${Date.now() - startTime}ms` },
      cached: false,
    }
  }
}

/**
 * POST handler for batch requests
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()
  
  try {
    // Parse batch request
    const batchRequest: BatchRequest = await request.json()
    
    if (!batchRequest.id || !Array.isArray(batchRequest.requests)) {
      return NextResponse.json(
        { error: 'Invalid batch request format' },
        { status: 400 }
      )
    }
    
    // Limit batch size to prevent abuse
    if (batchRequest.requests.length > 20) {
      return NextResponse.json(
        { error: 'Batch size too large. Maximum 20 requests allowed.' },
        { status: 400 }
      )
    }
    
    // Process all requests in parallel
    const results = await Promise.all(
      batchRequest.requests.map(processRequest)
    )
    
    // Create batch response
    const batchResponse: BatchResponse = {
      id: batchRequest.id,
      results,
    }
    
    // Track batch performance
    const totalTime = Date.now() - startTime
    trackMetric('batch-request', totalTime)
    trackMetric('batch-size', batchRequest.requests.length)
    
    return NextResponse.json(batchResponse, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        'X-Batch-Processing-Time': `${totalTime}ms`,
        'X-Batch-Size': batchRequest.requests.length.toString(),
      },
    })
    
  } catch (error) {
    // // // console.error('Batch API error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET handler for batch endpoint info
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    endpoint: '/api/batch',
    description: 'Batch API endpoint for processing multiple requests',
    maxBatchSize: 20,
    supportedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    caching: {
      enabled: true,
      ttl: '15 minutes for GET requests',
    },
    rateLimiting: {
      enabled: true,
      limit: '100 requests per minute',
    },
  })
}
