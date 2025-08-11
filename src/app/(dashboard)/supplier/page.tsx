'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Package, ShoppingBag, TrendingUp, DollarSign, Users, 
  Plus, Edit, Eye, Filter, Search, LogOut, Settings, User,
  CheckCircle, Clock, XCircle, ArrowRight, BarChart3, Truck,
  Sun, Moon, Grid3X3, Calendar, Mail, Bell, ChevronDown,
  Wallet, CreditCard, Activity, TrendingDown, ArrowUpRight,
  MoreHorizontal, Star, ShoppingCart, Store, Globe,
  Download, FileText, Eye as ViewIcon, Star as StarIcon,
  MessageSquare, Award, Target, Zap, Shield, TrendingUp as TrendingUpIcon
} from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  status: 'active' | 'inactive' | 'draft'
  category: string
  sales: number
  rating: number
  image: string
}

interface Order {
  id: string
  customerName: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  createdAt: string
  items: number
}

interface Message {
  id: string
  title: string
  content: string
  type: 'order' | 'system' | 'customer'
  date: string
  read: boolean
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'order' | 'product' | 'system' | 'customer'
  date: string
  read: boolean
}

interface SupplierStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  averageRating: number
  monthlyGrowth: number
  pendingOrders: number
  lowStockItems: number
  activeCustomers: number
  totalSales: number
  profitMargin: number
}

