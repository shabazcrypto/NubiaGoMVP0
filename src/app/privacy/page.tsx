import Link from 'next/link'
import { ArrowLeft, Shield, User, Eye, Lock, CheckCircle, AlertTriangle } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-6 text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full mb-4 border border-blue-200">
              <Shield className="w-4 h-4 mr-2" />
              Privacy & Security
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600">
              Last updated: December 15, 2024
            </p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Introduction */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <Shield className="h-4 w-4 text-blue-600" />
                </div>
                Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                At NubiaGo, we are committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy explains how we collect, use, and safeguard your data.
              </p>
            </div>

            {/* Information We Collect */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <User className="h-4 w-4 text-green-600" />
                </div>
                What We Collect
              </h2>
              
              <div className="space-y-3">
                <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded">
                  <h3 className="font-semibold text-gray-900 mb-1">Personal Information</h3>
                  <p className="text-gray-700 text-sm">Name, email, phone, address, payment details</p>
                </div>

                <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded">
                  <h3 className="font-semibold text-gray-900 mb-1">Usage Data</h3>
                  <p className="text-gray-700 text-sm">Pages visited, search queries, purchase history</p>
                </div>

                <div className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded">
                  <h3 className="font-semibold text-gray-900 mb-1">Device Info</h3>
                  <p className="text-gray-700 text-sm">IP address, browser type, operating system</p>
                </div>
              </div>
            </div>

            {/* How We Use Information */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                  <CheckCircle className="h-4 w-4 text-indigo-600" />
                </div>
                How We Use It
              </h2>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded">
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">Service Provision</h3>
                  <p className="text-gray-700 text-xs">Process orders, provide support</p>
                </div>

                <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded">
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">Platform Improvement</h3>
                  <p className="text-gray-700 text-xs">Enhance user experience</p>
                </div>

                <div className="p-3 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded">
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">Security</h3>
                  <p className="text-gray-700 text-xs">Fraud prevention, protection</p>
                </div>

                <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded">
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">Communication</h3>
                  <p className="text-gray-700 text-xs">Updates, notifications</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Data Security */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                  <Lock className="h-4 w-4 text-emerald-600" />
                </div>
                Data Security
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded">
                  <Lock className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Encryption</h3>
                    <p className="text-gray-700 text-xs">SSL/TLS protocols for all data</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Access Controls</h3>
                    <p className="text-gray-700 text-xs">Strict authentication mechanisms</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Regular Audits</h3>
                    <p className="text-gray-700 text-xs">Security testing & monitoring</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Rights */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                  <CheckCircle className="h-4 w-4 text-amber-600" />
                </div>
                Your Rights
              </h2>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">Access your personal data</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">Update or correct information</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">Delete your account</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">Opt-out of communications</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">Request data portability</span>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                Important
              </h2>
              
              <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded">
                <h3 className="font-semibold text-gray-900 mb-2">We Never Sell Your Data</h3>
                <p className="text-gray-700 text-sm">
                  We do not sell, trade, or rent your personal information to third parties for marketing purposes.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                Contact Us
              </h2>
              
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@nubiago.com
                </p>
                <p className="text-gray-700">
                  <strong>Phone:</strong> +234 123 456 7890
                </p>
                <p className="text-gray-700">
                  <strong>Address:</strong> 123 Innovation Drive, Lagos, Nigeria
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="text-gray-600 hover:text-gray-800 transition-colors text-center"
            >
              Contact Us
            </Link>
            <span className="text-gray-400 hidden sm:inline">•</span>
            <Link 
              href="/terms" 
              className="text-gray-600 hover:text-gray-800 transition-colors text-center"
            >
              Terms of Service
            </Link>
            <span className="text-gray-400 hidden sm:inline">•</span>
            <Link 
              href="/help" 
              className="text-gray-600 hover:text-gray-800 transition-colors text-center"
            >
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 
