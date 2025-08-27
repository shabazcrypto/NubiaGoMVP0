/**
 * 🛡️ UI DESIGN PROTECTION NOTICE
 * 
 * This file contains UI elements that are PROTECTED from changes.
 * The current design is FROZEN and cannot be modified unless:
 * 1. User explicitly requests a specific change
 * 2. User confirms the change before implementation
 * 3. Change is documented in UI_DESIGN_PROTECTION.md
 * 
 * DO NOT MODIFY UI ELEMENTS WITHOUT EXPLICIT USER AUTHORIZATION
 * 
 * @ui-protected: true
 * @requires-user-approval: true
 * @last-approved: 2024-12-19
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'
// Direct Next.js Image components - no layers
import { 
  Laptop, 
  Shirt, 
  Home, 
  Heart as HealthIcon, 
  Heart,
  Dumbbell, 
  BookOpen,
  Search,
  Star,
  Users,
  Globe,
  TrendingUp,
  Shield,
  Truck,
  CreditCard
} from 'lucide-react'
import PullToRefresh from '@/components/mobile/PullToRefresh'
import MobileHomepage from '@/components/mobile/MobileHomepage'
import { useEffect, useState } from 'react'
import TestConnection from './test-connection'
import PlaceholderDemo from '@/components/ui/PlaceholderDemo'

// ============================================================================
// HERO SECTION
// ============================================================================

function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <section className="relative bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600 text-white overflow-hidden min-h-screen">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/hero-pattern.svg')] bg-repeat bg-[length:60px_60px]"></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-primary-400/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
      
      <div className="relative w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
          
          {/* Left Column - Hero Content */}
          <div className="space-y-6 order-2 lg:order-1">
            
            {/* Trust Badges - Smaller and more refined */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                <Globe className="h-3 w-3 mr-1.5 text-yellow-400" />
                <span className="text-xs font-medium">Africa's #1 Marketplace</span>
              </div>
              <div className="flex items-center bg-yellow-500/15 backdrop-blur-sm px-3 py-1.5 rounded-full border border-yellow-400/20">
                <Star className="h-3 w-3 mr-1.5 text-yellow-400" />
                <span className="text-xs font-medium">Trusted by Millions</span>
              </div>
              <div className="flex items-center bg-green-500/15 backdrop-blur-sm px-3 py-1.5 rounded-full border border-green-400/20">
                <Users className="h-3 w-3 mr-1.5 text-green-400" />
                <span className="text-xs font-medium">50K+ Verified Sellers</span>
              </div>
            </div>

            {/* Main Headline - Better spacing */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black leading-tight tracking-tight">
                Africa's <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500">Premier</span> Marketplace
              </h1>

              <p className="text-lg lg:text-xl text-white/90 leading-relaxed">
                <span className="font-semibold text-yellow-400">Trusted sellers across 34+ African countries.</span> Secure payments, fast delivery, guaranteed quality.
              </p>
            </div>

            {/* Refined Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder="Search from 500K+ products..." 
                  className={`w-full px-4 py-3 pr-12 text-base rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none shadow-lg border transition-all duration-300 ${
                    isSearchFocused 
                      ? 'ring-2 ring-yellow-400/50 border-yellow-400/50' 
                      : 'border-white/20'
                  }`}
                />
                <button 
                  type="submit"
                  className="absolute right-1.5 top-1.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-3 py-1.5 rounded-md transition-all duration-300 hover:shadow-md hover:scale-105"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
              
              {/* Quick Suggestions - More compact */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="text-white/70 text-xs">Popular:</span>
                {['iPhone', 'Samsung TV', 'Nike Shoes', 'Home Decor'].map((term) => (
                  <button 
                    key={term} 
                    type="button"
                    onClick={() => setSearchQuery(term)}
                    className="bg-white/10 hover:bg-white/20 px-2 py-1 rounded-full text-xs transition-colors border border-white/10"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </form>

            {/* Value Propositions - Smaller and more elegant */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center space-x-2.5 bg-white/8 backdrop-blur-sm rounded-lg p-3 border border-white/15">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-xs">Secure Payments</h3>
                  <p className="text-white/60 text-xs">Multiple payment methods</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2.5 bg-white/8 backdrop-blur-sm rounded-lg p-3 border border-white/15">
                <div className="w-8 h-8 bg-primary-600/20 rounded-lg flex items-center justify-center">
                  <Truck className="h-4 w-4 text-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-xs">Fast Delivery</h3>
                  <p className="text-white/60 text-xs">Same-day delivery</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2.5 bg-white/8 backdrop-blur-sm rounded-lg p-3 border border-white/15">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-xs">Best Prices</h3>
                  <p className="text-white/60 text-xs">Competitive pricing</p>
                </div>
              </div>
            </div>

            {/* Call to Action - More refined buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link 
                href={{ pathname: '/products' }} 
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold px-6 py-3 rounded-lg text-base transition-all duration-300 hover:shadow-lg hover:scale-105 text-center"
              >
                Start Shopping Now
              </Link>
              <Link 
                href="/become-supplier" 
                className="bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white font-medium px-6 py-3 rounded-lg text-base transition-all duration-300 border border-white/20 text-center"
              >
                Become a Seller
              </Link>
            </div>
            
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative order-1 lg:order-2">
            <div className="relative w-full h-[400px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/hero-image.webp"
                alt="NubiaGo Marketplace - Africa's Premier E-commerce Platform"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Overlay for better text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
              
              {/* Floating Product Cards */}
              <div className="absolute top-4 right-4 lg:top-8 lg:right-8 bg-white/95 backdrop-blur-sm rounded-xl p-3 lg:p-4 shadow-xl">
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <div className="w-8 h-8 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 lg:h-6 lg:w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs lg:text-sm font-semibold text-gray-900">Trending Now</p>
                    <p className="text-xs text-gray-600">500K+ Products</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-4 left-4 lg:bottom-8 lg:left-8 bg-white/95 backdrop-blur-sm rounded-xl p-3 lg:p-4 shadow-xl">
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <div className="w-8 h-8 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-4 w-4 lg:h-6 lg:w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs lg:text-sm font-semibold text-gray-900">Secure Shopping</p>
                    <p className="text-xs text-gray-600">100% Protected</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// NEW ARRIVALS SECTION
// ============================================================================

function NewArrivalsSection() {
  const products = [
    {
      id: '1',
      name: 'Wireless Bluetooth Headphones',
      price: '$85K',
      image: '/product-tech-1.svg',
      badge: 'New'
    },
    {
      id: '2',
      name: 'Organic Cotton T-Shirt',
      price: '$45K',
      image: '/product-headphones-1.svg',
      badge: 'Hot'
    },
    {
      id: '3',
      name: 'Complete Skincare Set',
      price: '$32K',
      image: '/product-cosmetics-1.svg',
      badge: 'Hot'
    },
    {
      id: '4',
      name: 'Smart Fitness Watch',
      price: '$120K',
      image: '/product-watch-1.svg',
      badge: 'New'
    },
    {
      id: '5',
      name: 'Modern Wall Art',
      price: '$28K',
      image: '/product-home-1.svg',
      badge: 'Hot'
    },
    {
      id: '6',
      name: 'Designer Sunglasses',
      price: '$65K',
      image: '/product-accessories-1.svg',
      badge: 'New'
    }
  ]

  return (
    <section className="relative py-20 bg-neutral-50 overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-full mb-4">
            <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
            Fresh Arrivals
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
            New Arrivals
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Curated selection of premium products, handpicked for discerning customers
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl border border-neutral-200 shadow-soft overflow-hidden">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Link href={`/products/${product.id}`}>
                  <Image
                    src={product.id === '1' ? '/product-tech-1.jpg' : 
                         product.id === '2' ? '/headphones.jpg' : 
                         product.id === '3' ? '/product-cosmetics-1.jpg' : 
                         product.id === '4' ? '/product-watch-1.jpg' : 
                         product.id === '5' ? '/product-home-1.jpg' : 
                         '/product-accessories-1.jpg'}
                    alt={`${product.name} - ${product.badge} product`}
                    width={400}
                    height={500}
                    className="w-full h-full object-cover"
                  />
                </Link>
                
                {/* Badge */}
                <div className={`absolute top-3 left-3 ${product.badge === 'New' ? 'bg-primary-600' : 'bg-yellow-500'} text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-medium`}>
                  {product.badge}
                </div>
                
                {/* Quick Actions */}
                <div className="absolute top-3 right-3">
                  <Link href="/wishlist" className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-medium">
                    <Heart className="h-4 w-4 text-neutral-700" />
                  </Link>
                </div>
              </div>
              
              {/* Product Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <Link href={`/products/${product.id}`} className="text-sm font-semibold text-neutral-900 line-clamp-2 leading-tight">
                    {product.name}
                  </Link>
                  <div className="text-sm font-bold text-primary-600 ml-2">{product.price}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs text-neutral-500 ml-1">(24)</span>
                  </div>
                  <Link href={`/products/${product.id}`} className="text-xs text-neutral-500">
                    Quick View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
              <Link href={{ pathname: '/products' }} className="inline-flex items-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-2xl shadow-medium">
            View All New Arrivals
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// SHOP BY CATEGORIES SECTION
// ============================================================================

function ShopByCategoriesSection() {
  const categories = [
    {
      id: 1,
      name: 'Women',
              image: '/category-cosmetics.svg',
      count: '750+ Products',
      href: { pathname: '/products', query: { category: 'women' } }
    },
    {
      id: 2,
      name: 'Men',
              image: '/category-men.svg',
      count: '600+ Products',
      href: { pathname: '/products', query: { category: 'men' } }
    },
    {
      id: 3,
      name: 'Mother & Child',
              image: '/category-mother-child.svg',
      count: '450+ Products',
      href: { pathname: '/products', query: { category: 'mother-child' } }
    },
    {
      id: 4,
      name: 'Home & Living',
              image: '/category-home-living.svg',
      count: '500+ Products',
      href: { pathname: '/products', query: { category: 'home-living' } }
    },
    {
      id: 5,
      name: 'Cosmetics',
              image: '/category-cosmetics.svg',
      count: '400+ Products',
      href: { pathname: '/products', query: { category: 'beauty-cosmetics' } }
    },
    {
      id: 6,
      name: 'Shoes & Bags',
              image: '/category-shoes-bags.svg',
      count: '350+ Products',
      href: { pathname: '/products', query: { category: 'shoes-bags' } }
    },
    {
      id: 7,
      name: 'Electronics',
              image: '/category-electronics-2.svg',
      count: '600+ Products',
      href: { pathname: '/products', query: { category: 'electronics' } }
    }
  ]

  return (
    <section className="py-12 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Shop by Categories</h2>
          <p className="text-gray-600">Explore our wide range of product categories</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={category.id === 1 ? '/category-cosmetics.jpg' : category.id === 2 ? '/category-men.jpg' : category.id === 3 ? '/category-mother-child.jpg' : category.id === 4 ? '/category-home-living.jpg' : category.id === 5 ? '/category-cosmetics.jpg' : category.id === 6 ? '/category-shoes-bags.jpg' : '/category-electronics.jpg'}
                  alt={category.name}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-4 text-white">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-2">
                      <Laptop className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">{category.name}</h3>
                    <p className="text-white/80 text-sm">{category.count}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// FASHION COLLECTION SECTION
// ============================================================================

function FashionCollectionSection() {
  return (
    <section className="relative py-12 bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23f1f5f9%22%20fill-opacity%3D%220.4%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="relative w-full px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content Side */}
          <div className="space-y-6">
            {/* Premium Header */}
            <div className="space-y-3">
              <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-xs font-semibold rounded-full mb-4 shadow-lg">
                <span className="w-1.5 h-1.5 bg-white rounded-full mr-2 animate-pulse"></span>
                New Collection
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight">
                Fashion Forward
              </h2>
              <div className="space-y-1">
                <h3 className="text-lg lg:text-xl text-gray-700 font-semibold">The Urban Style Collection</h3>
                <h4 className="text-base lg:text-lg text-gray-500">Street Series</h4>
              </div>
            </div>

            {/* Product Previews - Larger and More Prominent */}
            <div className="grid grid-cols-4 gap-3">
              <Link href={{ pathname: '/products', query: { category: 'fashion' } }} className="group relative aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Image
                  src="/product-fashion-1.jpg"
                  alt="Fashion Item"
                  width={120}
                  height={120}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link href={{ pathname: '/products', query: { category: 'fashion' } }} className="group relative aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Image
                  src="/product-bag-1.jpg"
                  alt="Fashion Bag"
                  width={120}
                  height={120}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link href={{ pathname: '/products', query: { category: 'fashion' } }} className="group relative aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Image
                  src="/product-shoes-1.jpg"
                  alt="Fashion Shoes"
                  width={120}
                  height={120}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link href={{ pathname: '/products', query: { category: 'fashion' } }} className="group relative aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Image
                  src="/product-watch-1.jpg"
                  alt="Fashion Watch"
                  width={120}
                  height={120}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </div>

            {/* Description - More Compact */}
            <p className="text-gray-600 leading-relaxed max-w-lg text-sm lg:text-base">
              With a style inspired by urban streets and contemporary fashion trends for the modern lifestyle.
            </p>

            {/* Premium CTA */}
            <div className="flex items-center space-x-4">
              <Link href={{ pathname: '/products', query: { category: 'fashion' } }} className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                Shop Collection
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Hot Trending</span>
                <span>•</span>
                <span>2.4k+ Sold</span>
              </div>
            </div>
          </div>

          {/* Hero Image - Larger and More Impactful */}
          <div className="relative group">
            <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_60px_rgb(0,0,0,0.15)] hover:shadow-[0_30px_80px_rgb(0,0,0,0.25)] transition-all duration-500 hover:-translate-y-2">
              <Link href={{ pathname: '/products', query: { category: 'fashion' } }}>
                <Image
                  src="/ui-hero-banner.jpg"
                  alt="Fashion Collection Showcase"
                  className="w-full h-[500px] lg:h-[600px] object-cover group-hover:scale-105 transition-transform duration-700"
                  width={1200}
                  height={600}
                  priority={true}
                />
              </Link>
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Floating Badge */}
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                Featured
              </div>
              
              {/* Quick Stats */}
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                <div className="text-xs text-gray-600 mb-1">Collection Stats</div>
                <div className="flex items-center space-x-4 text-sm">
                  <div>
                    <div className="font-semibold text-gray-900">150+</div>
                    <div className="text-gray-500">Items</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 flex items-center">
                      4.8<Star className="h-3 w-3 text-yellow-400 fill-current ml-1" />
                    </div>
                    <div className="text-gray-500">Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// SHOP OUR OFFERS SECTION
// ============================================================================

function ShopOurOffersSection() {
  const offers = [
    {
      id: 1,
      title: 'Kids Summer Dress',
      category: 'Girls Clothing',
      price: '$24.99',
      originalPrice: '$39.99',
      productCategory: 'fashion',
      variant: 2,
      badge: 'Sale'
    },
    {
      id: 2,
      title: 'Superhero T-Shirt Set',
      category: 'Boys Clothing',
      price: '$18.99',
      originalPrice: '$29.99',
      productCategory: 'fashion',
      variant: 0,
      badge: 'Sale'
    },
    {
      id: 3,
      title: 'Rainbow Sneakers',
      category: 'Kids Shoes',
      price: '$32.99',
      originalPrice: '$49.99',
      productCategory: 'shoes',
      variant: 2,
      badge: 'Sale'
    },
    {
      id: 4,
      title: 'Cute Animal Romper',
      category: 'Baby Clothing',
      price: '$16.99',
      originalPrice: '$24.99',
      productCategory: 'fashion',
      variant: 1,
      badge: 'Sale'
    },
    {
      id: 5,
      title: 'Cozy Winter Jacket',
      category: 'Winter Wear',
      price: '$45.99',
      productCategory: 'accessories',
      variant: 2,
      badge: 'New'
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Shop Our Offers</h2>
            <p className="text-lg text-gray-600">Adorable styles for little ones at unbeatable prices.</p>
          </div>
          <Link href="/products" className="flex items-center space-x-2 text-gray-900 font-semibold hover:text-primary-600 transition-colors mt-4 lg:mt-0">
            Shop All Products
            →
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {offers.map((offer) => (
            <Link key={offer.id} href={`/products/${offer.id}`} className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <div className="relative">
                <Image
                  src={offer.id === 1 ? '/product-fashion-1.jpg' : offer.id === 2 ? '/product-clothing-1.jpg' : offer.id === 3 ? '/product-shoes-1.jpg' : offer.id === 4 ? '/product-bag-1.jpg' : '/product-accessories-1.jpg'}
                  alt={offer.title}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <div className={`absolute top-3 left-3 ${offer.badge === 'Sale' ? 'bg-primary-600' : 'bg-green-600'} text-white px-2 py-1 rounded-full text-xs font-semibold`}>
                  {offer.badge}
                </div>
              </div>
              <div className="p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{offer.category}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{offer.title}</h3>
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-lg font-bold text-primary-600">{offer.price}</span>
                  {offer.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">{offer.originalPrice}</span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <div className="w-4 h-4 bg-pink-300 rounded-full border-2 border-gray-200"></div>
                  <div className="w-4 h-4 bg-primary-300 rounded-full border-2 border-gray-200"></div>
                  <div className="w-4 h-4 bg-yellow-300 rounded-full border-2 border-gray-200"></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// TESTIMONIALS SECTION
// ============================================================================

function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Fashion Enthusiast',
              avatar: '/avatar-user-5.svg',
      content: 'Amazing quality products and lightning-fast delivery! The customer service is exceptional.',
      rating: 5,
      location: 'Lagos, Nigeria'
    },
    {
      id: 2,
      name: 'David Chen',
      role: 'Tech Professional',
              avatar: '/avatar-user-2.svg',
      content: 'Found exactly what I was looking for at great prices. Highly recommend this platform!',
      rating: 5,
      location: 'Nairobi, Kenya'
    },
    {
      id: 3,
      name: 'Amina Hassan',
      role: 'Home Decor Lover',
              avatar: '/avatar-user-3.svg',
      content: 'The variety of products is incredible. I love how easy it is to find unique items.',
      rating: 5,
      location: 'Cairo, Egypt'
    }
  ]

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold rounded-full mb-4 shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
            Customer Reviews
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Join thousands of satisfied customers across Africa who trust us for their shopping needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-2">
              <div className="flex items-center mb-6">
                <Image
                  src={testimonial.id === 1 ? '/avatar-user-1.jpg' : testimonial.id === 2 ? '/avatar-user-2.jpg' : '/avatar-user-3.jpg'}
                  alt={testimonial.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                  <p className="text-xs text-gray-400">{testimonial.location}</p>
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <p className="text-gray-600 leading-relaxed italic">
                "{testimonial.content}"
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Star className="h-6 w-6 text-yellow-400 fill-current" />
              <span>4.9/5 Average Rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-gray-600" />
              <span>50K+ Happy Customers</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="h-6 w-6 text-gray-600" />
              <span>34+ Countries</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// FEATURED DEALS SECTION
// ============================================================================

function FeaturedDealsSection() {
  const deals = [
    {
      id: 1,
      title: 'Flash Sale',
      subtitle: 'Up to 70% Off',
      description: 'Limited time offer on selected items',
              image: '/category-electronics.svg',
      href: '/products?sale=flash',
      badge: 'Hot',
      endTime: '2 days left'
    },
    {
      id: 2,
      title: 'New Arrivals',
      subtitle: 'Fresh Collection',
      description: 'Latest trends and styles',
              image: '/category-men.svg',
      href: '/products?new=true',
      badge: 'New',
      endTime: 'Limited stock'
    },
    {
      id: 3,
      title: 'Clearance Sale',
      subtitle: 'Final Reduction',
      description: 'Last chance to grab amazing deals',
              image: '/category-home-living.svg',
      href: '/products?clearance=true',
      badge: 'Flash',
      endTime: '1 day left'
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Featured Deals</h2>
            <p className="text-lg text-gray-600">Don't miss out on these incredible offers</p>
          </div>
          <Link href={{ pathname: '/products' }} className="flex items-center space-x-2 text-gray-900 font-semibold hover:text-primary-600 transition-colors mt-4 lg:mt-0">
            View All Deals
            →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {deals.map((deal) => (
            <Link key={deal.id} href={{ pathname: '/products', query: Object.fromEntries(new URLSearchParams(deal.href.split('?')[1] || '')) }} className="group relative overflow-hidden rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-3">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={deal.id === 1 ? '/category-electronics.jpg' : deal.id === 2 ? '/category-men.jpg' : '/category-home-living.jpg'}
                  alt={deal.title}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                
                {/* Badge */}
                <div className="absolute top-4 left-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                  {deal.badge}
                </div>
                
                {/* End Time */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                  {deal.endTime}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{deal.title}</h3>
                <p className="text-2xl font-bold text-primary-600 mb-2">{deal.subtitle}</p>
                <p className="text-gray-600 mb-4">{deal.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Shop Now</span>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// NEWSLETTER SECTION
// ============================================================================

function NewsletterSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-full mb-6 shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
            Stay Updated
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Get the Latest Updates
          </h2>
          
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Subscribe to our newsletter and be the first to know about new products, exclusive deals, and special offers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-6 py-4 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/20"
            />
            <button className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-8 py-4 rounded-full font-semibold transition-all hover:scale-105 shadow-lg">
              Subscribe
            </button>
          </div>
          
          <p className="text-sm text-white/70 mt-4">
            By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
          </p>
        </div>
      </div>
    </section>
  )
}



// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function HomePage() {
  const [isClient, setIsClient] = useState(false)
  const [loadingTimeout, setLoadingTimeout] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'fallback' | 'error'>('fallback')

  useEffect(() => {
    setIsClient(true)
    
    // Temporarily skip Firebase connection check to fix loading issue
    setConnectionStatus('fallback')
    
    // Image diagnostics removed - no images to debug
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoadingTimeout(true)
    }, 3000) // Reduced to 3 seconds timeout
    
    return () => clearTimeout(timeout)
  }, [])

  // Handle search functionality
  const handleSearch = (query: string) => {
    // Redirect to search page with query
    window.location.href = `/search?q=${encodeURIComponent(query)}`
  }

  // Handle category selection with mobile optimization
  const handleCategorySelect = (category: string) => {
    const searchParams = new URLSearchParams()
    
    if (category !== 'all') {
      searchParams.set('category', category)
    }
    
    // Add mobile flag for mobile devices
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      if (isMobile) {
        searchParams.set('mobile', 'true')
      }
    }
    
    const url = category === 'all' 
      ? '/products' 
      : `/products?${searchParams.toString()}`
    
    window.location.href = url
  }

  // Show loading state while detecting device
  if (!isClient) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-neutral-600">
            {loadingTimeout ? 'Loading taking longer than expected...' : 'Loading...'}
          </p>
          {connectionStatus === 'fallback' && (
            <p className="mt-2 text-sm text-yellow-600">
              Using offline mode - some features may be limited
            </p>
          )}
          {loadingTimeout && (
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg"
            >
              Reload Page
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Test Connection Status */}
      <div className="fixed top-4 right-4 z-50">
        <TestConnection />
      </div>

      {/* Placeholder Options Demo */}
      <PlaceholderDemo />



      {/* Mobile homepage - only visible on mobile devices */}
      <div className="md:hidden">
        <MobileHomepage 
          onSearch={handleSearch}
          onCategorySelect={handleCategorySelect}
        />
      </div>

      {/* Desktop homepage - only visible on desktop devices */}
      <div className="hidden md:block">
        <PullToRefresh onRefresh={() => Promise.resolve(window.location.reload())}>
          <HeroSection />
          <NewArrivalsSection />
          <ShopByCategoriesSection />
          <FashionCollectionSection />
          <ShopOurOffersSection />
          <TestimonialsSection />
          <FeaturedDealsSection />
          <NewsletterSection />
        </PullToRefresh>
      </div>
    </>
  )
} 

