"use client"

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, Grid3X3, List, Filter, Search, Heart, ShoppingCart, Star, Eye } from 'lucide-react'
import ProductSearch from '@/components/product/product-search'
import { ProductService } from '@/lib/services/product.service'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { Product } from '@/types'
import PullToRefresh from '@/components/mobile/PullToRefresh'



export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { targetRef, isFetching, resetFetching } = useInfiniteScroll({
    enabled: hasMore && !isLoading
  })
  
  // Initialize ProductService
  const productService = new ProductService()

  // Set initial category/subcategory from URL query parameter
  useEffect(() => {
    const category = searchParams.get('category')
    const subcategory = searchParams.get('subcategory')
    loadProducts(category, subcategory)
  }, [searchParams])

  useEffect(() => {
    if (isFetching && hasMore) {
      const category = searchParams.get('category')
      const subcategory = searchParams.get('subcategory')
      loadProducts(category, subcategory, true)
    }
  }, [isFetching, hasMore, searchParams])

  const loadProducts = async (category?: string | null, subcategory?: string | null, isLoadingMore: boolean = false) => {
    try {
      if (!isLoadingMore) {
        setIsLoading(true)
        setPage(1)
      }

      let result: { products: Product[]; total: number; hasMore: boolean }
      const limit = 12
      const currentPage = isLoadingMore ? page : 1
      
      if (subcategory) {
        result = await productService.getProductsBySubcategory(subcategory, currentPage, limit)
      } else if (category) {
        result = await productService.getProductsByCategory(category, currentPage, limit)
      } else {
        result = await productService.getAllProducts(currentPage, limit)
      }
      
      if (isLoadingMore) {
        setProducts(prev => [...prev, ...result.products])
        setPage(prev => prev + 1)
      } else {
        setProducts(result.products)
      }

      setHasMore(result.hasMore)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setIsLoading(false)
      resetFetching()
    }
  }

  // Remove handleProductClick as we're using Link components directly

  const handleToggleWishlist = (product: Product) => {
    // Mock wishlist toggle - just log for now
    console.log('Toggle wishlist for product:', product.id)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PullToRefresh onRefresh={() => loadProducts(searchParams.get('category'), searchParams.get('subcategory'))}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Back to Home</span>
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {searchParams.get('subcategory') 
                  ? `${searchParams.get('subcategory')} Products`
                  : searchParams.get('category') 
                    ? `${searchParams.get('category')} Products` 
                    : 'All Products'
                }
              </h1>
              <p className="text-gray-600">
                {searchParams.get('subcategory') 
                  ? `${products.length} products in ${searchParams.get('subcategory')}`
                  : searchParams.get('category') 
                    ? `${products.length} products in ${searchParams.get('category')}`
                    : `${products.length} products available`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full sm:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>

            {/* View Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Search Component */}
        {products.length > 0 ? (
          <>
            <ProductSearch
              products={products}

              onToggleWishlist={handleToggleWishlist}
            />
            {/* Infinite Scroll Target */}
            <div ref={targetRef} className="h-10 w-full flex items-center justify-center">
              {isFetching && hasMore && (
                <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchParams.get('category') 
                  ? `We couldn't find any products in the "${searchParams.get('category')}" category.`
                  : 'We couldn\'t find any products matching your criteria.'
                }
              </p>
              <Link 
                href="/products" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                View All Products
              </Link>
            </div>
          </div>
        )}
        </div>
      </PullToRefresh>
    </div>
  )
} 
