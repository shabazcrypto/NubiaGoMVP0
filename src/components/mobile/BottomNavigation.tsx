'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  ShoppingBagIcon, 
  UserIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as SearchIconSolid,
  ShoppingBagIcon as CartIconSolid,
  UserIcon as UserIconSolid,
  HeartIcon as HeartIconSolid
} from '@heroicons/react/24/solid'
import { useCartStore } from '@/hooks/useCartStore'
import { useWishlistStore } from '@/hooks/useWishlistStore'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  activeIcon: React.ComponentType<{ className?: string }>
  badge?: number
}

export default function BottomNavigation() {
  const pathname = usePathname()
  const { items: cartItems } = useCartStore()
  const { items: wishlistItems } = useWishlistStore()

  const navItems: NavItem[] = [
    {
      href: '/',
      label: 'Home',
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
    },
    {
      href: '/products',
      label: 'Search',
      icon: MagnifyingGlassIcon,
      activeIcon: SearchIconSolid,
    },
    {
      href: '/cart',
      label: 'Cart',
      icon: ShoppingBagIcon,
      activeIcon: CartIconSolid,
      badge: cartItems.length,
    },
    {
      href: '/wishlist',
      label: 'Wishlist',
      icon: HeartIcon,
      activeIcon: HeartIconSolid,
      badge: wishlistItems.length,
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: UserIcon,
      activeIcon: UserIconSolid,
    },
  ]

  return (
    <nav className="mobile-nav md:hidden">
      <div className="flex justify-around items-center px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const IconComponent = isActive ? item.activeIcon : item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-item relative ${
                isActive 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              } transition-colors duration-200`}
            >
              <div className="relative">
                <IconComponent className="w-6 h-6 mb-1" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="font-medium">{item.label}</span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
