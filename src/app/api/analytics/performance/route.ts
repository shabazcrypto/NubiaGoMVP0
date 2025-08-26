/**
 * 🚀 Edge Request Optimization - Performance Analytics Endpoint
 * 
 * Collects and stores performance metrics for monitoring and optimization
 */

import { NextRequest, NextResponse } from 'next/server'
import { CacheService } from '@/lib/cache/cache.service'

interface PerformanceReport {
  type: 'periodic' | 'error' | 'pageview'
  timestamp: number
  url: string
  userAgent: string
  coreWebVitals: {
    lcp: number | null
    fid: number | null
    cls: number | null
    ttfb: number | null
    fcp: number | null
  }
  metrics: {
    edgeRequests: number
    cacheHits: number
    cacheMisses: number
    apiCalls: number
    staticAssets: number
    cacheHitRate: number
  }
  errors: Array<{
    message: string
    stack?: string
    timestamp: number
    url: string
    userAgent: string
  }>
  marks: Record<string, number>
}

/**
 * Store performance metrics in cache for analysis
 */
async function storeMetrics(report: PerformanceReport): Promise<void> {
  const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const hour = new Date().getHours()
  
  // Store daily metrics
  const dailyKey = `analytics:daily:${date}`
  const dailyMetrics: any = await CacheService.get(dailyKey) || {
    date,
    totalReports: 0,
    totalErrors: 0,
    avgLcp: 0,
    avgFid: 0,
    avgCls: 0,
    avgTtfb: 0,
    avgFcp: 0,
    totalEdgeRequests: 0,
    totalCacheHits: 0,
    totalCacheMisses: 0,
    totalApiCalls: 0,
    totalStaticAssets: 0,
    reports: [],
  }
  
  // Update daily metrics
  dailyMetrics.totalReports++
  dailyMetrics.totalErrors += report.errors.length
  dailyMetrics.totalEdgeRequests += report.metrics.edgeRequests
  dailyMetrics.totalCacheHits += report.metrics.cacheHits
  dailyMetrics.totalCacheMisses += report.metrics.cacheMisses
  dailyMetrics.totalApiCalls += report.metrics.apiCalls
  dailyMetrics.totalStaticAssets += report.metrics.staticAssets
  
  // Update Core Web Vitals averages
  if (report.coreWebVitals.lcp) {
    dailyMetrics.avgLcp = (dailyMetrics.avgLcp * (dailyMetrics.totalReports - 1) + report.coreWebVitals.lcp) / dailyMetrics.totalReports
  }
  if (report.coreWebVitals.fid) {
    dailyMetrics.avgFid = (dailyMetrics.avgFid * (dailyMetrics.totalReports - 1) + report.coreWebVitals.fid) / dailyMetrics.totalReports
  }
  if (report.coreWebVitals.cls) {
    dailyMetrics.avgCls = (dailyMetrics.avgCls * (dailyMetrics.totalReports - 1) + report.coreWebVitals.cls) / dailyMetrics.totalReports
  }
  if (report.coreWebVitals.ttfb) {
    dailyMetrics.avgTtfb = (dailyMetrics.avgTtfb * (dailyMetrics.totalReports - 1) + report.coreWebVitals.ttfb) / dailyMetrics.totalReports
  }
  if (report.coreWebVitals.fcp) {
    dailyMetrics.avgFcp = (dailyMetrics.avgFcp * (dailyMetrics.totalReports - 1) + report.coreWebVitals.fcp) / dailyMetrics.totalReports
  }
  
  // Store last 100 reports
  dailyMetrics.reports.push({
    timestamp: report.timestamp,
    type: report.type,
    url: report.url,
    coreWebVitals: report.coreWebVitals,
    metrics: report.metrics,
    errorCount: report.errors.length,
  })
  
  if (dailyMetrics.reports.length > 100) {
    dailyMetrics.reports = dailyMetrics.reports.slice(-100)
  }
  
  await CacheService.set(dailyKey, dailyMetrics, 24 * 60 * 60 * 1000) // 24 hours
  
  // Store hourly metrics
  const hourlyKey = `analytics:hourly:${date}:${hour}`
  const hourlyMetrics: any = await CacheService.get(hourlyKey) || {
    date,
    hour,
    totalReports: 0,
    totalErrors: 0,
    totalEdgeRequests: 0,
    totalCacheHits: 0,
    totalCacheMisses: 0,
    totalApiCalls: 0,
    totalStaticAssets: 0,
  }
  
  hourlyMetrics.totalReports++
  hourlyMetrics.totalErrors += report.errors.length
  hourlyMetrics.totalEdgeRequests += report.metrics.edgeRequests
  hourlyMetrics.totalCacheHits += report.metrics.cacheHits
  hourlyMetrics.totalCacheMisses += report.metrics.cacheMisses
  hourlyMetrics.totalApiCalls += report.metrics.apiCalls
  hourlyMetrics.totalStaticAssets += report.metrics.staticAssets
  
  await CacheService.set(hourlyKey, hourlyMetrics, 24 * 60 * 60 * 1000) // 24 hours
  
  // Store errors separately for analysis
  if (report.errors.length > 0) {
    const errorsKey = `analytics:errors:${date}`
    const errors = await CacheService.get(errorsKey) || []
    
    errors.push(...report.errors.map(error => ({
      ...error,
      reportType: report.type,
    })))
    
    // Keep last 1000 errors
    if (errors.length > 1000) {
      errors.splice(0, errors.length - 1000)
    }
    
    await CacheService.set(errorsKey, errors, 7 * 24 * 60 * 60 * 1000) // 7 days
  }
}

/**
 * POST handler for performance reports
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const report: PerformanceReport = await request.json()
    
    // Validate report structure
    if (!report.timestamp || !report.url || !report.coreWebVitals) {
      return NextResponse.json(
        { error: 'Invalid performance report format' },
        { status: 400 }
      )
    }
    
    // Store metrics
    await storeMetrics(report)
    
    // Log critical issues
    if (report.errors.length > 0) {
      console.warn('Performance report contains errors:', report.errors.length)
    }
    
    // Check for performance regressions
    const { lcp, fid, cls } = report.coreWebVitals
    if (lcp && lcp > 4000) {
      console.warn('LCP performance issue detected:', lcp)
    }
    if (fid && fid > 100) {
      console.warn('FID performance issue detected:', fid)
    }
    if (cls && cls > 0.1) {
      console.warn('CLS performance issue detected:', cls)
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Performance analytics error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET handler for performance analytics dashboard
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const type = searchParams.get('type') || 'daily'
    
    let metrics: any = null
    
    if (type === 'daily') {
      const dailyKey = `analytics:daily:${date}`
      metrics = await CacheService.get(dailyKey)
    } else if (type === 'hourly') {
      const hour = searchParams.get('hour') || new Date().getHours().toString()
      const hourlyKey = `analytics:hourly:${date}:${hour}`
      metrics = await CacheService.get(hourlyKey)
    } else if (type === 'errors') {
      const errorsKey = `analytics:errors:${date}`
      metrics = await CacheService.get(errorsKey)
    }
    
    if (!metrics) {
      return NextResponse.json({ error: 'No metrics found for the specified date' }, { status: 404 })
    }
    
    return NextResponse.json({
      date,
      type,
      metrics,
      cacheHitRate: metrics.totalCacheHits / (metrics.totalCacheHits + metrics.totalCacheMisses) || 0,
    })
    
  } catch (error) {
    console.error('Performance analytics GET error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
