import { NextRequest, NextResponse } from 'next/server'
import { searchService } from '@/lib/services/search.service'
import { analyticsService } from '@/lib/services/analytics.service'
import { z } from 'zod'

const searchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  priceRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0)
  }).optional(),
  rating: z.number().min(0).max(5).optional(),
  brand: z.array(z.string()).optional(),
  availability: z.enum(['in-stock', 'out-of-stock']).optional(),
  sortBy: z.enum(['price-asc', 'price-desc', 'name-asc', 'name-desc', 'rating', 'newest']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const rating = searchParams.get('rating')
    const brand = searchParams.get('brand')
    const availability = searchParams.get('availability') as 'in-stock' | 'out-of-stock'
    const sortBy = searchParams.get('sortBy') as any
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build filters object
    const filters: any = {}
    if (category) filters.category = category
    if (minPrice && maxPrice) {
      filters.priceRange = {
        min: parseFloat(minPrice),
        max: parseFloat(maxPrice)
      }
    }
    if (rating) filters.rating = parseFloat(rating)
    if (brand) filters.brand = brand.split(',')
    if (availability) filters.availability = availability
    if (sortBy) filters.sortBy = sortBy

    // Perform search
    const result = await searchService.searchProducts(query, filters)

    // Track search analytics
    await analyticsService.trackSearch(query, result.total)

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to perform search' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = searchSchema.parse(body)
    const { query, ...filters } = validatedData

    // Perform search
    const result = await searchService.searchProducts(query || '', filters)

    // Track search analytics
    await analyticsService.trackSearch(query || '', result.total)

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    console.error('Search error:', error)
    
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
        error: error.message || 'Failed to perform search' 
      },
      { status: 500 }
    )
  }
} 