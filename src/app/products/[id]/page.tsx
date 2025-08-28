import React from 'react'
import Link from 'next/link'
import { ProductService } from '@/lib/services/product.service'
import { Product } from '@/types'
import ProductDetailClient from './ProductDetailClient'

// Generate static paths for all products
export async function generateStaticParams() {
  try {
    // Check if we're in build time
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      return [
        { id: 'prod-1' },
        { id: 'prod-2' },
        { id: 'prod-3' },
        { id: 'prod-4' },
        { id: 'prod-5' },
        { id: 'prod-6' }
      ]
    }

    const productService = new ProductService()
    const { products } = await productService.getAllProducts(1, 1000) // Get all products for static generation
    return products.map(product => ({
      id: product.id
    }))
  } catch (error) {
    console.warn('Failed to generate static params for products:', error)
    // Return some default paths for static export
    return [
      { id: 'prod-1' },
      { id: 'prod-2' },
      { id: 'prod-3' },
      { id: 'prod-4' },
      { id: 'prod-5' },
      { id: 'prod-6' }
    ]
  }
}

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  try {
    const { id: productId } = await params
    const productService = new ProductService()
    const product = await productService.getProduct(productId)
    
    if (!product) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
            <Link 
              href="/products" 
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Products
            </Link>
          </div>
        </div>
      )
    }

    return <ProductDetailClient product={product} />
  } catch (error) {
    console.error('Error loading product:', error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Product</h1>
          <p className="text-gray-600 mb-6">There was an error loading the product details.</p>
          <Link 
            href="/products" 
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Products
          </Link>
        </div>
      </div>
    )
  }
}