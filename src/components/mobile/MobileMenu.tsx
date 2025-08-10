'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, User, ShoppingBag, Heart, Settings, LogOut, HelpCircle, Star, Gift, Truck, Shield, CreditCard } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { CartService } from '@/lib/services/cart.service'
import { WishlistService } from '@/lib/services/wishlist.service'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

interface MenuItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
  isExternal?: boolean
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user, logout } = useAuth()
  const [cartItemCount, setCartItemCount] = useState(0)
  const [wishlistItemCount, setWishlistItemCount] = useState(0)
  const [isClient, setIsClient] = useState(false)

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

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleLogout = async () => {
    try {
      await logout()
      onClose()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const mainMenuItems: MenuItem[] = [
    {
      id: 'profile',
      label: 'My Profile',
      href: user ? '/customer/profile' : '/login',
      icon: <User className="h-5 w-5" />
    },
    {
      id: 'orders',
      label: 'My Orders',
      href: user ? '/customer/orders' : '/login',
      icon: <ShoppingBag className="h-5 w-5" />
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      href: '/wishlist',
      icon: <Heart className="h-5 w-5" />,
      badge: isClient ? wishlistItemCount : 0
    },
    {
      id: 'cart',
      label: 'Shopping Cart',
      href: '/cart',
      icon: <ShoppingBag className="h-5 w-5" />,
      badge: isClient ? cartItemCount : 0
    }
  ]

  const categoryMenuItems: MenuItem[] = [
    {
      id: 'electronics',
      label: 'Electronics',
      href: '/products?category=electronics',
      icon: <Star className="h-5 w-5" />
    },
    {
      id: 'fashion',
      label: 'Fashion',
      href: '/products?category=fashion',
      icon: <Gift className="h-5 w-5" />
    },
    {
      id: 'home-living',
      label: 'Home & Living',
      href: '/products?category=home-living',
      icon: <Truck className="h-5 w-5" />
    },
    {
      id: 'beauty',
      label: 'Beauty & Cosmetics',
      href: '/products?category=beauty-cosmetics',
      icon: <Star className="h-5 w-5" />
    }
  ]

  const supportMenuItems: MenuItem[] = [
    {
      id: 'help',
      label: 'Help Center',
      href: '/help',
      icon: <HelpCircle className="h-5 w-5" />
    },
    {
      id: 'shipping',
      label: 'Shipping Info',
      href: '/shipping',
      icon: <Truck className="h-5 w-5" />
    },
    {
      id: 'returns',
      label: 'Returns & Refunds',
      href: '/returns',
      icon: <Shield className="h-5 w-5" />
    },
    {
      id: 'payment',
      label: 'Payment Methods',
      href: '/payment',
      icon: <CreditCard className="h-5 w-5" />
    }
  ]

  const renderMenuItem = (item: MenuItem) => (
    <Link
      key={item.id}
      href={item.href}
      onClick={onClose}
      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <div className="text-gray-600">{item.icon}</div>
        <span className="text-gray-900 font-medium">{item.label}</span>
      </div>
      {item.badge && item.badge > 0 && (
        <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {item.badge > 99 ? '99+' : item.badge}
        </span>
      )}
    </Link>
  )

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div className="fixed inset-y-0 left-0 w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-xl font-bold text-gray-900">NubiaGo</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* User Section */}
        <div className="p-4 border-b border-gray-200">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {user.displayName || user.email}
                </p>
                <p className="text-sm text-gray-500">
                  {user.email}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-3">Sign in to access your account</p>
              <Link
                href="/login"
                onClick={onClose}
                className="inline-block bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Menu Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Main Menu */}
          <div className="py-2">
            <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Account
            </h3>
            {mainMenuItems.map(renderMenuItem)}
          </div>

          {/* Categories */}
          <div className="py-2 border-t border-gray-100">
            <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Shop by Category
            </h3>
            {categoryMenuItems.map(renderMenuItem)}
          </div>

          {/* Support */}
          <div className="py-2 border-t border-gray-100">
            <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Support
            </h3>
            {supportMenuItems.map(renderMenuItem)}
          </div>

          {/* Settings & Logout */}
          {user && (
            <div className="py-2 border-t border-gray-100">
              <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Account
              </h3>
              <Link
                href="/customer/settings"
                onClick={onClose}
                className="flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors"
              >
                <Settings className="h-5 w-5 text-gray-600" />
                <span className="text-gray-900 font-medium">Settings</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <LogOut className="h-5 w-5 text-gray-600" />
                <span className="text-gray-900 font-medium">Sign Out</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">
              © 2024 NubiaGo. All rights reserved.
            </p>
            <div className="flex justify-center space-x-4 text-xs text-gray-400">
              <Link href="/privacy" onClick={onClose}>Privacy</Link>
              <Link href="/terms" onClick={onClose}>Terms</Link>
              <Link href="/cookies" onClick={onClose}>Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
