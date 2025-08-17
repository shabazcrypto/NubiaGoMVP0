'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Users, TrendingUp, Shield, Truck, Globe, Award, Zap, Building, Target, DollarSign, BarChart3, ArrowRight } from 'lucide-react'

export default function BecomeSupplierPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Market Access',
      description: 'Reach millions of customers across Africa'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Enterprise-grade payment processing'
    },
    {
      icon: Truck,
      title: 'Logistics Support',
      description: 'Integrated shipping and fulfillment'
    },
    {
      icon: Globe,
      title: 'Global Expansion',
      description: 'Scale internationally with confidence'
    }
  ]

  const requirements = [
    'Valid business registration',
    'Quality product standards',
    'Reliable shipping capability',
    'Customer service commitment',
    'Regular inventory updates',
    'Platform policy compliance'
  ]

  const steps = [
    {
      number: '01',
      title: 'Apply',
      description: 'Submit your business application'
    },
    {
      number: '02',
      title: 'Review',
      description: 'We verify your information'
    },
    {
      number: '03',
      title: 'Setup',
      description: 'Access your supplier dashboard'
    },
    {
      number: '04',
      title: 'Launch',
      description: 'Begin selling immediately'
    }
  ]

  const stats = [
    { number: '10K+', label: 'Active Suppliers', icon: Building },
    { number: '50M+', label: 'Products Sold', icon: Target },
    { number: '$500M+', label: 'Revenue Generated', icon: DollarSign },
    { number: '99.9%', label: 'Platform Uptime', icon: BarChart3 }
  ]

  const navigationTabs = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'benefits', label: 'Benefits', icon: Award },
    { id: 'requirements', label: 'Requirements', icon: CheckCircle },
    { id: 'process', label: 'Process', icon: Zap }
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-20">
          <Link 
            href="/" 
            className="inline-flex items-center text-slate-600 hover:text-slate-800 transition-colors mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Home</span>
          </Link>
          
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full mb-6 border border-blue-100">
              <Building className="w-4 h-4 mr-2" />
              Enterprise Partnership
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-800 mb-6 leading-tight">
              Become a Supplier
            </h1>
            
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
              Join thousands of successful suppliers and scale your business with our enterprise platform
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-slate-800 mb-2">{stat.number}</div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </div>
            )
          })}
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Vertical Navigation Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-6 px-2">Quick Navigation</h3>
              <nav className="space-y-2">
                {navigationTabs.map((tab) => {
                  const IconComponent = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-blue-50 border border-blue-200 text-blue-700 shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      <IconComponent className={`h-5 w-5 ${
                        activeTab === tab.id ? 'text-blue-600' : 'text-slate-500'
                      }`} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
              
              {/* CTA in Sidebar */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <Link
                  href="/register/supplier"
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
                >
                  <Award className="h-4 w-4 mr-2" />
                  Apply Now
                </Link>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-h-[600px]">
            {activeTab === 'overview' && (
              <div className="space-y-16">
                <div className="text-center max-w-3xl mx-auto">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-8 shadow-sm">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-800 mb-6">Why Choose NubiaGo?</h2>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    Access enterprise-grade tools, infrastructure, and support to scale your business efficiently. 
                    Focus on what you do best while we handle the platform complexity.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {benefits.map((benefit, index) => {
                    const IconComponent = benefit.icon
                    return (
                      <div key={index} className="text-center">
                        <div className="mx-auto flex items-center justify-center h-14 w-14 bg-slate-100 rounded-xl mb-6 border border-slate-200">
                          <IconComponent className="h-7 w-7 text-slate-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-3">{benefit.title}</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">{benefit.description}</p>
                      </div>
                    )
                  })}
                </div>

                <div className="text-center pt-8">
                  <Link
                    href="/register/supplier"
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
                  >
                    <Award className="h-5 w-5 mr-2" />
                    Start Application
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'benefits' && (
              <div className="space-y-12">
                <h2 className="text-3xl font-bold text-slate-800 mb-12">Platform Benefits</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800 mb-2">Zero Setup Costs</h3>
                          <p className="text-slate-600">Start selling immediately with no upfront fees</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                          <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800 mb-2">Marketing Tools</h3>
                          <p className="text-slate-600">Advanced analytics and promotional capabilities</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800 mb-2">Secure Payments</h3>
                          <p className="text-slate-600">Enterprise-grade payment processing</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Truck className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800 mb-2">Logistics Support</h3>
                          <p className="text-slate-600">Comprehensive shipping and fulfillment services</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Globe className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800 mb-2">Global Reach</h3>
                          <p className="text-slate-600">International marketplace access</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                          <BarChart3 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800 mb-2">Performance Analytics</h3>
                          <p className="text-slate-600">Real-time sales and performance metrics</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'requirements' && (
              <div className="space-y-12">
                <h2 className="text-3xl font-bold text-slate-800 mb-12">Requirements</h2>
                
                <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-800 mb-6">Basic Requirements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {requirements.map((requirement, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-slate-700">{requirement}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                  <h3 className="text-xl font-semibold text-slate-800 mb-6">What We Value</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ul className="space-y-3 text-slate-700">
                      <li className="flex items-start space-x-3">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Quality products meeting enterprise standards</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Reliable shipping and fulfillment capabilities</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Excellent customer service commitment</span>
                      </li>
                    </ul>
                    <ul className="space-y-3 text-slate-700">
                      <li className="flex items-start space-x-3">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Competitive pricing and market knowledge</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Adaptability and growth mindset</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Platform policy compliance</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'process' && (
              <div className="space-y-12">
                <h2 className="text-3xl font-bold text-slate-800 mb-12">Application Process</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {steps.map((step, index) => (
                    <div key={index} className="text-center">
                      <div className="mx-auto flex items-center justify-center h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-6 shadow-sm">
                        <span className="text-2xl font-bold text-white">{step.number}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-3">{step.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
                    </div>
                  ))}
                </div>

                <div className="text-center pt-12">
                  <Link
                    href="/register/supplier"
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
                  >
                    <Zap className="h-5 w-5 mr-2" />
                    Apply Now
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-white rounded-2xl border border-slate-200 p-16 shadow-sm">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Ready to Scale?</h2>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              Join thousands of successful suppliers who have transformed their businesses with our platform
            </p>
            <Link
              href="/register/supplier"
              className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
            >
              Start Your Application
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 
