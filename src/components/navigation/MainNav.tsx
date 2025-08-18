'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetHeader,
  SheetTitle 
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  Menu,
  Package,
  Settings,
  LogOut,
  Store,
  Home,
  Grid3X3,
  Tag,
  Phone,
  Info
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCartStore } from '@/hooks/useCartStore'
import { CartDrawer } from '@/components/cart/CartDrawer'

export function MainNavigation() {
  const [searchQuery, setSearchQuery] = useState('')
  const { user, signOut } = useAuth()
  const { items } = useCartStore()
  const router = useRouter()

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo and Desktop Navigation */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <Store className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl font-heading">NubiaGo</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-base">
                  <Grid3X3 className="mr-2 h-4 w-4" />
                  Categories
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem>
                  <Link href="/categories/electronics" className="flex items-center w-full">
                    Electronics
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/categories/fashion" className="flex items-center w-full">
                    Fashion
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/categories/home" className="flex items-center w-full">
                    Home & Living
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/categories/sports" className="flex items-center w-full">
                    Sports & Outdoor
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link href="/products" className="text-base">
              <Button variant="ghost">
                <Package className="mr-2 h-4 w-4" />
                Products
              </Button>
            </Link>
            
            <Link href="/deals" className="text-base">
              <Button variant="ghost">
                <Tag className="mr-2 h-4 w-4" />
                Deals
              </Button>
            </Link>
          </nav>
        </div>
        
        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-6">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 w-full"
            />
          </form>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Wishlist */}
          <Link href="/wishlist">
            <Button variant="ghost" className="h-8 w-8 p-0">
              <Heart className="h-5 w-5" />
              <span className="sr-only">Wishlist</span>
            </Button>
          </Link>
          
          {/* Shopping Cart */}
          <CartDrawer />
          
          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                    <AvatarFallback>
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.displayName || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="cursor-pointer">
                    <Package className="mr-2 h-4 w-4" />
                    <span>Orders</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button>Sign up</Button>
              </Link>
            </div>
          )}
          
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetHeader className="p-6 border-b">
                <SheetTitle className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                    <Store className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="font-bold text-xl font-heading">NubiaGo</span>
                </SheetTitle>
              </SheetHeader>
              
              <nav className="flex flex-col p-6 space-y-4">
                <Link href="/">
                  <Button variant="ghost" className="justify-start">
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="ghost" className="justify-start">
                    <Package className="mr-2 h-4 w-4" />
                    Products
                  </Button>
                </Link>
                <Link href="/categories">
                  <Button variant="ghost" className="justify-start">
                    <Grid3X3 className="mr-2 h-4 w-4" />
                    Categories
                  </Button>
                </Link>
                <Link href="/deals">
                  <Button variant="ghost" className="justify-start">
                    <Tag className="mr-2 h-4 w-4" />
                    Deals
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="ghost" className="justify-start">
                    <Info className="mr-2 h-4 w-4" />
                    About
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="ghost" className="justify-start">
                    <Phone className="mr-2 h-4 w-4" />
                    Contact
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export default MainNavigation