export default function SupplierDashboard() {
  const router = useRouter()
  // const { success, error } = useToast() // Removed for now
  const [activeTab, setActiveTab] = useState('overview')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<SupplierStats>({
    totalRevenue: 2999.85,
    totalOrders: 15,
    totalProducts: 8,
    averageRating: 4.5,
    monthlyGrowth: 12.5,
    pendingOrders: 3,
    lowStockItems: 2,
    activeCustomers: 45,
    totalSales: 125,
    profitMargin: 23.5
  })
  const [loading, setLoading] = useState(true)
  const [showSearch, setShowSearch] = useState(false)
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

  // Handle search toggle
  const handleSearchToggle = () => {
    setShowSearch(!showSearch)
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
      products: products,
      orders: orders,
      stats: stats
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nubiago-supplier-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    alert('Data exported successfully!')
  }

  // Handle view reports
  const handleViewReports = () => {
    // Navigate to reports page
    router.push('/supplier/reports')
  }

          // Handle add product
        const handleAddProduct = () => {
    // Navigate to product creation
    router.push('/supplier/products/create')
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
        router.push(`/supplier/orders/${orderId}`)
        break
      case 'edit':
        router.push(`/supplier/orders/${orderId}/edit`)
        break
      case 'process':
        // Process order logic
        alert('Order processing started!')
        break
      default:
        break
    }
  }

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        order.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  useEffect(() => {
    setTimeout(() => {
      setProducts([
        {
          id: '1',
          name: 'Premium Wireless Headphones',
          price: 299.99,
          stock: 25,
          status: 'active',
          category: 'Electronics',
          sales: 45,
          rating: 4.8,
          image: '/images/headphones.jpg'
        },
        {
          id: '2',
          name: 'Smart Fitness Watch',
          price: 199.99,
          stock: 15,
          status: 'active',
          category: 'Electronics',
          sales: 32,
          rating: 4.6,
          image: '/images/watch.jpg'
        },
        {
          id: '3',
          name: 'Laptop Stand',
          price: 49.99,
          stock: 8,
          status: 'active',
          category: 'Accessories',
          sales: 28,
          rating: 4.4,
          image: '/images/laptop-stand.jpg'
        }
      ])
      setOrders([
        {
          id: 'ORD-001',
          customerName: 'John Doe',
          status: 'pending',
          total: 299.99,
          createdAt: '2024-01-20',
          items: 1
        },
        {
          id: 'ORD-002',
          customerName: 'Jane Smith',
          status: 'processing',
          total: 199.99,
          createdAt: '2024-01-19',
          items: 1
        },
        {
          id: 'ORD-003',
          customerName: 'Bob Wilson',
          status: 'shipped',
          total: 49.99,
          createdAt: '2024-01-18',
          items: 1
        }
      ])
      setMessages([
        { id: '1', title: 'New Order Received', content: 'Order ORD-001 has been placed by John Doe.', type: 'order', date: '2024-01-20', read: false },
        { id: '2', title: 'System Update', content: 'Your dashboard has been updated with new features.', type: 'system', date: '2024-01-19', read: true }
      ])
      setNotifications([
        { id: '1', title: 'Low Stock Alert', message: 'Laptop Stand is running low on stock.', type: 'product', date: '2024-01-20', read: false },
        { id: '2', title: 'New Customer', message: 'Bob Wilson has made their first purchase.', type: 'customer', date: '2024-01-18', read: true }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100'
      case 'shipped': return 'text-blue-600 bg-blue-100'
      case 'processing': return 'text-yellow-600 bg-yellow-100'
      case 'pending': return 'text-gray-600 bg-gray-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />
      case 'shipped': return <Truck className="h-4 w-4" />
      case 'processing': return <Clock className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
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
    { id: 'overview', icon: Grid3X3, label: 'Overview', path: '/supplier' },
    { id: 'products', icon: Package, label: 'Product Management', path: '/supplier/products' },
    { id: 'orders', icon: ShoppingBag, label: 'Order Processing', path: '/supplier/orders' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics & Reports', path: '/supplier/analytics' },
    { id: 'customers', icon: Users, label: 'Customer Management', path: '/supplier/customers' },
    { id: 'shipping', icon: Truck, label: 'Shipping & Logistics', path: '/supplier/shipping' },
    { id: 'support', icon: MessageSquare, label: 'Support', path: '/supplier/support' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/supplier/settings' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-sm px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, Supplier!</h1>
              <p className="text-gray-600 mt-1">Manage your products, process orders, and grow your business.</p>
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
                  <MessageSquare className="h-4 w-4" />
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
                  <span>Order Calendar</span>
        </button>
      </div>
          </div>
          </div>

          {/* Main Dashboard Content */}
        <div className="flex-1 p-8">
          <div className="space-y-8">
              {/* Row 1: Overview Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Total Revenue Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <TrendingUpIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">+{stats.monthlyGrowth}% this month</span>
                </div>
              </div>

                {/* Total Orders Card */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <ShoppingBag className="h-8 w-8 text-primary-600" />
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">+8% this month</span>
                  </div>
                </div>
                
                {/* Total Products Card */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Package className="h-8 w-8 text-blue-600" />
                    <Plus className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                  <p className="text-sm text-gray-600">Active Products</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">+2 this month</span>
                  </div>
                </div>
                
                {/* Average Rating Card */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Star className="h-8 w-8 text-yellow-600" />
                    <Award className="h-5 w-5 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                  <p className="text-sm text-gray-600">Average Rating</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">+0.2 this month</span>
                  </div>
                  </div>
                </div>
                
              {/* Row 2: Performance Metrics and Recent Orders */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Performance Metrics */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
                    <button 
                      onClick={handleViewReports}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View Full Reports
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        <span className="text-sm text-gray-600">Active Customers</span>
                  </div>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeCustomers}</p>
                      <div className="flex items-center mt-1">
                        <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                        <span className="text-xs text-green-600">+5 this month</span>
                  </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <ShoppingCart className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-gray-600">Total Sales</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalSales}</p>
                      <div className="flex items-center mt-1">
                        <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                        <span className="text-xs text-green-600">+12 this month</span>
                </div>
              </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="h-5 w-5 text-yellow-600" />
                        <span className="text-sm text-gray-600">Profit Margin</span>
                  </div>
                      <p className="text-2xl font-bold text-gray-900">{stats.profitMargin}%</p>
                      <div className="flex items-center mt-1">
                        <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                        <span className="text-xs text-green-600">+2.1% this month</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Package className="h-5 w-5 text-red-600" />
                        <span className="text-sm text-gray-600">Low Stock Items</span>
                      </div>
                      <p className="text-2xl font-bold text-red-600">{stats.lowStockItems}</p>
                      <div className="flex items-center mt-1">
                        <ArrowUpRight className="h-3 w-3 text-red-600 mr-1" />
                        <span className="text-xs text-red-600">Needs attention</span>
                      </div>
                </div>
              </div>
            </div>

                {/* Recent Orders */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                    <Link href="/supplier/orders" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      View All
                    </Link>
                </div>
                <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                            <ShoppingBag className="h-4 w-4 text-primary-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">{order.id}</p>
                            <p className="text-sm text-gray-600">{order.customerName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                          </span>
                          <p className="text-xs text-gray-500 mt-1">${order.total}</p>
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              </div>

              {/* Row 3: Orders Table */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Order Management</h3>
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
                              All Orders
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
                            <button
                              onClick={() => { setFilterStatus('shipped'); setShowFilterDropdown(false); }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                            >
                              Shipped
                            </button>
                            <button
                              onClick={() => { setFilterStatus('delivered'); setShowFilterDropdown(false); }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                            >
                              Delivered
                            </button>
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={handleAddProduct}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Product</span>
                      </button>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
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
                            {order.items}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${order.total}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
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
                                  onClick={() => handleOrderAction('process', order.id)}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                                  >
                                    <Truck className="h-3 w-3" />
                                  <span>Process</span>
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
                    {!notification.read && <div className="w-2 h-2 bg-primary-500 rounded-full"></div>}
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
              <h3 className="text-lg font-semibold">Order Calendar</h3>
              <button onClick={() => setShowCalendarModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="text-center py-8">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Order calendar feature coming soon!</p>
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