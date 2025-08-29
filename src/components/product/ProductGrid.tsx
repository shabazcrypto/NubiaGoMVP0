'use client'

import React from 'react'
import { ProductCard } from './ProductCard'
import { Skeleton } from '@/components/ui/skeleton'

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  images?: string[]
  category: string
  rating: number
  reviewCount: number
  discount?: number
  inStock: boolean
  isFeatured?: boolean
  isNew?: boolean
  isBestSeller?: boolean
  brand?: string
  tags: string[]
}

interface ProductGridProps {
  products: Product[]
  loading?: boolean
  error?: string
  emptyMessage?: string
  className?: string
  showQuickActions?: boolean
  showWishlist?: boolean
  onQuickView?: (product: Product) => void
}

const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => {
  return (
    <div className="mobile-grid">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Image skeleton */}
          <Skeleton className="aspect-square w-full" />
          
          {/* Content skeleton */}
          <div className="p-3 sm:p-4 space-y-3">
            {/* Brand */}
            <Skeleton className="h-3 w-16" />
            
            {/* Rating */}
            <div className="flex items-center gap-1">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-3 w-3 sm:h-4 sm:w-4" />
                ))}
              </div>
              <Skeleton className="h-3 w-8 ml-1" />
            </div>
            
            {/* Product name */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            
            {/* Price */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
          
          {/* Actions skeleton */}
          <div className="p-3 sm:p-4 pt-0">
            <div className="flex flex-col sm:flex-row gap-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-full sm:w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-12">
    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
      <svg
        className="w-12 h-12 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h2m0 0V6a2 2 0 012-2h2a2 2 0 012 2v1m0 0v2a2 2 0 002 2h2"
        />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
    <p className="text-gray-500 max-w-sm mx-auto">{message}</p>
  </div>
)

const ErrorState = ({ message }: { message: string }) => (
  <div className="text-center py-12">
    <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
      <svg
        className="w-12 h-12 text-red-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
    <p className="text-gray-500 max-w-sm mx-auto">{message}</p>
  </div>
)

export function ProductGrid({
  products,
  loading = false,
  error,
  emptyMessage = "Try adjusting your search or filters to find what you're looking for.",
  className = '',
  showQuickActions = true,
  showWishlist = true,
  onQuickView
}: ProductGridProps) {
  // Loading state
  if (loading) {
    return (
      <div className={`mobile-container ${className}`}>
        <ProductGridSkeleton />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={`mobile-container ${className}`}>
        <ErrorState message={error} />
      </div>
    )
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <div className={`mobile-container ${className}`}>
        <EmptyState message={emptyMessage} />
      </div>
    )
  }

  // Products grid
  return (
    <div className={`mobile-container ${className}`}>
      <div className="mobile-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            showQuickActions={showQuickActions}
            showWishlist={showWishlist}
            onQuickView={onQuickView}
          />
        ))}
      </div>
    </div>
  )
}

export default ProductGrid
