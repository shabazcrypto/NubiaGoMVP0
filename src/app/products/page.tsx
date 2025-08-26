/**
 * 🛡️ UI DESIGN PROTECTION NOTICE
 * 
 * This file contains UI elements that are PROTECTED from changes.
 * The current design is FROZEN and cannot be modified unless:
 * 1. User explicitly requests a specific change
 * 2. User confirms the change before implementation
 * 3. Change is documented in UI_DESIGN_PROTECTION.md
 * 
 * DO NOT MODIFY UI ELEMENTS WITHOUT EXPLICIT USER AUTHORIZATION
 * 
 * @ui-protected: true
 * @requires-user-approval: true
 * @last-approved: 2024-12-19
 */

"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, Grid3X3, List, Filter, Search, Heart, ShoppingCart as CartIcon, Star, Eye, X, ChevronDown, SlidersHorizontal, Shield, Truck } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { CURRENCY } from '@/lib/constants'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import SidebarCart from '@/components/cart/shopping-cart'
import { useCartStore } from '@/hooks/useCartStore'
import { ProductService } from '@/lib/services/product.service'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { Product } from '@/types'
import PullToRefresh from '@/components/mobile/PullToRefresh'
import Image from 'next/image'
import SSRSafeErrorBoundary from '@/components/ui/SSRSafeErrorBoundary'

