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
    <section className="relative bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600 text-white overflow-hidden min-h-[60vh] sm:min-h-[80vh] lg:min-h-screen">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/hero-pattern.svg')] bg-repeat bg-[length:60px_60px]"></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-10 right-10 sm:top-20 sm:right-20 w-16 h-16 sm:w-32 sm:h-32 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-10 left-10 sm:bottom-20 sm:left-20 w-24 h-24 sm:w-48 sm:h-48 bg-primary-400/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
      
      <div className="relative w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center max-w-7xl mx-auto">
          
          {/* Left Column - Hero Content */}
          <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
            
            {/* Trust Badges - Mobile responsive */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center bg-white/15 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10">
                <Globe className="h-3 w-3 mr-1 sm:mr-1.5 text-yellow-400" />
                <span className="text-xs font-medium">Africa's #1 Marketplace</span>
              </div>
              <div className="flex items-center bg-yellow-500/15 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-yellow-400/20">
                <Star className="h-3 w-3 mr-1 sm:mr-1.5 text-yellow-400" />
                <span className="text-xs font-medium">Trusted by Millions</span>
              </div>
              <div className="flex items-center bg-green-500/15 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-green-400/20">
                <Users className="h-3 w-3 mr-1 sm:mr-1.5 text-green-400" />
                <span className="text-xs font-medium">50K+ Verified Sellers</span>
              </div>
            </div>

            {/* Main Headline - Mobile responsive */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="responsive-heading-1">
                Africa's <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500">Premier</span> Marketplace
              </h1>

              <p className="responsive-body text-white/90">
                <span className="font-semibold text-yellow-400">Trusted sellers across 34+ African countries.</span> Secure payments, fast delivery, guaranteed quality.
              </p>
            </div>

            {/* Mobile-optimized Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder="Search from 500K+ products..." 
                  className={`mobile-input text-neutral-900 placeholder-neutral-500 shadow-lg border transition-all duration-300 ${
                    isSearchFocused 
                      ? 'ring-2 ring-yellow-400/50 border-yellow-400/50' 
                      : 'border-white/20'
                  }`}
                />
                <button 
                  type="submit"
                  className="absolute right-1.5 top-1.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-3 py-1.5 rounded-md transition-all duration-300 hover:shadow-md hover:scale-105 touch-target"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
              
              {/* Quick Suggestions - Mobile responsive */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="text-white/70 text-xs">Popular:</span>
                {['iPhone', 'Samsung TV', 'Nike Shoes', 'Home Decor'].map((term) => (
                  <button 
                    key={term} 
                    type="button"
                    onClick={() => setSearchQuery(term)}
                    className="bg-white/10 hover:bg-white/20 px-2 py-1 rounded-full text-xs transition-colors border border-white/10 touch-target"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </form>

            {/* Value Propositions - Mobile responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

            {/* Call to Action - Mobile responsive */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link 
                href={{ pathname: '/products' }} 
                className="mobile-button bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105 text-center"
              >
                Start Shopping Now
              </Link>
              <Link 
                href="/become-supplier" 
                className="mobile-button bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white font-medium transition-all duration-300 border border-white/20 text-center"
              >
                Become a Seller
              </Link>
            </div>
            
          </div>

          {/* Right Column - Hero Image - Mobile responsive */}
          <div className="relative order-1 lg:order-2">
            <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop&crop=center"
                alt="NubiaGo Marketplace - Africa's Premier E-commerce Platform"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Overlay for better text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
              
              {/* Floating Product Cards - Mobile responsive */}
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 lg:top-8 lg:right-8 bg-white/95 backdrop-blur-sm rounded-xl p-2 sm:p-3 lg:p-4 shadow-xl">
                <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs lg:text-sm font-semibold text-gray-900">Trending Now</p>
                    <p className="text-xs text-gray-600">500K+ Products</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 lg:bottom-8 lg:left-8 bg-white/95 backdrop-blur-sm rounded-xl p-2 sm:p-3 lg:p-4 shadow-xl">
                <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6 text-blue-600" />
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

{{ ... }}

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

      {/* Unified Responsive Homepage */}
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
    </>
  )
}
