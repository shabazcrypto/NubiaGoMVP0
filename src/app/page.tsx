'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ImageWithFallback } from '@/components/ui/image-with-fallback'
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
  Globe
} from 'lucide-react'
import PullToRefresh from '@/components/mobile/PullToRefresh'
import MobileHomepage from '@/components/mobile/MobileHomepage'
import { useEffect, useState } from 'react'
import TestConnection from './test-connection'

// ============================================================================
// HERO SECTION
// ============================================================================

function HeroSection() {
  return (
    <section className="bg-primary-600 text-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-3 gap-12 items-start">
          {/* Categories Sidebar */}
          <div className="bg-white rounded-2xl p-8 shadow-elevated">
            <h3 className="text-xl font-semibold text-neutral-900 mb-8">Browse Categories</h3>
            <div className="space-y-4">
              <Link href="/products?category=Electronics" className="flex items-center space-x-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200 cursor-pointer">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Laptop className="h-5 w-5 text-primary-600" />
                </div>
                <span className="text-neutral-700 font-medium">Electronics</span>
              </Link>
              <Link href="/products?category=Fashion" className="flex items-center space-x-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200 cursor-pointer">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Shirt className="h-5 w-5 text-yellow-600" />
                </div>
                <span className="text-neutral-700 font-medium">Fashion</span>
              </Link>
              <Link href="/products?category=Home & Living" className="flex items-center space-x-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200 cursor-pointer">
                <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
                  <Home className="h-5 w-5 text-neutral-600" />
                </div>
                <span className="text-neutral-700 font-medium">Home & Living</span>
              </Link>
              <Link href="/products?category=Health & Beauty" className="flex items-center space-x-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200 cursor-pointer">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <HealthIcon className="h-5 w-5 text-yellow-600" />
                </div>
                <span className="text-neutral-700 font-medium">Health & Beauty</span>
              </Link>
              <Link href="/products?category=Sports" className="flex items-center space-x-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200 cursor-pointer">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Dumbbell className="h-5 w-5 text-primary-600" />
                </div>
                <span className="text-neutral-700 font-medium">Sports</span>
              </Link>
              <Link href="/products?category=Books" className="flex items-center space-x-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200 cursor-pointer">
                <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-neutral-600" />
                </div>
                <span className="text-neutral-700 font-medium">Books</span>
              </Link>
            </div>
          </div>

          {/* Hero Content */}
          <div className="lg:col-span-2">
            <div className="flex flex-wrap gap-3 mb-8">
              <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                Global 34+ Countries in Africa
              </span>
              <span className="bg-yellow-500/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-yellow-800">
                Star Best Quality Products
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Find what you need, 
              <span className="text-yellow-400">faster!</span>
            </h1>

            <p className="text-xl text-white/90 mb-8 max-w-2xl">
              Shop everyday essentials from trusted sellers across Africa — simple, quick, and reliable.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mb-8">
              <input type="text" 
                     placeholder="e.g., smartphone, lipstick, washing machine..." 
                     className="w-full px-6 py-4 pr-16 rounded-full text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-4 focus:ring-white/20" />
              <button className="absolute right-2 top-2 bg-primary-600 text-white p-2 rounded-full">
                <Search className="h-5 w-5" />
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">10M+</div>
                <div className="text-white/80 text-sm">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">500K+</div>
                <div className="text-white/80 text-sm">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">34+</div>
                <div className="text-white/80 text-sm">Countries</div>
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
      image: '/product-tech-1.jpg',
      badge: 'New'
    },
    {
      id: '2',
      name: 'Organic Cotton T-Shirt',
      price: '$45K',
      image: '/product-fashion-1.jpg',
      badge: 'Hot'
    },
    {
      id: '3',
      name: 'Complete Skincare Set',
      price: '$32K',
      image: '/product-tech-1.jpg',
      badge: 'Hot'
    },
    {
      id: '4',
      name: 'Smart Fitness Watch',
      price: '$120K',
      image: '/product-accessories-1.jpg',
      badge: 'New'
    },
    {
      id: '5',
      name: 'Modern Wall Art',
      price: '$28K',
      image: '/product-lifestyle-1.jpg',
      badge: 'Hot'
    },
    {
      id: '6',
      name: 'Designer Sunglasses',
      price: '$65K',
      image: '/product-home-1.jpg',
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
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
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
          <Link href="/products" className="inline-flex items-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-2xl shadow-medium">
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
              image: '/category-electronics.jpg',
      count: '750+ Products',
      href: '/products?category=Women'
    },
    {
      id: 2,
      name: 'Men',
              image: '/category-men.jpg',
      count: '600+ Products',
      href: '/products?category=Men'
    },
    {
      id: 3,
      name: 'Mother & Child',
              image: '/category-mother-child.jpg',
      count: '450+ Products',
      href: '/products?category=Mother & Child'
    },
    {
      id: 4,
      name: 'Home & Living',
              image: '/category-home-living.jpg',
      count: '500+ Products',
      href: '/products?category=Home & Living'
    },
    {
      id: 5,
      name: 'Cosmetics',
              image: '/product-lipstick-1.jpg',
      count: '400+ Products',
      href: '/products?category=Cosmetics'
    },
    {
      id: 6,
      name: 'Shoes & Bags',
              image: '/category-shoes-bags.jpg',
      count: '350+ Products',
      href: '/products?category=Shoes & Bags'
    },
    {
      id: 7,
      name: 'Electronics',
              image: '/category-electronics-2.jpg',
      count: '600+ Products',
      href: '/products?category=Electronics'
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Shop by Categories</h2>
          <p className="text-lg text-gray-600">Explore our wide range of product categories</p>
        </div>

        <div className="grid grid-cols-6 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-8 text-white">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                      <Laptop className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                    <p className="text-white/80">{category.count}</p>
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
              <Link href="/products?category=Fashion" className="group relative aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Image
                  src="/ui-logo-1.jpg"
                  alt="Denim Jacket"
                  width={120}
                  height={120}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link href="/products?category=Fashion" className="group relative aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Image
                  src="/ui-logo-2.jpg"
                  alt="Casual Wear"
                  width={120}
                  height={120}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link href="/products?category=Fashion" className="group relative aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Image
                  src="/ui-logo-3.jpg"
                  alt="Sneakers"
                  width={120}
                  height={120}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link href="/products?category=Fashion" className="group relative aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Image
                  src="/ui-logo-4.jpg"
                  alt="Accessories"
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
              <Link href="/products?category=Fashion" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
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
              <Link href="/products?category=Fashion">
                <Image
                  src="/ui-hero-banner.jpg"
                  alt="Fashion Collection Showcase"
                  width={700}
                  height={500}
                  className="w-full h-[500px] lg:h-[600px] object-cover group-hover:scale-105 transition-transform duration-700"
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
              image: '/product-bag-2.jpg',
      badge: 'Sale'
    },
    {
      id: 2,
      title: 'Superhero T-Shirt Set',
      category: 'Boys Clothing',
      price: '$18.99',
      originalPrice: '$29.99',
              image: '/product-watch-3.jpg',
      badge: 'Sale'
    },
    {
      id: 3,
      title: 'Rainbow Sneakers',
      category: 'Kids Shoes',
      price: '$32.99',
      originalPrice: '$49.99',
              image: '/product-logo-1.jpg',
      badge: 'Sale'
    },
    {
      id: 4,
      title: 'Cute Animal Romper',
      category: 'Baby Clothing',
      price: '$16.99',
      originalPrice: '$24.99',
              image: '/product-clothing-1.jpg',
      badge: 'Sale'
    },
    {
      id: 5,
      title: 'Cozy Winter Jacket',
      category: 'Winter Wear',
      price: '$45.99',
              image: '/product-brand-1.jpg',
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
                  src={offer.image}
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
                  <div className="w-4 h-4 bg-blue-300 rounded-full border-2 border-gray-200"></div>
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
              avatar: '/avatar-user-5.jpg',
      content: 'Amazing quality products and lightning-fast delivery! The customer service is exceptional.',
      rating: 5,
      location: 'Lagos, Nigeria'
    },
    {
      id: 2,
      name: 'David Chen',
      role: 'Tech Professional',
              avatar: '/avatar-user-2.jpg',
      content: 'Found exactly what I was looking for at great prices. Highly recommend this platform!',
      rating: 5,
      location: 'Nairobi, Kenya'
    },
    {
      id: 3,
      name: 'Amina Hassan',
      role: 'Home Decor Lover',
              avatar: '/avatar-user-3.jpg',
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
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={60}
                  height={60}
                  className="w-15 h-15 rounded-full object-cover"
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
              image: '/category-electronics.jpg',
      href: '/products?sale=flash',
      badge: 'Hot',
      endTime: '2 days left'
    },
    {
      id: 2,
      title: 'New Arrivals',
      subtitle: 'Fresh Collection',
      description: 'Latest trends and styles',
              image: '/category-men.jpg',
      href: '/products?new=true',
      badge: 'New',
      endTime: 'Limited stock'
    },
    {
      id: 3,
      title: 'Clearance Sale',
      subtitle: 'Final Reduction',
      description: 'Last chance to grab amazing deals',
              image: '/category-home-living.jpg',
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
          <Link href="/products" className="flex items-center space-x-2 text-gray-900 font-semibold hover:text-primary-600 transition-colors mt-4 lg:mt-0">
            View All Deals
            →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {deals.map((deal) => (
            <Link key={deal.id} href={deal.href} className="group relative overflow-hidden rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-3">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={deal.image}
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

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    if (category === 'all') {
      window.location.href = '/products'
    } else {
      window.location.href = `/products?category=${encodeURIComponent(category)}`
    }
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
