import { NextRequest, NextResponse } from 'next/server'
import { wishlistService } from '@/lib/services/wishlist.service'
import { z } from 'zod'

const addToWishlistSchema = z.object({
  productId: z.string().min(1, 'Product ID is required')
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const wishlist = await wishlistService.getWishlist(userId)

    return NextResponse.json({
      success: true,
      data: wishlist
    })
  } catch (error: any) {
    console.error('Get wishlist error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch wishlist' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = addToWishlistSchema.parse(body)
    const { productId } = validatedData

    // TODO: Get userId from authentication
    const userId = body.userId || 'user-1' // Temporary

    const wishlist = await wishlistService.addToWishlist(userId, productId)

    return NextResponse.json({
      success: true,
      data: wishlist,
      message: 'Item added to wishlist successfully'
    })
  } catch (error: any) {
    console.error('Add to wishlist error:', error)
    
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
        error: error.message || 'Failed to add item to wishlist' 
      },
      { status: 400 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const productId = searchParams.get('productId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (productId) {
      // Remove specific item
      const wishlist = await wishlistService.removeFromWishlist(userId, productId)
      return NextResponse.json({
        success: true,
        data: wishlist,
        message: 'Item removed from wishlist successfully'
      })
    } else {
      // Clear entire wishlist
      const wishlist = await wishlistService.clearWishlist(userId)
      return NextResponse.json({
        success: true,
        data: wishlist,
        message: 'Wishlist cleared successfully'
      })
    }
  } catch (error: any) {
    console.error('Remove from wishlist error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to remove item from wishlist' 
      },
      { status: 500 }
    )
  }
} 