'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, Shield, Search, Filter, MoreHorizontal, 
  CheckCircle, XCircle, Eye, Edit, Store, TrendingUp,
  ArrowUpRight, ArrowDownRight, Clock, Sun, Moon, LogOut,
  BarChart3, Settings, Package, ShoppingCart, Activity,
  DollarSign, Calendar, Mail, Bell, ChevronDown, Globe,
  FileText, Download, Plus, Grid3X3, UserCheck, UserX
} from 'lucide-react'
import Link from 'next/link'

interface Supplier {
  id: string
  businessName: string
  ownerName: string
  email: string
  phone: string
  status: 'pending' | 'approved' | 'rejected'
  totalOrders: number
  totalRevenue: number
  rating: number
  joinedAt: string
  category: string
}

interface SupplierStats {
  totalSuppliers: number
  approvedSuppliers: number
  pendingSuppliers: number
  totalRevenue: number
  averageRating: number
  activeCategories: number
}

export default function SuppliersPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showMoreOptions, setShowMoreOptions] = useState<string | null>(null)

  const [stats, setStats] = useState<SupplierStats>({
    totalSuppliers: 0,
    approvedSuppliers: 0,
    pendingSuppliers: 0,
    totalRevenue: 0,
    averageRating: 0,
    activeCategories: 0
  })

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      const mockSuppliers: Supplier[] = [
        {
          id: '1',
          businessName: 'Tech Solutions Inc',
          ownerName: 'John Smith',
          email: 'john@techsolutions.com',
          phone: '+1 (555) 123-4567',
          status: 'approved',
          totalOrders: 156,
          totalRevenue: 45000,
          rating: 4.8,
          joinedAt: '2024-01-15',
          category: 'Technology'
        },
        {
          id: '2',
          businessName: 'Green Energy Co',
          ownerName: 'Sarah Johnson',
          email: 'sarah@greenenergy.com',
          phone: '+1 (555) 234-5678',
          status: 'pending',
          totalOrders: 0,
          totalRevenue: 0,
          rating: 0,
          joinedAt: '2024-03-20',
          category: 'Energy'
        },
        {
          id: '3',
          businessName: 'Fashion Forward',
          ownerName: 'Mike Davis',
          email: 'mike@fashionforward.com',
          phone: '+1 (555) 345-6789',
          status: 'approved',
          totalOrders: 89,
          totalRevenue: 32000,
          rating: 4.6,
          joinedAt: '2024-02-10',
          category: 'Fashion'
        },
        {
          id: '4',
          businessName: 'Home Decor Plus',
          ownerName: 'Lisa Wilson',
          email: 'lisa@homedecor.com',
          phone: '+1 (555) 456-7890',
          status: 'rejected',
          totalOrders: 0,
          totalRevenue: 0,
          rating: 0,
          joinedAt: '2024-03-15',
          category: 'Home & Garden'
        }
      ]
      
      setSuppliers(mockSuppliers)
      
      // Calculate stats
      const approved = mockSuppliers.filter(s => s.status === 'approved').length
      const pending = mockSuppliers.filter(s => s.status === 'pending').length
      const totalRevenue = mockSuppliers.reduce((sum, s) => sum + s.totalRevenue, 0)
      const avgRating = mockSuppliers.filter(s => s.rating > 0).reduce((sum, s) => sum + s.rating, 0) / 
                       mockSuppliers.filter(s => s.rating > 0).length || 0
      const categories = new Set(mockSuppliers.map(s => s.category)).size
      
      setStats({
        totalSuppliers: mockSuppliers.length,
        approvedSuppliers: approved,
        pendingSuppliers: pending,
        totalRevenue,
        averageRating: avgRating,
        activeCategories: categories
      })
      
      setLoading(false)
    }, 1000)
  }, [])

  const handleApproveSupplier = (supplierId: string) => {
    setSuppliers(prev => prev.map(s => 
      s.id === supplierId ? { ...s, status: 'approved' as const } : s
    ))
  }

  const handleRejectSupplier = (supplierId: string) => {
    setSuppliers(prev => prev.map(s => 
      s.id === supplierId ? { ...s, status: 'rejected' as const } : s
    ))
  }

  const handleThemeToggle = () => {
    setDarkMode(!darkMode)
  }

  const handleLogout = () => {
    router.push('/login')
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || supplier.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const sidebarItems = [
    { id: 'overview', icon: Grid3X3, label: 'Overview', path: '/admin/suppliers' },
    { id: 'pending', icon: Clock, label: 'Pending Approval', path: '/admin/suppliers' },
    { id: 'approved', icon: CheckCircle, label: 'Approved Suppliers', path: '/admin/suppliers' },
    { id: 'rejected', icon: XCircle, label: 'Rejected Suppliers', path: '/admin/suppliers' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', path: '/admin/suppliers' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/admin/suppliers' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-sm px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Supplier Management</h1>
              <p className="text-gray-600 mt-1">Manage and monitor all marketplace suppliers</p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <button
                onClick={handleThemeToggle}
                className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-colors"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Left Sidebar Navigation */}
          <div className="w-80 bg-white shadow-sm border-r border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Navigation</h3>
              <p className="text-sm text-gray-600">Access all supplier sections quickly</p>
            </div>
            
            <div className="space-y-3">
              {sidebarItems.map(({ id, icon: Icon, label, path }) => (
                <button
                  key={id}
                  onClick={() => handleTabChange(id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                    activeTab === id 
                      ? 'bg-primary-50 border border-primary-200 text-primary-700' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeTab === id 
                      ? 'bg-primary-100 text-primary-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-xs text-gray-500">Manage {label.toLowerCase()}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setShowMessageModal(true)}
                  className="w-full flex items-center space-x-2 p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>View Messages</span>
                </button>
                <button
                  onClick={() => setShowNotificationModal(true)}
                  className="w-full flex items-center space-x-2 p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </button>
                <button
                  onClick={() => setShowCalendarModal(true)}
                  className="w-full flex items-center space-x-2 p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Calendar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Dashboard Content */}
          <div className="flex-1 p-8">
            <div className="space-y-8">
              {/* Row 1: Total Revenue, Summary Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Total Revenue Card */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Total Revenue</h3>
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">NubiaGo</span>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="mb-6">
                    <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">From all suppliers</span>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => handleTabChange('analytics')}
                      className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <FileText className="h-4 w-4" />
                      <span>View Reports</span>
                    </button>
                    <button 
                      onClick={() => {/* Export functionality */}}
                      className="flex-1 bg-gray-100 text-gray-900 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export Data</span>
                    </button>
                  </div>
                </div>

                {/* Summary Cards Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary-600 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <Store className="h-5 w-5" />
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                    <p className="text-2xl font-bold">{stats.totalSuppliers}</p>
                    <p className="text-sm opacity-90">Total Suppliers</p>
                    <div className="flex items-center mt-2">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      <span className="text-xs">Active marketplace</span>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">{stats.approvedSuppliers}</p>
                    <p className="text-sm text-gray-600">Approved</p>
                    <div className="flex items-center mt-2">
                      <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                      <span className="text-xs text-green-600">Active suppliers</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalSuppliers}</p>
                    </div>
                    <Store className="h-8 w-8 text-primary-600" />
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Approved</p>
                      <p className="text-2xl font-bold text-green-600">{stats.approvedSuppliers}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.pendingSuppliers}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Row 3: Filters and Search */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search suppliers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
                      />
                    </div>
                    
                    <div className="relative">
                      <button 
                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                        className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Filter className="h-4 w-4" />
                        <span>Filter</span>
                      </button>
                      {showFilterDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                          <button
                            onClick={() => { setFilterStatus('all'); setShowFilterDropdown(false); }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                          >
                            All Suppliers
                          </button>
                          <button
                            onClick={() => { setFilterStatus('approved'); setShowFilterDropdown(false); }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                          >
                            Approved
                          </button>
                          <button
                            onClick={() => { setFilterStatus('pending'); setShowFilterDropdown(false); }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                          >
                            Pending
                          </button>
                          <button
                            onClick={() => { setFilterStatus('rejected'); setShowFilterDropdown(false); }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                          >
                            Rejected
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                    <Shield className="h-4 w-4" />
                    <span>Add Supplier</span>
                  </button>
                </div>
              </div>

              {/* Row 4: Suppliers Table */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredSuppliers.map((supplier) => (
                        <tr key={supplier.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                <Store className="h-5 w-5 text-primary-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{supplier.businessName}</p>
                                <p className="text-sm text-gray-500">{supplier.category}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{supplier.ownerName}</p>
                              <p className="text-sm text-gray-500">{supplier.email}</p>
                              <p className="text-xs text-gray-400">{supplier.phone}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(supplier.status)}`}>
                              {getStatusIcon(supplier.status)}
                              <span className="ml-1">{supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <p className="font-medium">{supplier.totalOrders} orders</p>
                              <p className="text-gray-500">${supplier.totalRevenue.toLocaleString()}</p>
                              {supplier.rating > 0 && (
                                <div className="flex items-center mt-1">
                                  <span className="text-yellow-400">★</span>
                                  <span className="text-sm text-gray-600 ml-1">{supplier.rating}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(supplier.joinedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button className="text-primary-600 hover:text-primary-900">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="text-gray-600 hover:text-gray-900">
                                <Edit className="h-4 w-4" />
                              </button>
                              {supplier.status === 'pending' && (
                                <>
                                  <button 
                                    onClick={() => handleApproveSupplier(supplier.id)}
                                    className="text-green-600 hover:text-green-900"
                                    title="Approve supplier"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleRejectSupplier(supplier.id)}
                                    className="text-red-600 hover:text-red-900"
                                    title="Reject supplier"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                              <button className="text-gray-400 hover:text-gray-600">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
