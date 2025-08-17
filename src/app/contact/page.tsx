'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, MessageCircle, ArrowLeft, Crown, Star, Zap } from 'lucide-react'
import Link from 'next/link'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'normal'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSubmitted(true)
    } catch (err) {
      console.error('Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const contactMethods = [
    {
      title: 'Email Support',
      icon: Mail,
      primary: 'support@nubiago.com',
      secondary: 'sales@nubiago.com',
      description: 'Response within 2 hours',
      premium: true,
      color: 'bg-amber-100 text-amber-700'
    },
    {
      title: 'Phone Support',
      icon: Phone,
      primary: '+234 123 456 7890',
      secondary: '+234 987 654 3210',
      description: '24/7 Support',
      premium: true,
      color: 'bg-amber-100 text-amber-700'
    },
    {
      title: 'Office Address',
      icon: MapPin,
      primary: '123 Innovation Drive',
      secondary: 'Victoria Island, Lagos, Nigeria',
      description: 'Main Headquarters',
      premium: false,
      color: 'bg-gray-100 text-gray-700'
    },
    {
      title: 'Business Hours',
      icon: Clock,
      primary: 'Monday - Friday: 8:00 AM - 6:00 PM',
      secondary: 'Saturday: 9:00 AM - 4:00 PM',
      description: 'Support Available 24/7',
      premium: false,
      color: 'bg-gray-100 text-gray-700'
    }
  ]

  const quickActions = [
    {
      title: 'Track Order',
      icon: MessageCircle,
      description: 'Get real-time updates on your order status',
      href: '/orders',
      premium: true
    },
    {
      title: 'Live Chat',
      icon: MessageCircle,
      description: 'Chat with our support team instantly',
      href: '/chat',
      premium: true
    },
    {
      title: 'FAQ Center',
      icon: MessageCircle,
      description: 'Find answers to common questions',
      href: '/faq',
      premium: false
    }
  ]

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
            <div className="inline-flex items-center px-3 py-1 bg-amber-50 text-amber-700 text-sm font-medium rounded-full mb-4 border border-amber-200">
              <Crown className="w-4 h-4 mr-2" />
              Premium Support
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              We'd love to hear from you. Our premium support team is here to help with any questions about our products, services, or your account.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon
              return (
                <Link
                  key={index}
                  href={action.href}
                  className={`p-5 rounded-md border transition-colors text-center ${
                    action.premium 
                      ? 'bg-amber-50 border-amber-200 hover:bg-amber-100' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {action.premium && (
                    <div className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded mb-3">
                      <Star className="w-3 h-3 mr-1" />
                      Premium
                    </div>
                  )}
                  <div className={`w-10 h-10 rounded flex items-center justify-center mx-auto mb-3 ${
                    action.premium ? 'bg-amber-200' : 'bg-gray-200'
                  }`}>
                    <IconComponent className="h-5 w-5 text-gray-600" />
                  </div>
                  <h3 className={`text-base font-medium mb-2 ${
                    action.premium ? 'text-amber-800' : 'text-gray-700'
                  }`}>
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {action.description}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Contact Information
              </h2>
              <p className="text-base text-gray-600">
                Have a question or need help? Our dedicated support team is here to provide assistance with any questions about our products, services, or your account.
              </p>
            </div>

            <div className="space-y-4">
              {contactMethods.map((method, index) => {
                const IconComponent = method.icon
                return (
                  <div key={index} className={`p-5 rounded-md border ${
                    method.premium ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-start space-x-4">
                      <div className={`w-10 h-10 rounded flex items-center justify-center ${
                        method.premium ? 'bg-amber-200' : 'bg-gray-200'
                      }`}>
                        <IconComponent className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{method.title}</h3>
                          {method.premium && (
                            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">Premium</span>
                          )}
                        </div>
                        <p className="text-gray-700 mb-1 font-medium">{method.primary}</p>
                        <p className="text-gray-600 mb-1">{method.secondary}</p>
                        <p className="text-sm text-gray-500">{method.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* FAQ Section */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">How do I track my order?</h4>
                  <p className="text-sm text-gray-600">
                    You can track your order by logging into your account and visiting the Orders section, or by using the tracking number provided in your order confirmation email.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">What is your return policy?</h4>
                  <p className="text-sm text-gray-600">
                    We offer a 30-day return policy for most items. Products must be in their original condition with all packaging intact.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">How can I become a seller?</h4>
                  <p className="text-sm text-gray-600">
                    To become a seller, visit our supplier registration page and complete the application process. We'll review your application within 2-3 business days.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 p-6 rounded-md border border-gray-200">
            {isSubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Message Sent Successfully!</h3>
                <p className="text-gray-600 mb-6">
                  Thank you for your message. Our premium support team will get back to you within 2 hours.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false)
                    setFormData({ name: '', email: '', subject: '', message: '', priority: 'normal' })
                  }}
                  className="bg-amber-600 text-white px-6 py-3 rounded-md font-medium hover:bg-amber-700 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-amber-100 rounded flex items-center justify-center">
                    <Send className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Send us a Message</h2>
                    <p className="text-gray-600">We'll respond within 2 hours</p>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="What is this about?"
                    />
                  </div>

                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                      Priority Level
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-amber-600 text-white font-medium py-3 px-6 rounded-md hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Customer Service CTA */}
        <div className="mt-12 bg-gradient-to-r from-amber-50 to-amber-100 rounded-md p-8 border border-amber-200">
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1 bg-amber-500 text-white text-sm font-medium rounded-full mb-4">
              <MessageCircle className="w-4 h-4 mr-2" />
              Customer Service
            </div>
            <h2 className="text-2xl font-semibold text-amber-900 mb-4">
              Need Help with Your Order?
            </h2>
            <p className="text-amber-800 mb-6 max-w-2xl mx-auto">
              Our customer service team is here to help with orders, returns, product questions, and any other shopping assistance you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/orders"
                className="inline-flex items-center px-6 py-3 bg-amber-600 text-white font-medium rounded-md hover:bg-amber-700 transition-colors"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Track My Order
              </Link>
              <Link
                href="/returns"
                className="inline-flex items-center px-6 py-3 bg-white text-amber-700 font-medium rounded-md border border-amber-300 hover:bg-amber-50 transition-colors"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Return Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
