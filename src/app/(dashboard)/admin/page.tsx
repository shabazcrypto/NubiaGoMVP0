'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, Shield, BarChart3, Settings, LogOut, Search, 
  Edit, CheckCircle, XCircle, Clock, TrendingUp, DollarSign,
  Package, ShoppingBag, ArrowRight, Filter, Plus, Sun, Moon,
  Grid3X3, Calendar, Mail, List, User, Bell, ChevronDown,
  Wallet, CreditCard, Activity, TrendingDown, ArrowUpRight,
  MoreHorizontal, Flag, Star, ShoppingCart, Store, Globe,
  Download, FileText, Zap, Eye
} from 'lucide-react'
import Link from 'next/link'

interface User {
  id: string
  name: string
  email: string
  role: 'customer' | 'supplier' | 'admin'
  status: 'active' | 'suspended' | 'pending'
  joinedAt: string
}

interface Supplier {
  id: string
  businessName: string
  ownerName: string
  status: 'pending' | 'approved' | 'rejected'
  totalOrders: number
  totalRevenue: number
  rating: number
}

interface SystemStats {
  totalUsers: number
  totalSuppliers: number
  totalOrders: number
  totalRevenue: number
  pendingApprovals: number
  activeProducts: number
}

interface Order {
  id: string
  customerName: string
  productName: string
  amount: number
  status: 'completed' | 'pending' | 'processing'
  date: string
}

