'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, ChevronRight, MessageCircle, Phone, Mail, ShoppingBag, CreditCard, Truck, Shield, HelpCircle, ArrowLeft, Crown, Star, Zap } from 'lucide-react'

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    {
      title: 'Getting Started',
      icon: ShoppingBag,
      description: 'Learn how to create an account and make your first purchase',
      premium: false,
      articles: [
        'How to create an account',
        'Making your first purchase',
        'Understanding product listings',
        'Account verification process'
      ]
    },
    {
      title: 'Orders & Shipping',
      icon: Truck,
      description: 'Track orders, understand shipping options, and delivery times',
      premium: true,
      articles: [
        'How to track your order',
        'Shipping options and costs',
        'Delivery timeframes',
        'International shipping'
      ]
    },
    {
      title: 'Payments & Billing',
      icon: CreditCard,
      description: 'Payment methods, refunds, and billing questions',
      premium: false,
      articles: [
        'Accepted payment methods',
        'How to request a refund',
        'Understanding charges',
        'Payment security'
      ]
    },
    {
      title: 'Account & Security',
      icon: Shield,
      description: 'Manage your account settings and security preferences',
      premium: true,
      articles: [
        'Updating your profile',
        'Password and security',
        'Privacy settings',
        'Two-factor authentication'
      ]
    }
  ]

  const popularArticles = [
    { title: 'How to track your order', premium: true, views: '2.4k' },
    { title: 'Return and refund policy', premium: false, views: '1.8k' },
    { title: 'Payment methods accepted', premium: true, views: '3.1k' },
    { title: 'Contact seller directly', premium: false, views: '2.7k' },
    { title: 'Report a problem', premium: false, views: '1.9k' }
  ]

  const quickActions = [
    { title: 'Track Order', icon: Truck, href: '/orders', premium: true },
    { title: 'Request Refund', icon: Shield, href: '/refunds', premium: false },
    { title: 'Contact Support', icon: MessageCircle, href: '/contact', premium: false },
    { title: 'Live Chat', icon: MessageCircle, href: '/chat', premium: true }
  ]

  const filteredCategories = categories.filter(category => 
    selectedCategory === 'all' || category.title.toLowerCase().includes(selectedCategory.toLowerCase()) ||
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.articles.some(article => 
      article.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-6 text-base"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
          
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Help Center
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Find answers to common questions and get support for your NubiaGo experience.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-lg mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
                <input
                  type="text"
                  placeholder="Search help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="p-5 bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors text-center"
              >
                <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center mx-auto mb-3">
                  <action.icon className="h-5 w-5 text-gray-600" />
                </div>
                <span className="text-base font-medium text-gray-700">
                  {action.title}
                </span>
                {action.premium && (
                  <div className="mt-2">
                    <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Premium</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Popular Articles */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Popular Articles</h2>
          <div className="space-y-3">
            {popularArticles.map((article, index) => (
              <Link
                key={index}
                href={`/help/${article.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-base font-medium text-gray-700">{article.title}</span>
                  {article.premium && (
                    <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Premium</span>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{article.views} views</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded text-base font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Topics
            </button>
            {categories.map((category) => (
              <button
                key={category.title}
                onClick={() => setSelectedCategory(category.title)}
                className={`px-4 py-2 rounded text-base font-medium transition-colors ${
                  selectedCategory === category.title
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.title}
              </button>
            ))}
          </div>
        </div>

        {/* Help Categories */}
        <div className="mb-10">
          <div className="space-y-5">
            {filteredCategories.map((category, index) => {
              const IconComponent = category.icon
              return (
                <div key={index} className="border border-gray-200 rounded-md p-6">
                  <div className="flex items-start space-x-4 mb-5">
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {category.title}
                        </h3>
                        {category.premium && (
                          <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Premium</span>
                        )}
                      </div>
                      <p className="text-base text-gray-600">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {category.articles.map((article, articleIndex) => (
                      <Link
                        key={articleIndex}
                        href={`/help/${article.toLowerCase().replace(/\s+/g, '-')}`}
                        className="flex items-center justify-between p-3 rounded hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-base text-gray-700">
                          {article}
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gray-50 rounded-md p-8 border border-gray-200">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Still Need Help?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="w-14 h-14 bg-gray-200 rounded flex items-center justify-center mx-auto mb-3">
                  <Mail className="h-7 w-7 text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Email Support</h3>
                <p className="text-base text-gray-600">support@nubiago.com</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-gray-200 rounded flex items-center justify-center mx-auto mb-3">
                  <Phone className="h-7 w-7 text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Phone Support</h3>
                <p className="text-base text-gray-600">+234 123 456 7890</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-gray-200 rounded flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="h-7 w-7 text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Live Chat</h3>
                <p className="text-base text-gray-600">Available 24/7</p>
              </div>
            </div>
            
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors text-lg"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 
