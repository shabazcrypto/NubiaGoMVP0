'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Bars3Icon, 
  XMarkIcon,
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import { useCartStore } from '@/hooks/useCartStore'
import { motion, AnimatePresence } from 'framer-motion'

interface MobileHeaderProps {
  showSearch?: boolean
  title?: string
  showBack?: boolean
  onBack?: () => void
}

export default function MobileHeader({ 
  showSearch = true, 
  title,
  showBack = false,
  onBack 
}: MobileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { items: cartItems } = useCartStore()

  const menuItems = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'All Products' },
    { href: '/categories', label: 'Categories' },
    { href: '/orders', label: 'My Orders' },
    { href: '/profile', label: 'Profile' },
    { href: '/help', label: 'Help & Support' },
  ]

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 safe-area-top">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left side */}
          <div className="flex items-center">
            {showBack ? (
              <button
                onClick={onBack}
                className="p-2 -ml-2 text-gray-600 hover:text-gray-900 touch-spacing"
                aria-label="Go back"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            ) : (
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 -ml-2 text-gray-600 hover:text-gray-900 touch-spacing"
                aria-label="Open menu"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Center - Logo or Title */}
          <div className="flex items-center">
            {title ? (
              <h1 className="text-lg font-semibold text-gray-900 truncate max-w-32">
                {title}
              </h1>
            ) : (
              <Link href="/" className="flex items-center">
                <Image
                  src="/ui-logo-1.jpg"
                  alt="NubiaGo"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-lg"
                  priority
                />
                <span className="ml-2 text-lg font-bold text-gray-900">
                  NubiaGo
                </span>
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2">
            {showSearch && (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900 touch-spacing"
                aria-label="Search"
              >
                <MagnifyingGlassIcon className="w-6 h-6" />
              </button>
            )}
            
            <button className="p-2 text-gray-600 hover:text-gray-900 touch-spacing relative">
              <BellIcon className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <Link 
              href="/cart" 
              className="p-2 text-gray-600 hover:text-gray-900 touch-spacing relative"
            >
              <ShoppingBagIcon className="w-6 h-6" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartItems.length > 99 ? '99+' : cartItems.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Side Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
            />
            
            {/* Menu */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-xl"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Image
                      src="/ui-logo-1.jpg"
                      alt="NubiaGo"
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-lg"
                    />
                    <div className="ml-3">
                      <h2 className="font-semibold text-gray-900">NubiaGo</h2>
                      <p className="text-sm text-gray-500">Premium Shopping</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <nav className="py-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-6 py-4 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Version 1.0.0</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Made with ❤️ for Africa
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-50"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <input
                type="search"
                placeholder="Search products..."
                className="flex-1 p-3 text-lg border-none outline-none no-zoom"
                autoFocus
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="ml-4 p-2 text-gray-600 hover:text-gray-900"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Recent Searches</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Headphones', 'Smartphone', 'Laptop', 'Watch'].map((term) => (
                      <button
                        key={term}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Popular Categories</h3>
                  <div className="space-y-2">
                    {['Electronics', 'Fashion', 'Home & Living', 'Sports'].map((category) => (
                      <Link
                        key={category}
                        href={`/products?category=${category}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="block p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
