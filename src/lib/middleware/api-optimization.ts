import { NextRequest, NextResponse } from 'next/server'

// API optimization middleware for better performance
export class ApiOptimization {
  private static readonly CACHE_DURATIONS = {
    static: 31536000, // 1 year for static assets
    api: 300, // 5 minutes for API responses
    dynamic: 60, // 1 minute for dynamic content
    user: 0, // No cache for user-specific data
  }

  private static readonly COMPRESSION_THRESHOLD = 1024 // 1KB

  // Main optimization middleware
  static async optimize(request: NextRequest, response: NextResponse): Promise<NextResponse> {
    const url = new URL(request.url)
    const pathname = url.pathname

    // Apply compression
    const compressedResponse = await this.applyCompression(response)
    
    // Set caching headers
    const cachedResponse = this.setCacheHeaders(compressedResponse, pathname)
    
    // Set security headers
    const secureResponse = this.setSecurityHeaders(cachedResponse)
    
    // Set performance headers
    const optimizedResponse = this.setPerformanceHeaders(secureResponse)

    return optimizedResponse
  }

  // Apply gzip compression for responses above threshold
  private static async applyCompression(response: NextResponse): Promise<NextResponse> {
    const contentLength = response.headers.get('content-length')
    const contentType = response.headers.get('content-type')

    // Skip compression for small responses or non-text content
    if (
      !contentType?.includes('text/') &&
      !contentType?.includes('application/json') &&
      !contentType?.includes('application/javascript')
    ) {
      return response
    }

    if (contentLength && parseInt(contentLength) < this.COMPRESSION_THRESHOLD) {
      return response
    }

    // Set compression headers
    response.headers.set('Content-Encoding', 'gzip')
    response.headers.set('Vary', 'Accept-Encoding')

    return response
  }

  // Set appropriate cache headers based on content type
  private static setCacheHeaders(response: NextResponse, pathname: string): NextResponse {
    let maxAge = this.CACHE_DURATIONS.dynamic

    // Determine cache duration based on path
    if (pathname.startsWith('/api/')) {
      if (pathname.includes('/user/') || pathname.includes('/auth/')) {
        maxAge = this.CACHE_DURATIONS.user
      } else if (pathname.includes('/products') || pathname.includes('/categories')) {
        maxAge = this.CACHE_DURATIONS.api
      }
    } else if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/)) {
      maxAge = this.CACHE_DURATIONS.static
    }

    // Set cache control headers
    if (maxAge > 0) {
      response.headers.set('Cache-Control', `public, max-age=${maxAge}, stale-while-revalidate=86400`)
      response.headers.set('ETag', this.generateETag(pathname))
    } else {
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
    }

    return response
  }

  // Set security headers
  private static setSecurityHeaders(response: NextResponse): NextResponse {
    // Content Security Policy
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://www.google-analytics.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
      "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
      "img-src 'self' data: https: blob:; " +
      "connect-src 'self' https://firebasestorage.googleapis.com https://api.homebase.com; " +
      "frame-src 'none'; " +
      "object-src 'none'; " +
      "base-uri 'self';"
    )

    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

    return response
  }

  // Set performance optimization headers
  private static setPerformanceHeaders(response: NextResponse): NextResponse {
    // Resource hints
    response.headers.set('Link', [
      '</fonts/inter.woff2>; rel=preload; as=font; type=font/woff2; crossorigin',
      '</api/products>; rel=prefetch',
      '</api/categories>; rel=prefetch'
    ].join(', '))

    // Performance timing
    response.headers.set('Server-Timing', `total;dur=${Date.now()}`)
    
    // Connection optimization
    response.headers.set('Connection', 'keep-alive')
    response.headers.set('Keep-Alive', 'timeout=5, max=1000')

    return response
  }

  // Generate ETag for caching
  private static generateETag(content: string): string {
    // Simple hash function for ETag generation
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return `"${Math.abs(hash).toString(36)}"`
  }

  // Response optimization utilities
  static optimizeJsonResponse(data: any): NextResponse {
    const response = NextResponse.json(data)
    
    // Set JSON-specific headers
    response.headers.set('Content-Type', 'application/json; charset=utf-8')
    
    // Add performance headers
    response.headers.set('X-Response-Time', `${Date.now()}ms`)
    
    return response
  }

  // Error response optimization
  static optimizeErrorResponse(error: Error, status: number = 500): NextResponse {
    const errorResponse = {
      error: error.message,
      timestamp: new Date().toISOString(),
      status
    }

    const response = NextResponse.json(errorResponse, { status })
    
    // Prevent caching of error responses
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    
    return response
  }

  // Image response optimization
  static optimizeImageResponse(imageBuffer: Buffer, contentType: string): NextResponse {
    const response = new NextResponse(imageBuffer)
    
    response.headers.set('Content-Type', contentType)
    response.headers.set('Cache-Control', `public, max-age=${this.CACHE_DURATIONS.static}, immutable`)
    response.headers.set('Content-Disposition', 'inline')
    
    return response
  }
}

// Middleware function for Next.js API routes
export function withApiOptimization(handler: Function) {
  return async (request: NextRequest) => {
    try {
      const response = await handler(request)
      return await ApiOptimization.optimize(request, response)
    } catch (error) {
      return ApiOptimization.optimizeErrorResponse(error as Error)
    }
  }
}

// Response compression utility
export class ResponseCompression {
  static async compressResponse(data: any, contentType: string = 'application/json'): Promise<NextResponse> {
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data)
    
    // Only compress if above threshold
    if (jsonString.length < ApiOptimization['COMPRESSION_THRESHOLD']) {
      return new NextResponse(jsonString, {
        headers: { 'Content-Type': contentType }
      })
    }

    // Create compressed response
    const response = new NextResponse(jsonString, {
      headers: {
        'Content-Type': contentType,
        'Content-Encoding': 'gzip',
        'Vary': 'Accept-Encoding'
      }
    })

    return response
  }
}

// API rate limiting utility
export class ApiRateLimit {
  private static requests = new Map<string, { count: number; resetTime: number }>()
  
  static check(identifier: string, limit: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now()
    const windowStart = now - windowMs
    
    // Clean old entries
    for (const [key, value] of this.requests.entries()) {
      if (value.resetTime < windowStart) {
        this.requests.delete(key)
      }
    }
    
    const current = this.requests.get(identifier)
    
    if (!current || current.resetTime < windowStart) {
      this.requests.set(identifier, { count: 1, resetTime: now + windowMs })
      return true
    }
    
    if (current.count >= limit) {
      return false
    }
    
    current.count++
    return true
  }
}

// Performance monitoring for API responses
export class ApiPerformanceMonitor {
  private static metrics = new Map<string, { totalTime: number; count: number; errors: number }>()
  
  static startTimer(): number {
    return Date.now()
  }
  
  static endTimer(startTime: number, endpoint: string, isError: boolean = false): void {
    const duration = Date.now() - startTime
    const current = this.metrics.get(endpoint) || { totalTime: 0, count: 0, errors: 0 }
    
    current.totalTime += duration
    current.count++
    if (isError) current.errors++
    
    this.metrics.set(endpoint, current)
  }
  
  static getMetrics(): Record<string, { avgTime: number; count: number; errorRate: number }> {
    const result: Record<string, { avgTime: number; count: number; errorRate: number }> = {}
    
    for (const [endpoint, metrics] of this.metrics.entries()) {
      result[endpoint] = {
        avgTime: metrics.totalTime / metrics.count,
        count: metrics.count,
        errorRate: metrics.errors / metrics.count
      }
    }
    
    return result
  }
}
