'use client'

import React from 'react'
import { Search, ShoppingBag, Heart, User, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function MobileHomepage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm">
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900">NubiaGo</h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <ShoppingBag className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              className="pl-10 bg-gray-100 border-0"
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <h2 className="text-2xl font-bold mb-2">Welcome to NubiaGo</h2>
        <p className="text-blue-100 mb-4">Discover amazing products at great prices</p>
        <Button className="bg-white text-blue-600 hover:bg-gray-100">
          Shop Now
        </Button>
      </section>

      {/* Categories */}
      <section className="p-4">
        <h3 className="text-lg font-semibold mb-4">Categories</h3>
        <div className="grid grid-cols-2 gap-4">
          {['Electronics', 'Fashion', 'Home & Garden', 'Sports'].map((category) => (
            <div
              key={category}
              className="bg-white rounded-lg p-4 shadow-sm border text-center"
            >
              <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2"></div>
              <span className="text-sm font-medium">{category}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="p-4">
        <h3 className="text-lg font-semibold mb-4">Featured Products</h3>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="w-full h-32 bg-gray-200"></div>
              <div className="p-3">
                <h4 className="font-medium text-sm mb-1">Product {item}</h4>
                <p className="text-gray-600 text-xs mb-2">Sample description</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-600">$99.99</span>
                  <Button size="sm" className="text-xs">Add</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="flex items-center justify-around py-2">
          {[
            { icon: Search, label: 'Search' },
            { icon: ShoppingBag, label: 'Cart' },
            { icon: Heart, label: 'Wishlist' },
            { icon: User, label: 'Profile' }
          ].map(({ icon: Icon, label }) => (
            <Button key={label} variant="ghost" className="flex flex-col items-center py-2">
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>
      </nav>
    </div>
  )
}
