'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Home, 
  Search, 
  ShoppingCart, 
  User, 
  Heart,
  Grid3X3,
  Package
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/hooks/useCartStore'
import { useAuth } from '@/hooks/useAuth'

const navigationItems = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
    key: 'home'
  },
  {
    label: 'Categories',
    href: '/categories',
    icon: Grid3X3,
    key: 'categories'
  },
  {
    label: 'Search',
    href: '/search',
    icon: Search,
    key: 'search'
  },
  {
    label: 'Cart',
    href: '/cart',
    icon: ShoppingCart,
    key: 'cart',
    showBadge: true
  },
  {
    label: 'Account',
    href: '/profile',
    icon: User,
    key: 'account',
    authRequired: true
  }
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const { items } = useCartStore()
  const { user } = useAuth()

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0)

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const getAccountHref = () => {
    if (user) {
      return '/profile'
    }
    return '/login'
  }

  const getAccountLabel = () => {
    if (user) {
      return 'Account'
    }
    return 'Sign In'
  }

  return (
    <>
      {/* Spacer for fixed bottom nav */}
      <div className="h-16 md:hidden" />
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t z-50 md:hidden">
        <div className="flex items-center justify-around py-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            const href = item.key === 'account' ? getAccountHref() : item.href
            const label = item.key === 'account' ? getAccountLabel() : item.label
            
            // Skip auth required items for non-authenticated users (except account/login)
            if (item.authRequired && !user && item.key !== 'account') {
              return null
            }

            return (
              <Button
                key={item.key}
                variant="ghost"
                size="sm"
                className={cn(
                  "flex-col h-auto py-2 px-3 relative transition-colors",
                  active 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Link href={href}>
                  <div className="relative">
                    <Icon className={cn(
                      "h-5 w-5 mb-1 transition-transform",
                      active && "scale-110"
                    )} />
                    
                    {/* Cart Badge */}
                    {item.showBadge && item.key === 'cart' && cartItemCount > 0 && (
                      <Badge 
                        className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-xs animate-cart-bounce"
                        variant="destructive"
                      >
                        {cartItemCount > 99 ? '99+' : cartItemCount}
                      </Badge>
                    )}
                  </div>
                  
                  <span className={cn(
                    "text-xs font-medium transition-all",
                    active ? "text-primary font-semibold" : "text-muted-foreground"
                  )}>
                    {label}
                  </span>
                  
                  {/* Active Indicator */}
                  {active && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </Link>
              </Button>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default MobileBottomNav
