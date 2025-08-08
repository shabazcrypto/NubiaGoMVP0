import { NextRequest, NextResponse } from 'next/server'
import { productService } from '@/lib/services/product.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')
    const subcategory = searchParams.get('subcategory')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured') === 'true'

    let result

    if (featured) {
      const products = await productService.getFeaturedProducts(limit)
      result = {
        products,
        total: products.length,
        hasMore: false
      }
    } else if (subcategory) {
      result = await productService.getProductsBySubcategory(subcategory, page, limit)
    } else if (category) {
      result = await productService.getProductsByCategory(category, page, limit)
    } else if (search) {
      const products = await productService.searchProducts(search)
      result = {
        products,
        total: products.length,
        hasMore: false
      }
    } else {
      result = await productService.getAllProducts(page, limit)
    }

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch products' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const product = await productService.createProduct(body)

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product created successfully'
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create product' 
      },
      { status: 400 }
    )
  }
} 