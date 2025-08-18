'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Heart, 
  ShoppingCart, 
  Moon, 
  Phone, 
  Mail, 
  Truck,
  ChevronDown,
  User,
  Menu,
  Sparkles,
  Smartphone,
  Home,
  Palette,
  Shirt,
  ShoppingBag,
  Zap
} from 'lucide-react'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { useCartStore } from '@/hooks/useCartStore'
import { useMobileMenu } from '@/components/providers/mobile-menu-provider'
import { Logo } from '@/components/ui/Logo'
import { CategoriesDropdown } from './CategoriesDropdown'

interface UnifiedHeaderProps {
  variant?: 'default' | 'minimal'
  showBackButton?: boolean
  title?: string
}

export function UnifiedHeader({ variant = 'default', showBackButton = false, title }: UnifiedHeaderProps) {
  const { user } = useFirebaseAuth()
  const { items: cartItems } = useCartStore()
  const { toggleMenu } = useMobileMenu()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  const handleBack = () => {
    window.history.back()
  }

  const cartItemCount = isClient ? (cartItems?.reduce((total, item) => total + item.quantity, 0) || 0) : 0

  // Search overlay component
  const SearchOverlay = () => (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="flex items-center p-4 border-b">
        <Button variant="ghost" size="sm" onClick={() => setIsSearchOpen(false)}>
          ← Back
        </Button>
        <form onSubmit={handleSearch} className="flex-1 ml-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2"
              autoFocus
            />
          </div>
        </form>
      </div>
    </div>
  )

  if (isSearchOpen) {
    return <SearchOverlay />
  }

  return (
    <>
             {/* Top Utility Bar */}
       <div className="bg-slate-800 text-slate-200 text-xs">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex items-center justify-between h-9">
             {/* Left side - Contact Info */}
             <div className="hidden md:flex items-center space-x-4">
               <div className="flex items-center space-x-1.5">
                 <Phone className="h-3 w-3 text-slate-400" />
                 <span className="text-slate-300">+234 123 456 7890</span>
               </div>
               <div className="flex items-center space-x-1.5">
                 <Mail className="h-3 w-3 text-slate-400" />
                 <span className="text-slate-300">support@nubiago.com</span>
               </div>
             </div>

             {/* Right side - Shipping Promotion */}
             <div className="flex items-center space-x-1.5">
               <Truck className="h-3 w-3 text-slate-400" />
               <span className="text-slate-300">Free Shipping on Orders Over $50</span>
             </div>
           </div>
         </div>
       </div>

             {/* Main Header */}
       <header className={cn(
         "bg-white border-b border-slate-200 transition-all duration-200",
         isScrolled && "shadow-sm"
       )}>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           {/* Mobile Header */}
           <div className="md:hidden">
             <div className="flex items-center justify-between h-14">
               {/* Mobile Menu Toggle */}
               <Button variant="ghost" size="sm" onClick={toggleMenu} className="p-2">
                 <Menu className="h-5 w-5 text-slate-600" />
               </Button>

               {/* Mobile Logo */}
               <Logo variant="horizontal" size="md" />

               {/* Mobile Search */}
               <Button variant="ghost" size="sm" onClick={() => setIsSearchOpen(true)} className="p-2">
                 <Search className="h-5 w-5 text-slate-600" />
               </Button>
             </div>
           </div>

           {/* Desktop Header */}
           <div className="hidden md:flex items-center justify-between h-14">
             {/* Logo */}
             <Logo variant="horizontal" size="lg" />

             {/* Search Bar */}
             <div className="flex-1 max-w-xl mx-8">
               <form onSubmit={handleSearch} className="relative">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                 <Input
                   type="text"
                   placeholder="Search products..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="pl-10 pr-4 py-2.5 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                 />
               </form>
             </div>

             {/* Action Buttons */}
             <div className="flex items-center space-x-3">
               <Button variant="outline" size="sm" className="hidden lg:flex border-slate-300 text-slate-700 hover:bg-slate-50">
                 Browse Products
               </Button>
               
               <Link href="/wishlist">
                 <Button variant="ghost" size="sm" className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                   <Heart className="h-5 w-5" />
                 </Button>
               </Link>

               <Link href="/cart">
                 <Button variant="ghost" size="sm" className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative">
                   <ShoppingCart className="h-5 w-5" />
                   {cartItemCount > 0 && (
                     <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-blue-600 border-2 border-white">
                       {cartItemCount}
                     </Badge>
                   )}
                 </Button>
               </Link>

               <Button variant="ghost" size="sm" className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                 <Moon className="h-5 w-5" />
               </Button>

               {user && isClient ? (
                 <Link href="/profile">
                   <Button variant="ghost" size="sm" className="text-slate-700 hover:bg-slate-100">
                     <User className="h-5 w-5 mr-2" />
                     Account
                   </Button>
                 </Link>
               ) : (
                 <div className="flex items-center space-x-3">
                   <Link href="/login" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
                     Login
                   </Link>
                   <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                     Sign Up
                   </Button>
                 </div>
               )}
             </div>
           </div>
         </div>
       </header>

             {/* Secondary Navigation - Categories */}
       <nav className="bg-slate-50 border-b border-slate-200">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex items-center justify-between h-11">
             {/* Categories Dropdown */}
             <CategoriesDropdown />

             {/* Category Links */}
             <div className="hidden lg:flex items-center space-x-8">
               <Link href="/products?category=women" className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors">
                 <Shirt className="h-4 w-4 text-slate-500" />
                 <span className="text-sm font-medium">Women</span>
               </Link>
               <Link href="/products?category=men" className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors">
                 <Shirt className="h-4 w-4 text-slate-500" />
                 <span className="text-sm font-medium">Men</span>
               </Link>
               <Link href="/products?category=electronics" className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors">
                 <Smartphone className="h-4 w-4 text-slate-500" />
                 <span className="text-sm font-medium">Electronics</span>
               </Link>
               <Link href="/products?category=home-living" className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors">
                 <Home className="h-4 w-4 text-slate-500" />
                 <span className="text-sm font-medium">Home & Living</span>
               </Link>
               <Link href="/products?category=beauty" className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors">
                 <Palette className="h-4 w-4 text-slate-500" />
                 <span className="text-sm font-medium">Beauty & Cosmetics</span>
               </Link>
                               <Link href="/products?category=shoes-bags" className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors">
                  <ShoppingBag className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium">Shoes & Bags</span>
                </Link>
             </div>

             {/* Mobile Categories */}
             <div className="md:hidden">
               <Button variant="ghost" size="sm" className="p-2 text-slate-600">
                 <ChevronDown className="h-4 w-4" />
               </Button>
             </div>
           </div>
         </div>
       </nav>
    </>
  )
}
