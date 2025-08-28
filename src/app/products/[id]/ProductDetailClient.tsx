'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Star, Heart, ShoppingCart, Share2, Eye, Truck, Shield, CheckCircle, Minus, Plus, MessageCircle, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Product } from '@/types'
import EnhancedImage from '@/components/mobile/EnhancedImage'
import SwipeableGallery from '@/components/mobile/SwipeableGallery'
import { useCartStore } from '@/hooks/useCartStore'
import { useToast } from '@/components/ui/toast'

interface Review {
  id: string
  userId: string
  userName: string
  rating: number
  comment: string
  date: string
  verified: boolean
  helpful: number
  notHelpful: number
}

interface ProductDetailClientProps {
  product: Product
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { addItem, items } = useCartStore()
  const { success, error } = useToast()

  // Mock reviews data
  const reviews: Review[] = [
    {
      id: '1',
      userId: 'user1',
      userName: 'Sarah Johnson',
      rating: 5,
      comment: 'Excellent quality and fast shipping. Highly recommend!',
      date: '2024-01-15',
      verified: true,
      helpful: 12,
      notHelpful: 1
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Mike Chen',
      rating: 4,
      comment: 'Good product, exactly as described. Will buy again.',
      date: '2024-01-10',
      verified: true,
      helpful: 8,
      notHelpful: 0
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Emma Wilson',
      rating: 5,
      comment: 'Amazing! Better than expected. Great value for money.',
      date: '2024-01-08',
      verified: false,
      helpful: 15,
      notHelpful: 2
    }
  ]

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  const totalReviews = reviews.length

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= (product.stock || 99)) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    try {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '/placeholder-product.jpg',
        category: product.category,
        quantity: quantity
      })
      success(`Added ${quantity} ${product.name} to cart`)
    } catch (err) {
      error('Failed to add item to cart')
    }
  }

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted)
    if (!isWishlisted) {
      success('Added to wishlist')
    } else {
      success('Removed from wishlist')
    }
  }

  const cartItemCount = items.find(item => item.id === product.id)?.quantity || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/products" 
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Products
            </Link>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Eye className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {product.images && product.images.length > 1 ? (
              <SwipeableGallery images={product.images} />
            ) : (
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <EnhancedImage
                  src={product.images?.[0] || '/placeholder-product.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(averageRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {averageRating.toFixed(1)} ({totalReviews} reviews)
                  </span>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Price */}
            <div className="border-t border-b py-4">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xl text-gray-500 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-sm text-green-600 mt-1">Free shipping on orders over $50</p>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 text-center min-w-[60px] border-x border-gray-300">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= (product.stock || 99)}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  {product.stock || 99} available
                </span>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Add to Cart</span>
                  {cartItemCount > 0 && (
                    <span className="bg-blue-800 text-xs px-2 py-1 rounded-full">
                      {cartItemCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={handleWishlistToggle}
                  className={`px-4 py-3 rounded-md border transition-colors ${
                    isWishlisted
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              {cartItemCount > 0 && (
                <Link
                  href="/cart"
                  className="block w-full bg-green-600 text-white text-center px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
                >
                  View Cart ({cartItemCount} items)
                </Link>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Truck className="h-5 w-5 text-green-600" />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Quality Guaranteed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Specifications */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Specifications</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Category</span>
                <span className="font-medium">{product.category}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Brand</span>
                <span className="font-medium">{product.brand || 'NubiaGo'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">SKU</span>
                <span className="font-medium">{product.sku || product.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Weight</span>
                <span className="font-medium">{product.weight || '1.2'} kg</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Dimensions</span>
                <span className="font-medium">{product.dimensions || '25 x 15 x 10'} cm</span>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Customer Reviews</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Write a Review
              </button>
            </div>
            
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{review.userName}</span>
                      {review.verified && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{review.date}</span>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{review.comment}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <button className="flex items-center space-x-1 hover:text-gray-700">
                      <ThumbsUp className="h-3 w-3" />
                      <span>Helpful ({review.helpful})</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-gray-700">
                      <ThumbsDown className="h-3 w-3" />
                      <span>Not Helpful ({review.notHelpful})</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-gray-700">
                      <MessageCircle className="h-3 w-3" />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
