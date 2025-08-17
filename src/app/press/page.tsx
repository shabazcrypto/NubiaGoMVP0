'use client'

import Link from 'next/link'
import { Calendar, Download, ExternalLink, FileText, Users, TrendingUp, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react'

export default function PressPage() {
  const pressReleases = [
    {
      title: 'NubiaGo Launches New Mobile App',
      date: 'March 15, 2024',
      summary: 'NubiaGo announces the launch of its new mobile application, making it easier for customers to shop and suppliers to manage their stores.',
      category: 'Product Launch',
      url: '#'
    },
    {
      title: 'Partnership with Major African Retailers',
      date: 'February 28, 2024',
      summary: 'NubiaGo forms strategic partnerships with leading retailers across Africa to expand its marketplace reach.',
      category: 'Partnership',
      url: '#'
    },
    {
      title: 'Series A Funding Round Completed',
      date: 'January 10, 2024',
      summary: 'NubiaGo secures $5M in Series A funding to accelerate growth and expand operations across Africa.',
      category: 'Funding',
      url: '#'
    },
    {
      title: 'NubiaGo Expands to 5 New African Countries',
      date: 'December 5, 2023',
      summary: 'Strategic expansion brings NubiaGo marketplace services to customers in Ghana, Kenya, Uganda, Tanzania, and Rwanda.',
      category: 'Expansion',
      url: '#'
    },
    {
      title: 'New AI-Powered Search Technology',
      date: 'November 20, 2023',
      summary: 'Implementation of advanced AI algorithms improves product discovery and recommendation accuracy by 40%.',
      category: 'Technology',
      url: '#'
    }
  ]

  const stats = [
    { label: 'Active Users', value: '50K+', description: 'Monthly active users across Africa' },
    { label: 'Suppliers', value: '2K+', description: 'Verified business partners' },
    { label: 'Products', value: '100K+', description: 'Items available for purchase' },
    { label: 'Countries', value: '8', description: 'African markets served' }
  ]

  const mediaResources = [
    { name: 'Company Logo', type: 'Vector & PNG', size: '2.4 MB', icon: FileText },
    { name: 'Product Images', type: 'High Resolution', size: '15.2 MB', icon: FileText },
    { name: 'Team Photos', type: 'Professional Headshots', size: '8.7 MB', icon: Users },
    { name: 'Fact Sheet', type: 'PDF Document', size: '1.2 MB', icon: FileText },
    { name: 'Brand Guidelines', type: 'PDF Document', size: '3.8 MB', icon: FileText },
    { name: 'Press Kit', type: 'ZIP Archive', size: '28.5 MB', icon: Download }
  ]

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-8 text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Press & Media
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Official news, press releases, and media resources from NubiaGo. 
              For media inquiries, contact our communications team.
            </p>
          </div>
        </div>

        {/* Company Overview */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Company Overview</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-lg font-medium text-gray-900 mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Press Releases */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Press Releases</h2>
          <div className="space-y-6">
            {pressReleases.map((release, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                  <div className="flex-1 mb-4 md:mb-0">
                    <div className="flex items-center space-x-4 mb-3">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded">
                        {release.category}
                      </span>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        {release.date}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 leading-tight">
                      {release.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {release.summary}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 md:ml-8">
                    <Link 
                      href={release.url}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Read Full Release
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </Link>
                    <Link 
                      href={`${release.url}/pdf`}
                      className="inline-flex items-center text-gray-600 hover:text-gray-700 text-sm"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Media Resources */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Media Resources</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Brand Assets</h3>
              <div className="space-y-3">
                {mediaResources.slice(0, 3).map((resource, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <resource.icon className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="font-medium text-gray-900">{resource.name}</div>
                        <div className="text-sm text-gray-600">{resource.type} • {resource.size}</div>
                      </div>
                    </div>
                    <Download className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Company Information</h3>
              <div className="space-y-3">
                {mediaResources.slice(3).map((resource, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <resource.icon className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="font-medium text-gray-900">{resource.name}</div>
                        <div className="text-sm text-gray-600">{resource.type} • {resource.size}</div>
                      </div>
                    </div>
                    <Download className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t border-gray-200 pt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Media Contact</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Press Inquiries</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                For press inquiries, interviews, or additional information, 
                please contact our communications team.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <a href="mailto:press@nubiago.com" className="text-blue-600 hover:text-blue-700">
                    press@nubiago.com
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-900">+234 123 456 7890</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-900">Lagos, Nigeria</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-3">
                <Link 
                  href="/about"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-gray-900">Company Overview</span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </Link>
                <Link 
                  href="/contact"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-gray-900">General Contact</span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </Link>
                <Link 
                  href="/careers"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-gray-900">Careers</span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
