'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { Search, Filter, SortAsc, SortDesc, Star, ShoppingCart, Heart, Clock, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { CartService } from '@/lib/services/cart.service'
import { WishlistService } from '@/lib/services/wishlist.service'
import { useAuth } from '@/hooks/useAuth'
import { useSearchHistoryStore } from '@/store/search-history'
import { SearchSuggestions } from './search-suggestions'
import { Product } from '@/types'

interface ProductSearchProps {
  products: Product[]
  onAddToCart?: (product: Product) => void
  onToggleWishlist?: (product: Product) => void
}

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'rating-desc' | 'newest'

const ProductSearch = React.memo(function ProductSearch({ 
  products, 
  onToggleWishlist 
}: ProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const { addToHistory } = useSearchHistoryStore()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [minRating, setMinRating] = useState<number>(0)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set())
  
  // Initialize services and auth
  const { user } = useAuth()
  const cartService = new CartService()
  const wishlistService = new WishlistService()

  // Fetch user's wishlist items
  useEffect(() => {
    const fetchWishlistItems = async () => {
      if (!user?.uid) {
        setWishlistItems(new Set())
        return
      }

      try {
        const wishlist = await wishlistService.getWishlist(user.uid)
        const itemIds = new Set(wishlist.items.map(item => item.productId))
        setWishlistItems(itemIds)
      } catch (error) {
        console.error('Error fetching wishlist items:', error)
      }
    }

    fetchWishlistItems()
  }, [user?.uid])

  // Get unique categories (memoized)
  const categories = useMemo(() => 
    ['all', ...Array.from(new Set(products.map(p => p.category)))], 
    [products]
  )

  // Filter and sort products (memoized)
  const filteredProducts = useMemo(() => products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
      const matchesRating = product.rating >= minRating
      
      return matchesSearch && matchesCategory && matchesPrice && matchesRating
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'rating-desc':
          return b.rating - a.rating
        case 'newest':
        default:
          return 0 // Assuming products are already sorted by newest
      }
    }), [products, searchQuery, selectedCategory, priceRange, minRating, sortBy])

  const handleAddToCart = useCallback(async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation()
    
    if (!user?.uid) {
      alert('Please sign in to add items to cart')
      return
    }
    
    try {
      await cartService.addToCart(user.uid, product.id, 1)
      alert(`${product.name} has been added to your cart`)
    } catch (error: any) {
      console.error('Error adding to cart:', error)
      alert('Failed to add item to cart')
    }
  }, [user?.uid, cartService])

  const handleToggleWishlist = useCallback(async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation()
    
    if (!user?.uid) {
      alert('Please sign in to manage wishlist')
      return
    }
    
    try {
      const isInWishlist = wishlistItems.has(product.id)
      
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(user.uid, product.id)
        setWishlistItems(prev => {
          const newSet = new Set(prev)
          newSet.delete(product.id)
          return newSet
        })
        alert(`${product.name} has been removed from your wishlist`)
      } else {
        await wishlistService.addToWishlist(user.uid, product.id)
        setWishlistItems(prev => new Set([...prev, product.id]))
        alert(`${product.name} has been added to your wishlist`)
      }
      
      onToggleWishlist?.(product)
    } catch (error: any) {
      console.error('Error toggling wishlist:', error)
      alert('Failed to update wishlist')
    }
  }, [user?.uid, wishlistItems, wishlistService, onToggleWishlist])

  return (
    <div className="w-full">
      {/* Search and Filter Header */}
      <div className="mb-6">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <div className="relative">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-10 pr-4 py-2 w-full"
            />
            <SearchSuggestions
              query={searchQuery}
              onSelect={(query) => {
                setSearchQuery(query)
                addToHistory({
                  query,
                  category: selectedCategory !== 'all' ? selectedCategory : undefined,
                  filters: {
                    priceRange,
                    minRating,
                    sortBy
                  }
                })
              }}
              onClear={() => setSearchQuery('')}
              className="max-h-96 overflow-y-auto"
            />
          </div>
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
            size="sm"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="price-asc">Price Low to High</option>
            <option value="price-desc">Price High to Low</option>
            <option value="rating-desc">Highest Rated</option>
          </select>

          <span className="text-sm text-gray-600">
            {filteredProducts.length} products found
          </span>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-full text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full text-sm"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value={0}>Any Rating</option>
                  <option value={1}>1+ Stars</option>
                  <option value={2}>2+ Stars</option>
                  <option value={3}>3+ Stars</option>
                  <option value={4}>4+ Stars</option>
                  <option value={5}>5 Stars</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                    setPriceRange([0, 1000])
                    setMinRating(0)
                  }}
                  className="w-full"
                  size="sm"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer group block"
          >
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden rounded-t-lg">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/fallback-product.jpg'
                }}
              />
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </div>
              )}
              <button
                onClick={(e) => handleToggleWishlist(e, product)}
                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
              >
                <Heart 
                  className={`h-3.5 w-3.5 ${wishlistItems.has(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                />
              </button>
            </div>

            {/* Product Info */}
            <div className="p-3">
              <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 text-sm">
                {product.name}
              </h3>
              
              {/* Rating */}
              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-1">
                  ({product.reviewCount})
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-gray-500 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-3.5 w-3.5 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">{product.rating}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
                <span className="text-xs text-gray-500">{product.reviewCount} reviews</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={(e) => handleAddToCart(e, product)}
                  disabled={product.stock <= 0}
                  className="flex-1"
                  size="sm"
                >
                  <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                  {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* No Results */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <Search className="h-8 w-8 mx-auto" />
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-500 text-sm">
            Try adjusting your search criteria or filters
          </p>
        </div>
      )}
    </div>
  )
})

export default ProductSearch 