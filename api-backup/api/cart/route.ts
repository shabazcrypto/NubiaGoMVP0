import { NextRequest, NextResponse } from 'next/server'
import { cartService } from '@/lib/services/cart.service'
import { z } from 'zod'

const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1').optional()
})

const updateQuantitySchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().min(0, 'Quantity must be at least 0')
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

    const cart = await cartService.getCart(userId)

    return NextResponse.json({
      success: true,
      data: cart
    })
  } catch (error: any) {
    console.error('Get cart error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch cart' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = addToCartSchema.parse(body)
    const { productId, quantity = 1 } = validatedData

    // TODO: Get userId from authentication
    const userId = body.userId || 'user-1' // Temporary

    const cart = await cartService.addToCart(userId, productId, quantity)

    return NextResponse.json({
      success: true,
      data: cart,
      message: 'Item added to cart successfully'
    })
  } catch (error: any) {
    console.error('Add to cart error:', error)
    
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
        error: error.message || 'Failed to add item to cart' 
      },
      { status: 400 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = updateQuantitySchema.parse(body)
    const { productId, quantity } = validatedData

    // TODO: Get userId from authentication
    const userId = body.userId || 'user-1' // Temporary

    const cart = await cartService.updateCartItemQuantity(userId, productId, quantity)

    return NextResponse.json({
      success: true,
      data: cart,
      message: 'Cart updated successfully'
    })
  } catch (error: any) {
    console.error('Update cart error:', error)
    
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
        error: error.message || 'Failed to update cart' 
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
      const cart = await cartService.removeFromCart(userId, productId)
      return NextResponse.json({
        success: true,
        data: cart,
        message: 'Item removed from cart successfully'
      })
    } else {
      // Clear entire cart
      const cart = await cartService.clearCart(userId)
      return NextResponse.json({
        success: true,
        data: cart,
        message: 'Cart cleared successfully'
      })
    }
  } catch (error: any) {
    console.error('Remove from cart error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to remove item from cart' 
      },
      { status: 500 }
    )
  }
} 