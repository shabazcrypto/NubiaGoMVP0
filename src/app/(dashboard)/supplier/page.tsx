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
  MessageSquare, Award, Target, Zap
} from 'lucide-react'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useToast } from '@/components/ui/toast'

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
  type: 'order' | 'product' | 'system'
  date: string
  read: boolean
}

export default function SupplierDashboard() {
  const router = useRouter()
  const { success, error } = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState({
    totalRevenue: 2999.85,
    totalOrders: 15,
    totalProducts: 8,
    averageRating: 4.5,
    monthlyGrowth: 12.5,
    pendingOrders: 3,
    lowStockItems: 2
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
      orders: orders,
      products: products,
      stats: stats
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `supplier-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    success('Data exported successfully!')
  }

  // Handle view reports
  const handleViewReports = () => {
    router.push('/supplier/reports')
  }

          // Handle add product
        const handleAddProduct = () => {
          router.push('/products/supplier/create')
        }

  // Handle theme toggle
  const handleThemeToggle = () => {
    setDarkMode(!darkMode)
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
      case 'process':
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, status: 'processing' as const }
            : order
        ))
        success('Order processing started!')
        break
      case 'ship':
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, status: 'shipped' as const }
            : order
        ))
        success('Order shipped successfully!')
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
        { id: 'PROD-001', name: 'Wireless Headphones', price: 99.99, stock: 45, status: 'active', category: 'Electronics', sales: 23, rating: 4.8, image: '/product-headphones-1.jpg' },
        { id: 'PROD-002', name: 'Smart Watch', price: 199.99, stock: 12, status: 'active', category: 'Electronics', sales: 8, rating: 4.6, image: '/product-tech-1.jpg' },
        { id: 'PROD-003', name: 'Women\'s Dress', price: 49.99, stock: 28, status: 'active', category: 'Women', sales: 15, rating: 4.7, image: '/product-lifestyle-1.jpg' },
        { id: 'PROD-004', name: 'Men\'s Shirt', price: 34.99, stock: 32, status: 'active', category: 'Men', sales: 12, rating: 4.5, image: '/product-home-1.jpg' },
        { id: 'PROD-005', name: 'Baby Onesie', price: 19.99, stock: 50, status: 'active', category: 'Mother & Child', sales: 18, rating: 4.9, image: '/product-accessories-1.jpg' },
        { id: 'PROD-006', name: 'Kitchen Set', price: 89.99, stock: 15, status: 'active', category: 'Home & Living', sales: 9, rating: 4.4, image: '/product-lifestyle-1.jpg' },
        { id: 'PROD-007', name: 'Lipstick Set', price: 24.99, stock: 40, status: 'active', category: 'Cosmetics', sales: 25, rating: 4.6, image: '/product-home-1.jpg' },
        { id: 'PROD-008', name: 'Leather Handbag', price: 79.99, stock: 20, status: 'active', category: 'Shoes & Bags', sales: 11, rating: 4.3, image: '/product-accessories-1.jpg' }
      ])
      setOrders([
        { id: 'ORD-001', customerName: 'John Doe', status: 'pending', total: 99.99, createdAt: '2024-01-20', items: 2 },
        { id: 'ORD-002', customerName: 'Jane Smith', status: 'shipped', total: 199.99, createdAt: '2024-01-19', items: 1 },
        { id: 'ORD-003', customerName: 'Mike Johnson', status: 'delivered', total: 149.99, createdAt: '2024-01-18', items: 3 },
        { id: 'ORD-004', customerName: 'Sarah Wilson', status: 'processing', total: 79.99, createdAt: '2024-01-17', items: 1 }
      ])
      setMessages([
        { id: 'MSG-001', title: 'New Order Received', content: 'Order ORD-001 has been placed by John Doe.', type: 'order', date: '2024-01-20', read: false },
        { id: 'MSG-002', title: 'Low Stock Alert', content: 'Smart Watch is running low on stock.', type: 'system', date: '2024-01-19', read: true }
      ])
      setNotifications([
        { id: 'NOT-001', title: 'Order Shipped', message: 'Order ORD-002 has been shipped successfully.', type: 'order', date: '2024-01-19', read: false },
        { id: 'NOT-002', title: 'Product Review', message: 'New 5-star review for Wireless Headphones.', type: 'system', date: '2024-01-18', read: true }
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
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const sidebarItems = [
    { id: 'theme', icon: darkMode ? Moon : Sun, label: 'Theme' },
    { id: 'overview', icon: Grid3X3, label: 'Overview' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'messages', icon: Mail, label: 'Messages' },
    { id: 'products', icon: Package, label: 'Products' },
    { id: 'orders', icon: ShoppingBag, label: 'Orders' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="w-16 bg-white shadow-sm flex flex-col items-center py-6 space-y-6">
        {sidebarItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => {
              if (id === 'theme') {
                handleThemeToggle()
              } else if (id === 'calendar') {
                setShowCalendarModal(true)
              } else if (id === 'messages') {
                setShowMessageModal(true)
              } else if (id === 'notifications') {
                setShowNotificationModal(true)
              } else if (id === 'settings') {
                setShowSettingsModal(true)
              } else {
                handleTabChange(id)
              }
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              id === 'theme' 
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : activeTab === id 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={label}
          >
            <Icon className="h-5 w-5" />
          </button>
        ))}
        
        <div className="flex-1" />
        
        <button
          onClick={handleLogout}
          className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-colors"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-sm px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Good morning, Supplier</h1>
            <p className="text-gray-600 mt-1">Manage your products, track orders, and grow your business.</p>
          </div>
        </header>

        {/* Main Content Area */}
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
                  <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">{stats.monthlyGrowth}% this month</span>
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
                    <ShoppingBag className="h-5 w-5" />
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                  <p className="text-sm opacity-90">Total Orders</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span className="text-xs">This month</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="h-5 w-5 text-gray-600" />
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                  <p className="text-sm text-gray-600">Pending Orders</p>
                  <div className="flex items-center mt-2">
                    <Clock className="h-3 w-3 text-red-500 mr-1" />
                    <span className="text-xs text-red-500">Need attention</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <StarIcon className="h-5 w-5 text-gray-600" />
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                  <p className="text-sm text-gray-600">Average Rating</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-500">Out of 5</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="h-5 w-5 text-gray-600" />
                    <Zap className="h-4 w-4 text-yellow-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                  <p className="text-sm text-gray-600">Active Products</p>
                  <div className="flex items-center mt-2">
                    <TrendingDown className="h-3 w-3 text-yellow-500 mr-1" />
                    <span className="text-xs text-yellow-500">{stats.lowStockItems} low stock</span>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sales Analytics</h3>
                <p className="text-sm text-gray-600 mb-6">View your sales performance over time</p>
                <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Chart Component</p>
                    <p className="text-xs text-gray-400">Coming soon</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Products and Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Products Section */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
                  <span className="text-sm text-gray-600">Total {products.length} products</span>
                </div>
                <div className="space-y-4">
                  {products.slice(0, 3).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.sales} sales</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-green-600 font-medium">${product.price}</span>
                        <div className="flex items-center mt-1">
                          <StarIcon className="h-3 w-3 text-yellow-500 mr-1" />
                          <span className="text-xs text-gray-500">{product.rating}</span>
                        </div>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
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
                            {order.items} items
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${order.total}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              <div className={`w-2 h-2 rounded-full mr-2 ${
                                order.status === 'delivered' ? 'bg-green-500' :
                                order.status === 'shipped' ? 'bg-blue-500' :
                                order.status === 'processing' ? 'bg-yellow-500' :
                                order.status === 'pending' ? 'bg-gray-500' :
                                'bg-red-500'
                              }`} />
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.createdAt}
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
                                {order.status === 'pending' && (
                                  <button
                                    onClick={() => handleOrderAction('process', order.id)}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                                  >
                                    <Clock className="h-3 w-3" />
                                    <span>Process</span>
                                  </button>
                                )}
                                {order.status === 'processing' && (
                                  <button
                                    onClick={() => handleOrderAction('ship', order.id)}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                                  >
                                    <Truck className="h-3 w-3" />
                                    <span>Ship</span>
                                  </button>
                                )}
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

            {/* Row 3: Business Overview and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Business Overview */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Overview</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">Store Status</span>
                    </div>
                    <span className="text-sm text-green-600 font-medium">Active</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">Performance</span>
                    </div>
                    <span className="text-sm text-gray-600">Excellent</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">Low Stock Items</span>
                    </div>
                    <span className="text-sm text-yellow-600 font-medium">{stats.lowStockItems} products</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">Customer Rating</span>
                    </div>
                    <span className="text-sm text-gray-600">{stats.averageRating}/5 stars</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={handleAddProduct}
                    className="bg-primary-600 rounded-xl p-4 text-white hover:bg-primary-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Plus className="h-5 w-5" />
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-medium">Add Product</p>
                  </button>
                  
                  <button className="bg-gray-900 rounded-xl p-4 text-white hover:bg-gray-800 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <MessageSquare className="h-5 w-5" />
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-medium">View Messages</p>
                  </button>
                  
                  <button className="bg-white border border-gray-200 rounded-xl p-4 text-gray-900 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <Award className="h-5 w-5 text-gray-600" />
                      <ArrowUpRight className="h-4 w-4 text-gray-600" />
                    </div>
                    <p className="text-sm font-medium">View Analytics</p>
                  </button>
                  
                  <button className="bg-white border border-gray-200 rounded-xl p-4 text-gray-900 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <Settings className="h-5 w-5 text-gray-600" />
                      <ArrowUpRight className="h-4 w-4 text-gray-600" />
                    </div>
                    <p className="text-sm font-medium">Settings</p>
                  </button>
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