interface Message {
  id: string
  title: string
  content: string
  type: 'info' | 'warning' | 'success' | 'error'
  date: string
  read: boolean
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'order' | 'supplier' | 'system' | 'user'
  date: string
  read: boolean
}

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState<User[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 1250,
    totalSuppliers: 45,
    totalOrders: 3200,
    totalRevenue: 125000,
    pendingApprovals: 8,
    activeProducts: 890
  })
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [showMoreOptions, setShowMoreOptions] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Handle supplier approval
  const handleApproveSupplier = (supplierId: string) => {
    setSuppliers(prev => prev.map(supplier => 
      supplier.id === supplierId 
        ? { ...supplier, status: 'approved' as const }
        : supplier
    ))
    // Update stats
    setStats(prev => ({
      ...prev,
      pendingApprovals: Math.max(0, prev.pendingApprovals - 1)
    }))
    alert('Supplier approved successfully!')
  }

  // Handle supplier rejection
  const handleRejectSupplier = (supplierId: string) => {
    setSuppliers(prev => prev.map(supplier => 
      supplier.id === supplierId 
        ? { ...supplier, status: 'rejected' as const }
        : supplier
    ))
    // Update stats
    setStats(prev => ({
      ...prev,
      pendingApprovals: Math.max(0, prev.pendingApprovals - 1)
    }))
    alert('Supplier rejected successfully!')
  }

  // Handle filter toggle
  const handleFilterToggle = () => {
    setShowFilterDropdown(!showFilterDropdown)
  }

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // Handle order selection
  const handleOrderSelection = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, orderId])
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId))
    }
  }

  // Handle select all orders
  const handleSelectAllOrders = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(orders.map(order => order.id))
    } else {
      setSelectedOrders([])
    }
  }

  // Handle export data
  const handleExportData = () => {
    const data = {
      orders: orders,
      suppliers: suppliers,
      users: users,
      stats: stats
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nubiago-admin-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    alert('Data exported successfully!')
  }

  // Handle view reports
  const handleViewReports = () => {
    // Navigate to reports page
    router.push('/admin/reports')
  }

  // Handle add product
  const handleAddProduct = () => {
    // Navigate to product creation
    router.push('/products/create')
  }

  // Handle theme toggle
  const handleThemeToggle = () => {
    setDarkMode(!darkMode)
    // Apply theme to document
    if (!darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Handle logout
  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      router.push('/auth/login')
    }
  }

  // Handle tab navigation
  const handleTabChange = (tab: string) => {
    if (tab === 'apis') {
      router.push('/admin/apis')
      return
    }
    setActiveTab(tab)
    // Reset search when changing tabs
    setSearchQuery('')
  }

  // Handle more options menu
  const handleMoreOptions = (orderId: string) => {
    setShowMoreOptions(showMoreOptions === orderId ? null : orderId)
  }

  // Handle order actions
  const handleOrderAction = (action: string, orderId: string) => {
    setShowMoreOptions(null)
    switch (action) {
      case 'view':
        router.push(`/admin/orders/${orderId}`)
        break
      case 'edit':
        router.push(`/admin/orders/${orderId}/edit`)
        break
      case 'delete':
        if (confirm('Are you sure you want to delete this order?')) {
          setOrders(prev => prev.filter(order => order.id !== orderId))
          alert('Order deleted successfully!')
        }
        break
      default:
        break
    }
  }

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        order.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  useEffect(() => {
    setTimeout(() => {
      setUsers([
        { id: 'USR-001', name: 'John Doe', email: 'john@example.com', role: 'customer', status: 'active', joinedAt: '2024-01-15' },
        { id: 'USR-002', name: 'Jane Smith', email: 'jane@example.com', role: 'supplier', status: 'pending', joinedAt: '2024-01-20' },
        { id: 'USR-003', name: 'Bob Wilson', email: 'bob@example.com', role: 'customer', status: 'active', joinedAt: '2024-01-18' }
      ])
      setSuppliers([
        { id: 'SUP-001', businessName: 'Tech Store', ownerName: 'Jane Smith', status: 'pending', totalOrders: 0, totalRevenue: 0, rating: 0 },
        { id: 'SUP-002', businessName: 'Fashion Hub', ownerName: 'Mike Johnson', status: 'approved', totalOrders: 45, totalRevenue: 2500, rating: 4.5 },
        { id: 'SUP-003', businessName: 'Home Decor', ownerName: 'Sarah Wilson', status: 'pending', totalOrders: 0, totalRevenue: 0, rating: 0 }
      ])
      setOrders([
        { id: 'ORD_000076', customerName: 'Sarah Johnson', productName: 'Premium Running Sneakers', amount: 25500, status: 'completed', date: '17 Apr, 2026 03:45 PM' },
        { id: 'ORD_000075', customerName: 'Mike Davis', productName: 'Wireless Bluetooth Headphones', amount: 32750, status: 'pending', date: '15 Apr, 2026 11:30 AM' },
        { id: 'ORD_000074', customerName: 'Emma Wilson', productName: 'Smart Fitness Watch', amount: 40200, status: 'completed', date: '15 Apr, 2026 12:00 PM' },
        { id: 'ORD_000073', customerName: 'David Brown', productName: 'Complete Skincare Set', amount: 50200, status: 'processing', date: '14 Apr, 2026 09:15 PM' }
      ])
      setMessages([
        { id: 'MSG-001', title: 'New Supplier Application', content: 'Home Decor has submitted an application for approval.', type: 'info', date: '2026-04-17', read: false },
        { id: 'MSG-002', title: 'System Maintenance', content: 'Scheduled maintenance on April 20th, 2026.', type: 'warning', date: '2026-04-16', read: true }
      ])
      setNotifications([
        { id: 'NOT-001', title: 'New Order', message: 'Order ORD_000076 has been placed.', type: 'order', date: '2026-04-17', read: false },
        { id: 'NOT-002', title: 'Supplier Approved', message: 'Fashion Hub has been approved.', type: 'supplier', date: '2026-04-16', read: true }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'approved': return 'text-green-600 bg-green-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'suspended': return 'text-red-600 bg-red-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      case 'processing': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'suspended': return <XCircle className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      case 'processing': return <Activity className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-purple-600 bg-purple-100'
      case 'supplier': return 'text-blue-600 bg-blue-100'
      case 'customer': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const sidebarItems = [
    { id: 'overview', icon: Grid3X3, label: 'Overview', path: '/admin' },
    { id: 'users', icon: Users, label: 'User Management', path: '/admin/users' },
    { id: 'suppliers', icon: Shield, label: 'Supplier Management', path: '/admin/suppliers' },
    { id: 'orders', icon: ShoppingCart, label: 'Order Management', path: '/admin/orders' },
    { id: 'approvals', icon: CheckCircle, label: 'Approval System', path: '/admin/approvals' },
    { id: 'monitoring', icon: BarChart3, label: 'System Monitoring', path: '/admin/monitoring' },
    { id: 'apis', icon: Zap, label: 'API Management', path: '/admin/apis' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/admin/settings' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-sm px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Good morning, Admin</h1>
              <p className="text-gray-600 mt-1">Stay on top of your marketplace, monitor orders, and track performance.</p>
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
              <p className="text-sm text-gray-600">Access all admin sections quickly</p>
            </div>
            
            <div className="space-y-3">
              {sidebarItems.map(({ id, icon: Icon, label, path }) => (
          <button
            key={id}
            onClick={() => {
                    if (id === 'overview') {
                      handleTabChange('overview')
                    } else if (path) {
                      router.push(path)
                    }
                  }}
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
            {/* Row 1: Total Revenue, Summary Cards, Chart */}
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
                  <p className="text-3xl font-bold text-gray-900">$689,372.00</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">5% than last month</span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={handleViewReports}
                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <FileText className="h-4 w-4" />
                    <span>View Reports</span>
                  </button>
                  <button 
                    onClick={handleExportData}
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
                    <ShoppingCart className="h-5 w-5" />
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                  <p className="text-2xl font-bold">$950</p>
                  <p className="text-sm opacity-90">Total Sales</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span className="text-xs">7% This month</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="h-5 w-5 text-gray-600" />
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">$700</p>
                  <p className="text-sm text-gray-600">Total Spend</p>
                  <div className="flex items-center mt-2">
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    <span className="text-xs text-red-500">5% This month</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="h-5 w-5 text-gray-600" />
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">1,250</p>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-500">8% This month</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <Store className="h-5 w-5 text-gray-600" />
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">45</p>
                  <p className="text-sm text-gray-600">Active Suppliers</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-500">4% This month</span>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sales Analytics</h3>
                <p className="text-sm text-gray-600 mb-6">View your marketplace performance over time</p>
                <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Chart Component</p>
                    <p className="text-xs text-gray-400">Coming soon</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Suppliers and Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Suppliers Section */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Suppliers</h3>
                  <span className="text-sm text-gray-600">Total {suppliers.length} suppliers</span>
                </div>
                <div className="space-y-4">
                  {suppliers.map((supplier) => (
                    <div key={supplier.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Store className={`h-5 w-5 ${
                          supplier.status === 'approved' ? 'text-primary-600' :
                          supplier.status === 'pending' ? 'text-yellow-600' :
                          'text-red-600'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900">{supplier.businessName}</p>
                          <p className="text-sm text-gray-600">
                            {supplier.status === 'pending' 
                              ? 'Pending approval'
                              : `${supplier.totalOrders} orders • $${supplier.totalRevenue}`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${
                          supplier.status === 'approved' ? 'text-green-600' :
                          supplier.status === 'pending' ? 'text-gray-500' :
                          'text-red-600'
                        }`}>
                          {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                        </span>
                        <p className="text-xs text-gray-500">
                          {supplier.status === 'pending' ? 'New supplier' : `${supplier.rating}★ rating`}
                        </p>
                        {supplier.status === 'pending' && (
                          <div className="flex items-center space-x-1 mt-2">
                            <button 
                              onClick={() => handleApproveSupplier(supplier.id)}
                              className="text-green-600 hover:text-green-500"
                              title="Approve supplier"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </button>
                            <button 
                              onClick={() => handleRejectSupplier(supplier.id)}
                              className="text-red-600 hover:text-red-500"
                              title="Reject supplier"
                            >
                              <XCircle className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders Table */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search orders..."
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div className="relative">
                        <button 
                          onClick={handleFilterToggle}
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
                              All Orders
                            </button>
                            <button
                              onClick={() => { setFilterStatus('completed'); setShowFilterDropdown(false); }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                            >
                              Completed
                            </button>
                            <button
                              onClick={() => { setFilterStatus('pending'); setShowFilterDropdown(false); }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                            >
                              Pending
                            </button>
                            <button
                              onClick={() => { setFilterStatus('processing'); setShowFilterDropdown(false); }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                            >
                              Processing
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300"
                            checked={selectedOrders.length === orders.length && orders.length > 0}
                            onChange={(e) => handleSelectAllOrders(e.target.checked)}
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input 
                              type="checkbox" 
                              className="rounded border-gray-300"
                              checked={selectedOrders.includes(order.id)}
                              onChange={(e) => handleOrderSelection(order.id, e.target.checked)}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.customerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.productName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${order.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              <div className={`w-2 h-2 rounded-full mr-2 ${
                                order.status === 'completed' ? 'bg-green-500' :
                                order.status === 'pending' ? 'bg-red-500' :
                                'bg-yellow-500'
                              }`} />
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                            <button 
                              onClick={() => handleMoreOptions(order.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                            {showMoreOptions === order.id && (
                              <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                                <button
                                  onClick={() => handleOrderAction('view', order.id)}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                                >
                                  <Eye className="h-3 w-3" />
                                  <span>View</span>
                                </button>
                                <button
                                  onClick={() => handleOrderAction('edit', order.id)}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                                >
                                  <Edit className="h-3 w-3" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleOrderAction('delete', order.id)}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 text-red-600"
                                >
                                  <XCircle className="h-3 w-3" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Row 3: System Overview and Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* System Overview */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">System Status</span>
                    </div>
                    <span className="text-sm text-green-600 font-medium">Online</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">Active Users</span>
                    </div>
                    <span className="text-sm text-gray-600">1,247 online</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">Pending Actions</span>
                    </div>
                    <span className="text-sm text-yellow-600 font-medium">{stats.pendingApprovals} items</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">Total Products</span>
                    </div>
                    <span className="text-sm text-gray-600">{stats.activeProducts} active</span>
                  </div>
                </div>
              </div>

              {/* Products Section */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
                  <button 
                    onClick={handleAddProduct}
                    className="flex items-center space-x-2 px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Product</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium">Premium</span>
                      <Star className="h-4 w-4" />
                    </div>
                    <div className="h-20 bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-400">Running Sneakers</p>
                  </div>
                  
                  <div className="bg-primary-600 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium">Featured</span>
                      <Star className="h-4 w-4" />
                    </div>
                    <div className="h-20 bg-primary-700 rounded-lg mb-4 flex items-center justify-center">
                      <Package className="h-8 w-8 text-primary-200" />
                    </div>
                    <p className="text-xs text-primary-200">Wireless Headphones</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>


        </div>
      </div>

      {/* Modals */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Messages</h3>
              <button onClick={() => setShowMessageModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              {messages.map((message) => (
                <div key={message.id} className={`p-3 rounded-lg border ${!message.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{message.title}</h4>
                    {!message.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{message.content}</p>
                  <p className="text-xs text-gray-500 mt-2">{message.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Notifications</h3>
              <button onClick={() => setShowNotificationModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className={`p-3 rounded-lg border ${!notification.read ? 'bg-primary-50 border-primary-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{notification.title}</h4>
                    {!notification.read && <div className="w-2 h-2 bg-primary-600 rounded-full"></div>}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{notification.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showCalendarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Calendar</h3>
              <button onClick={() => setShowCalendarModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="text-center py-8">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Calendar feature coming soon!</p>
            </div>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Settings</h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Dark Mode</span>
                <button 
                  onClick={handleThemeToggle}
                  className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-primary-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${darkMode ? 'transform translate-x-6' : 'transform translate-x-1'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Notifications</span>
                <button className="w-12 h-6 rounded-full bg-primary-600">
                  <div className="w-4 h-4 bg-white rounded-full transform translate-x-6"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Auto-refresh</span>
                <button className="w-12 h-6 rounded-full bg-gray-300">
                  <div className="w-4 h-4 bg-white rounded-full transform translate-x-1"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
