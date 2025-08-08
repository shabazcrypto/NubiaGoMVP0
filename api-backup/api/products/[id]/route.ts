import { NextRequest, NextResponse } from 'next/server'
import { productService } from '@/lib/services/product.service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await productService.getProduct(params.id)

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: product
    })
  } catch (error: any) {
    console.error('Get product error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch product' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // TODO: Add authentication check for suppliers
    // const user = await getCurrentUser()
    // if (!user || user.role !== 'supplier') {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 401 }
    //   )
    // }

    const product = await productService.updateProduct(params.id, body)

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    })
  } catch (error: any) {
    console.error('Update product error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update product' 
      },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add authentication check for suppliers
    // const user = await getCurrentUser()
    // if (!user || user.role !== 'supplier') {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 401 }
    //   )
    // }

    const success = await productService.deleteProduct(params.id)

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error: any) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to delete product' 
      },
      { status: 500 }
    )
  }
} 