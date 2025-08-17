'use client'

import { Home, ArrowLeft, Search, ShoppingBag, Users, MapPin, Compass } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Number */}
        <div className="text-8xl font-light text-gray-300 mb-6">404</div>
        
        {/* Title */}
        <h1 className="text-3xl font-medium text-gray-900 mb-4">Page Not Found</h1>
        
        {/* Description */}
        <p className="text-lg text-gray-600 leading-relaxed max-w-md mx-auto mb-12">
          The page you're looking for doesn't exist or has been moved. 
          Please check the URL or navigate to one of our main pages.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4 mb-12">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link
              href="/products"
              className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 group"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center mr-3 group-hover:bg-gray-200">
                <ShoppingBag className="h-4 w-4 text-gray-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Products</div>
                <div className="text-sm text-gray-500">Browse catalog</div>
              </div>
            </Link>
            
            <Link
              href="/about"
              className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 group"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center mr-3 group-hover:bg-gray-200">
                <Users className="h-4 w-4 text-gray-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">About</div>
                <div className="text-sm text-gray-500">Our company</div>
              </div>
            </Link>
            
            <Link
              href="/contact"
              className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 group"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center mr-3 group-hover:bg-gray-200">
                <MapPin className="h-4 w-4 text-gray-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Contact</div>
                <div className="text-sm text-gray-500">Get in touch</div>
              </div>
            </Link>
            
            <Link
              href="/faq"
              className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 group"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center mr-3 group-hover:bg-gray-200">
                <Compass className="h-4 w-4 text-gray-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">FAQ</div>
                <div className="text-sm text-gray-500">Find answers</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="mt-8">
          <p className="text-gray-600 mb-3">Or search for what you need:</p>
          <div className="relative max-w-sm mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search our website..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
} 
