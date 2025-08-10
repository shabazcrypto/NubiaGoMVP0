'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Grid3X3, Search, ShoppingCart, User, Heart } from 'lucide-react'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { CartService } from '@/lib/services/cart.service'
import { WishlistService } from '@/lib/services/wishlist.service'
import { useEffect, useState } from 'react'

export default function BottomNavigation() {
  const pathname = usePathname()
  const { user } = useFirebaseAuth()
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

  const navigationItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      active: pathname === '/'
    },
    {
      name: 'Categories',
      href: '/products',
      icon: Grid3X3,
      active: pathname.startsWith('/products') || pathname.startsWith('/categories')
    },
    {
      name: 'Search',
      href: '/search',
      icon: Search,
      active: pathname.startsWith('/search')
    },
    {
      name: 'Wishlist',
      href: '/wishlist',
      icon: Heart,
      active: pathname.startsWith('/wishlist'),
      badge: isClient && wishlistItemCount > 0 ? wishlistItemCount : undefined
    },
    {
      name: 'Cart',
      href: '/cart',
      icon: ShoppingCart,
      active: pathname.startsWith('/cart') || pathname.startsWith('/checkout'),
      badge: isClient && cartItemCount > 0 ? cartItemCount : undefined
    },
    {
      name: 'Account',
      href: user ? '/customer/profile' : '/login',
      icon: User,
      active: pathname.startsWith('/customer') || pathname.startsWith('/login') || pathname.startsWith('/register')
    }
  ]

  return (
    <nav className="mobile-bottom-navigation fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = item.active
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`mobile-nav-item flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              <div className="relative">
                <Icon className={`h-6 w-6 ${isActive ? 'text-primary-600' : 'text-gray-600'}`} />
                
                {/* Badge for cart/wishlist */}
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              
              <span className={`text-xs mt-1 font-medium ${
                isActive ? 'text-primary-600' : 'text-gray-600'
              }`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
