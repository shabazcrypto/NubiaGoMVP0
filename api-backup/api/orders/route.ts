import { NextRequest, NextResponse } from 'next/server'
import { orderService } from '@/lib/services/order.service'
import { z } from 'zod'

const createOrderSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0),
    product: z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      price: z.number().min(0),
      imageUrl: z.string(),
      images: z.array(z.string()),
      thumbnailUrl: z.string(),
      category: z.string(),
      subcategory: z.string().optional(),
      brand: z.string().optional(),
      sku: z.string(),
      stock: z.number(),
      rating: z.number(),
      reviewCount: z.number(),
      tags: z.array(z.string()),
      specifications: z.record(z.any()).optional(),
      isActive: z.boolean(),
      isFeatured: z.boolean(),
      createdAt: z.date(),
      updatedAt: z.date()
    })
  })),
  shippingAddress: z.object({
    firstName: z.string(),
    lastName: z.string(),
    address1: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
    phone: z.string()
  }),
  billingAddress: z.object({
    firstName: z.string(),
    lastName: z.string(),
    address1: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
    phone: z.string()
  }),
  paymentMethod: z.string(),
  shippingMethod: z.string(),
  notes: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const result = await orderService.getUserOrders(userId, page, limit)

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch orders' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = createOrderSchema.parse(body)

    const order = await orderService.createOrder(validatedData)

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order created successfully'
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create order error:', error)
    
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
        error: error.message || 'Failed to create order' 
      },
      { status: 400 }
    )
  }
} 