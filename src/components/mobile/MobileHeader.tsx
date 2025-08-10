'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, ShoppingCart, Menu, User, Heart, Bell } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { CartService } from '@/lib/services/cart.service'
import { WishlistService } from '@/lib/services/wishlist.service'
import { useEffect } from 'react'
import MobileSearch from './MobileSearch'
import { Product } from '@/types'

interface MobileHeaderProps {
  onMenuToggle?: () => void
  onSearch?: (query: string) => void
}

export default function MobileHeader({ onMenuToggle, onSearch }: MobileHeaderProps) {
  const [cartItemCount, setCartItemCount] = useState(0)
  const [wishlistItemCount, setWishlistItemCount] = useState(0)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)

  const { user } = useAuth()
  const cartService = new CartService()
  const wishlistService = new WishlistService()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        if (user?.uid) {
          const [cart, wishlist] = await Promise.all([
            cartService.getCart(user.uid),
            wishlistService.getWishlist(user.uid)
          ])
          setCartItemCount(cart.items.length)
          setWishlistItemCount(wishlist.items.length)
        }
      } catch (error) {
        console.error('Error fetching counts:', error)
      }
    }

    fetchCounts()
  }, [user?.uid])

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen)
  }

  const handleSearch = (query: string) => {
    onSearch?.(query)
  }

  const handleProductSelect = (product: Product) => {
    // Navigate to product page
    window.location.href = `/products/${product.id}`
  }

  if (isSearchOpen) {
    return (
      <MobileSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={handleSearch}
        onProductSelect={handleProductSelect}
      />
    )
  }

  return (
    <header className="mobile-header sticky top-0 z-40 bg-white border-b border-gray-200 safe-area-top">
      <div className="px-4 py-3">
        {/* Top Row - Logo and Actions */}
        <div className="flex items-center justify-between mb-3">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-xl font-bold text-gray-900">NubiaGo</span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="h-5 w-5 text-gray-600" />
              {/* Notification badge would go here */}
            </button>

            {/* User Menu */}
            <Link
              href={user ? '/customer/profile' : '/login'}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <User className="h-5 w-5 text-gray-600" />
            </Link>

            {/* Menu Toggle */}
            <button
              onClick={onMenuToggle}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <button
                type="button"
                onClick={handleSearchToggle}
                className="w-full pl-10 pr-4 py-3 text-left text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors cursor-text"
              >
                <span className="text-gray-500">Search products...</span>
              </button>
            </div>
          </form>
        </div>

        {/* Bottom Row - Quick Actions */}
        <div className="flex items-center justify-between mt-3">
          {/* Cart */}
          <Link
            href="/cart"
            className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5 text-gray-600" />
              {isClient && cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-gray-700">Cart</span>
          </Link>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="relative">
              <Heart className="h-5 w-5 text-gray-600" />
              {isClient && wishlistItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {wishlistItemCount > 99 ? '99+' : wishlistItemCount}
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-gray-700">Wishlist</span>
          </Link>

          {/* Quick Categories */}
          <div className="flex items-center space-x-4">
            <Link
              href="/products?category=electronics"
              className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
            >
              Electronics
            </Link>
            <Link
              href="/products?category=fashion"
              className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
            >
              Fashion
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
