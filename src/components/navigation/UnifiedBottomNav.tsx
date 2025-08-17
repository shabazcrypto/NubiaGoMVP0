'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, 
  Search, 
  Grid3X3, 
  ShoppingCart, 
  User,
  Heart
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/hooks/useCartStore'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: boolean
  authRequired?: boolean
  hideOnPaths?: string[]
}

const navigationItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
  },
  {
    label: 'Categories',
    href: '/categories',
    icon: Grid3X3,
  },
  {
    label: 'Search',
    href: '/search',
    icon: Search,
  },
  {
    label: 'Cart',
    href: '/cart',
    icon: ShoppingCart,
    badge: true,
  },
  {
    label: 'Account',
    href: '/profile',
    icon: User,
    authRequired: true,
  }
]

export function UnifiedBottomNav() {
  const pathname = usePathname()
  const { items } = useCartStore()
  const { user } = useAuth()

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0)

  // Hide bottom nav on certain pages
  const hideOnPaths = [
    '/login',
    '/register',
    '/auth',
    '/checkout'
  ]

  // Hide on dashboard routes
  const isDashboardRoute = pathname.startsWith('/admin') ||
                           pathname.startsWith('/customer/') ||
                           pathname.startsWith('/supplier/')

  if (hideOnPaths.some(path => pathname.startsWith(path)) || isDashboardRoute) {
    return null
  }

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const getAccountHref = () => {
    return user ? '/profile' : '/login'
  }

  const getAccountLabel = () => {
    return user ? 'Account' : 'Sign In'
  }

  return (
    <>
      {/* Spacer for fixed bottom nav */}
      <div className="h-16 md:hidden" />
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-t border-gray-200 md:hidden bottom-nav-safe mobile-header-blur">
        <div className="grid grid-cols-5 h-16">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const href = item.authRequired && !user ? (item.label === 'Account' ? getAccountHref() : item.href) : item.href
            const label = item.authRequired && item.label === 'Account' ? getAccountLabel() : item.label
            const active = isActive(item.href)
            
            return (
              <Link
                key={item.label}
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center py-1 px-1 transition-colors duration-200 touch-target ripple mobile-nav-transition",
                  active 
                    ? "text-primary-600 bottom-nav-item-active rounded-lg" 
                    : "text-gray-600 hover:text-primary-600"
                )}
              >
                <div className="relative">
                  <Icon className={cn(
                    "h-6 w-6 transition-colors",
                    active ? "text-primary-600" : "text-gray-600"
                  )} />
                  
                  {/* Cart Badge */}
                  {item.badge && cartItemCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[20px]"
                    >
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </Badge>
                  )}
                </div>
                
                <span className={cn(
                  "text-xs mt-0.5 font-medium transition-colors truncate",
                  active ? "text-primary-600" : "text-gray-600"
                )}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}

export default UnifiedBottomNav
