import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Star, Heart, ShoppingCart, Share2, Eye, Truck, Shield, CheckCircle, Minus, Plus, MessageCircle, ThumbsUp, ThumbsDown } from 'lucide-react'
import { ProductService } from '@/lib/services/product.service'
import { Product } from '@/types'
import EnhancedImage from '@/components/mobile/EnhancedImage'
import SwipeableGallery from '@/components/mobile/SwipeableGallery'

// Generate static paths for all products
export async function generateStaticParams() {
  try {
    // Check if we're in build time
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      console.log('Build time detected, returning default static params')
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

interface Review {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  title: string
  comment: string
  createdAt: Date
  helpful: number
  notHelpful: number
  verified: boolean
  images?: string[]
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const productId = params.id
  const productService = new ProductService()
  
  // Get product data from Firebase
  const product = await productService.getProduct(productId)
  
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Link 
            href="/products" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Back to Products</span>
          </Link>
        </div>
      </div>
    )
  }
  
  // Static state for demo
  const selectedImage = 0
  const quantity = 1
  const isWishlisted = false

  const mockReviews: Review[] = [
    {
      id: '1',
      userId: 'user1',
      userName: 'John Doe',
      rating: 5,
      title: 'Excellent sound quality!',
      comment: 'These headphones exceeded my expectations. The sound quality is amazing and the battery life is impressive. Very comfortable for long listening sessions.',
      createdAt: new Date('2024-01-20'),
      helpful: 12,
      notHelpful: 0,
      verified: true
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Jane Smith',
      rating: 4,
      title: 'Great headphones with minor issues',
      comment: 'Overall great product. Sound quality is excellent and the noise cancellation works well. The only downside is the ear cushions could be a bit softer.',
      createdAt: new Date('2024-01-18'),
      helpful: 8,
      notHelpful: 2,
      verified: true
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/products" 
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Back to Products</span>
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                  {product.rating} ({product.reviewCount} reviews)
                </span>
                <span>•</span>
                <span>{product.category}</span>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="mt-4 lg:mt-0 flex items-center space-x-2">
              <button className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors">
                <Share2 className="h-4 w-4 text-gray-600" />
              </button>
              <button className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors">
                <Heart className={`h-4 w-4 ${isWishlisted ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <SwipeableGallery
                images={product.images}
                alt={product.name}
                showThumbnails={true}
                showNavigation={true}
                autoPlay={false}
                className="aspect-square bg-white border border-gray-200 rounded-lg overflow-hidden"
              />
              
              {/* Discount Badge */}
              {product.originalPrice && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium z-10">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Price Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-bold text-gray-900">${product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-400 line-through">${product.originalPrice.toLocaleString()}</span>
                )}
              </div>
              
              {/* Stock Status */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  (product.stock ?? 0) > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${(product.stock ?? 0) > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  {(product.stock ?? 0) > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                </span>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 bg-gray-50 rounded-md">
                  <Truck className="h-5 w-5 text-primary-600 mx-auto mb-1" />
                  <div className="text-xs text-gray-600">Free Shipping</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-md">
                  <Shield className="h-5 w-5 text-primary-600 mx-auto mb-1" />
                  <div className="text-xs text-gray-600">2 Year Warranty</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-md">
                  <CheckCircle className="h-5 w-5 text-primary-600 mx-auto mb-1" />
                  <div className="text-xs text-gray-600">Premium Quality</div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center space-x-3">
                  <button className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-50 flex items-center justify-center transition-colors">
                    <Minus className="h-4 w-4 text-gray-600" />
                  </button>
                  <span className="w-12 text-center font-medium text-gray-900">{quantity}</span>
                  <button className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-50 flex items-center justify-center transition-colors">
                    <Plus className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-md font-medium transition-colors flex items-center justify-center">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </button>
                <button className="w-full bg-white border border-primary-600 text-primary-600 py-3 rounded-md font-medium hover:bg-primary-50 transition-colors flex items-center justify-center">
                  <Eye className="h-4 w-4 mr-2" />
                  Quick View
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Technical Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(product.specifications || {}).map(([key, value]) => (
              <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                <span className="font-medium text-gray-700">{key}</span>
                <span className="text-gray-600">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Customer Reviews</h2>
            <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 transition-colors">
              <MessageCircle className="h-4 w-4 mr-2" />
              Write Review
            </button>
          </div>
          
          <div className="space-y-4">
            {mockReviews.map((review) => (
              <div key={review.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {review.userName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{review.userName}</div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        {review.verified && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Verified</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{review.createdAt.toLocaleDateString()}</span>
                </div>
                
                <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                <p className="text-gray-600 text-sm mb-3">{review.comment}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <button className="flex items-center space-x-1 hover:text-primary-600 transition-colors">
                      <ThumbsUp className="h-3 w-3" />
                      <span>{review.helpful}</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-red-600 transition-colors">
                      <ThumbsDown className="h-3 w-3" />
                      <span>{review.notHelpful}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 