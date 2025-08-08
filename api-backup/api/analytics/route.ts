import { NextRequest, NextResponse } from 'next/server'
import { analyticsService } from '@/lib/services/analytics.service'
import { z } from 'zod'

const analyticsSchema = z.object({
  type: z.enum(['sales', 'users', 'products', 'conversion']),
  startDate: z.string().optional(),
  endDate: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'sales' | 'users' | 'products' | 'conversion'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Analytics type is required' },
        { status: 400 }
      )
    }

    let result

    switch (type) {
      case 'sales':
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
        const end = endDate ? new Date(endDate) : new Date()
        result = await analyticsService.getSalesAnalytics(start, end)
        break

      case 'users':
        result = await analyticsService.getUserAnalytics()
        break

      case 'products':
        result = await analyticsService.getProductAnalytics()
        break

      case 'conversion':
        result = await analyticsService.getConversionAnalytics()
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid analytics type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to get analytics' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = analyticsSchema.parse(body)
    const { type, startDate, endDate } = validatedData

    let result

    switch (type) {
      case 'sales':
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        const end = endDate ? new Date(endDate) : new Date()
        result = await analyticsService.getSalesAnalytics(start, end)
        break

      case 'users':
        result = await analyticsService.getUserAnalytics()
        break

      case 'products':
        result = await analyticsService.getProductAnalytics()
        break

      case 'conversion':
        result = await analyticsService.getConversionAnalytics()
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid analytics type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    console.error('Analytics error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to get analytics' 
      },
      { status: 500 }
    )
  }
} 