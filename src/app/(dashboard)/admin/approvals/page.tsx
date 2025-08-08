'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Shield, ArrowLeft, CheckCircle, XCircle, Eye, Clock,
  User, Building, FileText
} from 'lucide-react'
import Link from 'next/link'

interface ApprovalItem {
  id: string
  type: 'supplier' | 'product' | 'withdrawal'
  title: string
  description: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  user: {
    name: string
    email: string
  }
}

export default function AdminApprovalsPage() {
  const router = useRouter()
  const [approvals, setApprovals] = useState<ApprovalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    // Simulate loading approvals
    setTimeout(() => {
      setApprovals([
        {
          id: '1',
          type: 'supplier',
          title: 'Supplier Registration - TechStore',
          description: 'New supplier registration for TechStore electronics business',
          status: 'pending',
          createdAt: '2024-01-22T10:30:00Z',
          user: {
            name: 'John Doe',
            email: 'john@techstore.com'
          }
        },
        {
          id: '2',
          type: 'product',
          title: 'Product Approval - Wireless Headphones',
          description: 'New product submission for wireless headphones',
          status: 'pending',
          createdAt: '2024-01-21T15:45:00Z',
          user: {
            name: 'Jane Smith',
            email: 'jane@fashionhub.com'
          }
        },
        {
          id: '3',
          type: 'withdrawal',
          title: 'Withdrawal Request - $500',
          description: 'Supplier withdrawal request for $500',
          status: 'pending',
          createdAt: '2024-01-20T09:00:00Z',
          user: {
            name: 'Bob Wilson',
            email: 'bob@homegoods.com'
          }
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const approveItem = (id: string) => {
    setApprovals(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, status: 'approved' as const }
          : item
      )
    )
  }

  const rejectItem = (id: string) => {
    setApprovals(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, status: 'rejected' as const }
          : item
      )
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'supplier': return <Building className="h-5 w-5" />
      case 'product': return <FileText className="h-5 w-5" />
      case 'withdrawal': return <User className="h-5 w-5" />
      default: return <Shield className="h-5 w-5" />
    }
  }

  const filteredApprovals = approvals.filter(item => {
    if (filter === 'all') return true
    return item.status === filter
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="text-gray-400 hover:text-gray-500">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
              <p className="text-gray-600">Review and approve pending requests</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'approved', 'rejected'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === filterType
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Approvals List */}
        <div className="bg-white rounded-lg shadow">
          {filteredApprovals.length === 0 ? (
            <div className="p-8 text-center">
              <Shield className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No approvals</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all' 
                  ? 'All caught up! No pending approvals.'
                  : 'No approvals match your filter.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredApprovals.map((item) => (
                <div key={item.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getTypeIcon(item.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{item.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>By: {item.user.name}</span>
                          <span>Email: {item.user.email}</span>
                          <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.status === 'pending' && (
                        <>
                          <button
                            onClick={() => approveItem(item.id)}
                            className="flex items-center space-x-1 px-3 py-1 text-sm font-medium text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => rejectItem(item.id)}
                            className="flex items-center space-x-1 px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                      <button className="text-gray-400 hover:text-gray-600">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-semibold text-gray-900">{approvals.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {approvals.filter(a => a.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {approvals.filter(a => a.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {approvals.filter(a => a.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 