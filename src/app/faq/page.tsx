'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle, MessageCircle, Phone, Mail, Search, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedItems, setExpandedItems] = useState<number[]>([])

  const faqs = [
    {
      id: 1,
      category: "Account & Registration",
      question: "How do I create an account?",
      answer: "Creating an account is simple! Click the 'Sign Up' button in the top navigation, fill in your details, and verify your email address. You'll be ready to start shopping in minutes.",
      premium: false
    },
    {
      id: 2,
      category: "Selling",
      question: "How do I become a seller?",
      answer: "To become a seller, click on 'Become a Seller' in the navigation menu. You'll need to provide business information, verify your identity, and complete our seller onboarding process. Once approved, you can start listing your products.",
      premium: true
    },
    {
      id: 3,
      category: "Payment",
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), debit cards, and digital wallets like PayPal. We also support bank transfers for larger orders. All payments are processed securely through our trusted payment partners.",
      premium: false
    },
    {
      id: 4,
      category: "Shipping",
      question: "How long does shipping take?",
      answer: "Shipping times vary by location and seller. Most orders ship within 1-3 business days, and delivery typically takes 3-7 business days for domestic orders. International shipping may take 7-14 business days. You can track your order status in your account dashboard.",
      premium: true
    },
    {
      id: 5,
      category: "Returns",
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for most items. Products must be in original condition with all packaging intact. Some items may have different return policies based on the seller. Please check the product page for specific return information.",
      premium: false
    },
    {
      id: 6,
      category: "Support",
      question: "How do I contact customer support?",
      answer: "Our customer support team is available 24/7. You can reach us through the contact form on our website, email us at support@nubiago.com, or call our toll-free number. We typically respond within 2 hours during business hours.",
      premium: false
    },
    {
      id: 7,
      category: "Product Quality",
      question: "Are the products authentic?",
      answer: "Yes! We work only with verified sellers and authentic products. All sellers go through a rigorous verification process, and we have strict quality control measures in place. If you ever receive a counterfeit item, we offer a full refund and will investigate the seller.",
      premium: true
    },
    {
      id: 8,
      category: "International",
      question: "Do you ship internationally?",
      answer: "Yes, we ship to most countries worldwide. International shipping rates and delivery times vary by location. You can check shipping availability and costs during checkout by entering your shipping address.",
      premium: false
    },
    {
      id: 9,
      category: "Tracking",
      question: "How do I track my order?",
      answer: "Once your order ships, you'll receive a tracking number via email. You can also track your order by logging into your account and visiting the 'My Orders' section. Real-time tracking updates are provided by our shipping partners.",
      premium: true
    },
    {
      id: 10,
      category: "Returns",
      question: "What if I receive a damaged item?",
      answer: "If you receive a damaged item, please take photos of the damage and contact our customer support team immediately. We'll arrange for a replacement or refund. In most cases, we'll provide a prepaid return label for damaged items.",
      premium: false
    }
  ]

  const categories = [...new Set(faqs.map(faq => faq.category))]

  const toggleItem = (id: number) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

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
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Find comprehensive answers to common questions about shopping and selling on our platform
            </p>
            
            {/* Search Bar */}
            <div className="max-w-lg mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
                <input
                  type="text"
                  placeholder="Search FAQ topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Browse by Category</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded text-base font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded text-base font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Questions & Answers</h2>
          <div className="space-y-4">
            {filteredFaqs.map((faq) => (
              <div key={faq.id} className="border border-gray-200 rounded-md overflow-hidden">
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full p-5 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {faq.question}
                        </h3>
                        {faq.premium && (
                          <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Premium</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Category: {faq.category}
                      </p>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    {expandedItems.includes(faq.id) ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </button>
                
                {expandedItems.includes(faq.id) && (
                  <div className="p-5 bg-white border-t border-gray-200">
                    <p className="text-base text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
              <p className="text-gray-600">Try adjusting your search or category filter</p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">FAQ Overview</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-md p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">{faqs.length}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            <div className="bg-gray-50 rounded-md p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">{categories.length}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="bg-gray-50 rounded-md p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">{faqs.filter(f => f.premium).length}</div>
              <div className="text-sm text-gray-600">Premium Topics</div>
            </div>
            <div className="bg-gray-50 rounded-md p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">24/7</div>
              <div className="text-sm text-gray-600">Support Available</div>
            </div>
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
