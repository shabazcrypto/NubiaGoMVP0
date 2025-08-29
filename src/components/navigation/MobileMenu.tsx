'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { X, Menu, Search, ShoppingCart, User, Home, Package, Info, Phone, FileText } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth()
  const { cartItems } = useCart()
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')

  // Close menu on route change
  useEffect(() => {
    onClose()
  }, [pathname, onClose])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      onClose()
    }
  }

  const handleLogout = async () => {
    await logout()
    onClose()
  }

  const navigationItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/products', label: 'Products', icon: Package },
    { href: '/categories', label: 'Categories', icon: Package },
    { href: '/about', label: 'About', icon: Info },
    { href: '/contact', label: 'Contact', icon: Phone },
    { href: '/help', label: 'Help', icon: FileText },
  ]

  const userMenuItems = user ? [
    { href: '/profile', label: 'Profile' },
    { href: '/orders', label: 'My Orders' },
    { href: '/wishlist', label: 'Wishlist' },
    { href: '/customer', label: 'Dashboard' },
  ] : []

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Mobile Menu */}
      <div 
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        data-testid="mobile-navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Link href="/" className="flex items-center space-x-2" onClick={onClose}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-xl font-bold text-gray-900">NubiaGo</span>
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 touch-target"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mobile-input pr-12"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          </form>
        </div>

        {/* User Section */}
        {user && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{user.displayName || user.email}</p>
                <p className="text-sm text-gray-500">Welcome back!</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4">
            {/* Main Navigation */}
            <div className="space-y-2 mb-6">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors touch-target ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* User Menu */}
            {user && userMenuItems.length > 0 && (
              <div className="space-y-2 mb-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide px-4">
                  Account
                </h3>
                {userMenuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors touch-target"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Cart */}
            <Link
              href="/cart"
              className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors touch-target mb-4"
            >
              <div className="flex items-center space-x-3">
                <ShoppingCart size={20} />
                <span>Shopping Cart</span>
              </div>
              {cartItems.length > 0 && (
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                  {cartItems.length}
                </span>
              )}
            </Link>
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          {user ? (
            <button
              onClick={handleLogout}
              className="w-full mobile-button bg-red-50 text-red-600 hover:bg-red-100"
            >
              Sign Out
            </button>
          ) : (
            <div className="space-y-2">
              <Link
                href="/login"
                className="block w-full mobile-button bg-blue-600 text-white hover:bg-blue-700 text-center"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="block w-full mobile-button bg-gray-100 text-gray-700 hover:bg-gray-200 text-center"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default MobileMenu