// Error boundary wrapper component
function ProductsErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <SSRSafeErrorBoundary
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Products Page Error
            </h3>
            <p className="text-gray-600 mb-4">
              Something went wrong while loading the products. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      }
    >
      {children}
    </SSRSafeErrorBoundary>
  )
}

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('featured')
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 })
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [quickFilter, setQuickFilter] = useState<'all' | 'best' | 'new' | 'lowPrice' | 'highRating' | 'discount' | 'inStock'>('all')
  
  // Mobile optimization
  const isMobileView = searchParams.get('mobile') === 'true'
  const [isMobile, setIsMobile] = useState(false)
  // Cart store must be declared before any conditional returns to keep hook order stable
  const cart = useCartStore()
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  const { targetRef, isFetching, resetFetching } = useInfiniteScroll({
    enabled: hasMore && !isLoading
  })
  
  // Initialize ProductService
  const productService = new ProductService()

  // Set initial category/subcategory and quick filters from URL query parameter
  useEffect(() => {
    const category = searchParams.get('category')
    const subcategory = searchParams.get('subcategory')
    const q = searchParams.get('search') || searchParams.get('q')
    const quick = searchParams.get('quick') as typeof quickFilter | null
    const isSale = searchParams.get('sale')
    const isNew = searchParams.get('new')
    const isClearance = searchParams.get('clearance')
    if (q) setSearchQuery(q)
    if (quick && ['all','best','new','lowPrice','highRating','discount','inStock'].includes(quick)) {
      setQuickFilter(quick)
    } else if (isSale || isClearance) {
      setQuickFilter('discount')
    } else if (isNew) {
      setQuickFilter('new')
    }
    loadProducts(category, subcategory)
  }, [searchParams])

  useEffect(() => {
      if (isFetching && hasMore) {
      const category = searchParams.get('category')
      const subcategory = searchParams.get('subcategory')
        // Since we now load all products at once, do not fetch more on scroll
        // loadProducts(category, subcategory, true)
    }
  }, [isFetching, hasMore, searchParams])

  const loadProducts = async (category?: string | null, subcategory?: string | null, isLoadingMore: boolean = false) => {
    try {
      if (!isLoadingMore) {
        setIsLoading(true)
        setPage(1)
      }

      let result: { products: Product[]; total: number; hasMore: boolean }
      const limit = 50 // Reduced limit for faster loading
      const currentPage = isLoadingMore ? page : 1
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      )
      
      const fetchPromise = (async () => {
        if (subcategory) {
          return await productService.getProductsBySubcategory(subcategory, currentPage, limit)
        } else if (category) {
          return await productService.getProductsByCategory(category, currentPage, limit)
        } else {
          return await productService.getAllProducts(currentPage, limit)
        }
      })()
      
      result = await Promise.race([fetchPromise, timeoutPromise]) as any
      
      if (isLoadingMore) {
        setProducts(prev => [...prev, ...result.products])
        setPage(prev => prev + 1)
      } else {
        setProducts(result.products)
      }

      setHasMore(result.hasMore)
    } catch (error) {
      console.error('Error loading products:', error)
      // Set empty products array on error to show empty state
      if (!isLoadingMore) {
        setProducts([])
      }
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

  // Temu-inspired quick filter application (purely client-side)
  const getDisplayProducts = (): Product[] => {
    let list = [...products]
    // Lightweight client-side search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(p => (p.name || '').toLowerCase().includes(q))
    }
    switch (quickFilter) {
      case 'lowPrice':
        list.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case 'highRating':
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'discount':
        list.sort((a, b) => {
          const aDiscount = (a.originalPrice || a.price || 0) - (a.price || 0)
          const bDiscount = (b.originalPrice || b.price || 0) - (b.price || 0)
          return bDiscount - aDiscount
        })
        break
      case 'best':
        list.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
        break
      case 'inStock':
        list = list.filter(p => (p.stock || 0) > 0)
        break
      // 'new' can be proxied by rating/reviews if createdAt is unavailable
      case 'new':
      default:
        break
    }
    return list
  }

  // Category chip toggle
  const handleCategoryChip = (categoryId: string) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()))
    if (params.get('category') === categoryId) {
      params.delete('category')
    } else {
      params.set('category', categoryId)
    }
    const qs = params.toString()
    router.push(`/products${qs ? `?${qs}` : ''}`)
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
    <ProductsErrorBoundary>
      <PullToRefresh onRefresh={() => loadProducts(searchParams.get('category'), searchParams.get('subcategory'))}>
        <div className={`max-w-none mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-3 ${isMobile ? 'py-2' : 'py-6'}`}>
        {/* Header removed as requested */}

        {/* Quick filters row with search and category select */}
        <div className="mb-4 -mx-2 px-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap">
            {/* Recommended chips (as before) */}
            {[
              { key: 'all', label: 'Recommended' },
              { key: 'best', label: 'Best Sellers' },
              { key: 'new', label: 'New' },
              { key: 'highRating', label: 'Top Rated' },
              { key: 'discount', label: 'On Sale' },
              { key: 'lowPrice', label: 'Lowest Price' },
              { key: 'inStock', label: 'In Stock' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setQuickFilter(key as typeof quickFilter)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  quickFilter === (key as typeof quickFilter)
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}

            {/* Divider */}
            <span className="hidden sm:inline-block h-5 w-px bg-gray-200 mx-1" />

            {/* Search bar - pro container */}
            <div className="group/search relative">
              <div className="flex items-center rounded-2xl bg-white/90 supports-[backdrop-filter]:bg-white/70 backdrop-blur border border-gray-200/70 shadow-sm hover:shadow-md transition-shadow pl-3 pr-1 py-1.5 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, brands, categories..."
                  className="ml-2 w-48 sm:w-64 md:w-96 bg-transparent outline-none text-sm placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      searchInputRef.current?.focus()
                    }}
                    aria-label="Clear search"
                    className="ml-1 p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <span className="hidden sm:block mx-2 h-6 w-px bg-gray-200/80" />
                <button
                  onClick={() => searchInputRef.current?.focus()}
                  className="hidden sm:inline-flex items-center ml-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl px-3 py-1.5 shadow-sm"
                >
                  Search
                </button>
              </div>
              <div className="pointer-events-none absolute inset-x-2 -bottom-1 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent rounded-full" />
            </div>

            {/* Category select */}
            <div className="relative inline-block">
              <select
                value={searchParams.get('category') || ''}
                onChange={(e) => handleCategoryChip(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-full px-3 py-1.5 pr-8 text-sm text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <option value="">Filter By Categories</option>
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Toolbar removed as requested */}

        {/* Conversion-Optimized Products Section with right-side cart */}
        {products.length > 0 ? (
          <div className="space-y-6">
            {/* Trust Signals Bar removed as requested */}

            {/* Special Offers Banner */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-1">🔥 Limited Time Offer</h3>
                  <p className="text-primary-100">{`Free shipping on orders above ${formatPrice(50, CURRENCY.CODE)} • Use code: FREESHIP`}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">24:59:12</div>
                  <div className="text-xs text-primary-200">Time left</div>
                </div>
              </div>
            </div>

            {/* Enhanced Products Grid with sticky cart on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className={`${viewMode === 'grid' ? 'lg:col-span-10' : 'lg:col-span-10'} grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' : 'grid-cols-1'} gap-5`}>
            {getDisplayProducts().map((product, index) => (
                <div key={product.id} className="group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  {/* Product Image with Badges */}
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <Image
                      src={product.imageUrl || product.images?.[0] || product.thumbnailUrl || '/product-placeholder.jpg'}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      priority={index < 8}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onError={(e) => {
                        // Fallback to a default image if the main image fails to load
                        const target = e.target as HTMLImageElement
                        target.src = '/product-placeholder.jpg'
                      }}
                    />
                    
                    {/* Discount Badge */}
                    {product.originalPrice && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold z-10">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </div>
                    )}
                    
                    {/* Trending Badge */}
                    {index < 3 && (
                      <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">
                        🔥 Trending
                      </div>
                    )}
                    
                    {/* Quick Actions Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
                      <Link href={`/products/${product.id}`} className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-lg">
                        <Eye className="h-5 w-5 text-gray-700" />
                      </Link>
                      <button className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-lg">
                        <Heart className="h-5 w-5 text-gray-700" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Enhanced Product Info */}
                  <div className="p-4 space-y-3">
                    {/* Product Name */}
                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors min-h-[48px]">
                      {product.name}
                    </h3>
                    
                    {/* Rating & Reviews */}
                    <div className="flex items-center space-x-2 min-h-[20px]">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating || 4.5)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {(product.rating || 4.5).toFixed(1)} ({product.reviewCount || Math.floor(Math.random() * 200) + 50} reviews)
                      </span>
                    </div>
                    
                    {/* Price Section */}
                    <div className="space-y-1 min-h-[44px]">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-gray-900">{formatPrice(product.price, (product as any).currency || CURRENCY.CODE)}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">{formatPrice(product.originalPrice, (product as any).currency || CURRENCY.CODE)}</span>
                        )}
                      </div>
                      {product.originalPrice && (
                        <div className="text-sm text-green-600 font-medium">
                          {`You save ${formatPrice((product.originalPrice - product.price), (product as any).currency || CURRENCY.CODE)}`}
                        </div>
                      )}
                    </div>
                    
                    {/* Delivery Info removed to keep card compact */}
                    
                    {/* Stock Status */}
                    <div className="flex items-center justify-between text-sm min-h-[20px]">
                      <span className={`font-medium ${
                        (product.stock || 10) > 5 ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {(product.stock || 10) > 5 ? '✓ In Stock' : `⚡ Only ${product.stock || 2} left!`}
                      </span>
                      <span className="text-gray-500">{Math.floor(Math.random() * 50) + 10} sold today</span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-2">
                      <Link 
                        href={`/products/${product.id}`}
                        className="flex-1 bg-primary-600 text-white py-2.5 px-4 rounded-lg font-medium text-center hover:bg-primary-700 transition-colors"
                      >
                        Buy Now
                      </Link>
                      <button 
                        onClick={() => cart.addItem(product as any)}
                        className="w-11 h-11 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <CartIcon className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              </div>
              <div className="hidden lg:block lg:col-span-2 xl:col-span-2">
                <div className="sticky top-6">
                  <SidebarCart
                    items={cart.items as any}
                    onUpdateQuantity={(id, q) => cart.updateQuantity(id as any, q)}
                    onRemoveItem={(id) => cart.removeItem(id as any)}
                    onClearCart={() => cart.clearCart()}
                    onCheckout={() => window.location.href = '/checkout'}
                    className="cart-compact-v2"
                  />
                </div>
              </div>
            </div>
            
            {/* Why Choose Us section removed as requested */}

            {/* Infinite Scroll Target */}
            <div ref={targetRef} className="h-10 w-full flex items-center justify-center">
              {isFetching && hasMore && (
                <div className="w-8 h-8 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
              )}
            </div>
          </div>
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
                className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                View All Products
              </Link>
            </div>
          </div>
        )}
        </div>
      </PullToRefresh>
    </ProductsErrorBoundary>
  )
} 
