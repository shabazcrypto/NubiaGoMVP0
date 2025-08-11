'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ShoppingBag, Package, Heart, User, Settings, LogOut, 
  Search, Filter, Star, Eye, ShoppingCart, Clock, CheckCircle, XCircle,
  MapPin, Phone, Mail, Edit, ArrowRight, Plus, Sun, Moon, Grid3X3, 
  Calendar, Bell, ChevronDown, Wallet, CreditCard, Activity, TrendingDown, 
  ArrowUpRight, MoreHorizontal, Star as StarIcon, MessageSquare, Award, 
  Target, Zap, Truck, Download, FileText, Eye as ViewIcon, Gift, 
  Shield, CreditCard as CreditCardIcon, Truck as TruckIcon, TrendingUp,
  DollarSign, Users, BarChart3, ShoppingCart as CartIcon
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Order {
  id: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: Array<{
    name: string
    price: number
    quantity: number
    image: string
  }>
  total: number
  createdAt: string
  estimatedDelivery?: string
  trackingNumber?: string
}

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  loyaltyPoints: number
  memberSince: string
}

interface WishlistItem {
  id: string
  name: string
  price: number
  image: string
  category: string
  inStock: boolean
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'order' | 'promotion' | 'system'
  date: string
  read: boolean
}

interface CustomerStats {
  totalOrders: number
  totalSpent: number
  loyaltyPoints: number
  activeWishlist: number
  pendingOrders: number
  completedOrders: number
  averageRating: number
  memberSince: string
}

export default function CustomerDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [orders, setOrders] = useState<Order[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [profile, setProfile] = useState<UserProfile>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    loyaltyPoints: 1250,
    memberSince: '2023-01-15'
  })
  const [stats, setStats] = useState<CustomerStats>({
    totalOrders: 24,
    totalSpent: 2847.50,
    loyaltyPoints: 1250,
    activeWishlist: 8,
    pendingOrders: 2,
    completedOrders: 22,
    averageRating: 4.8,
    memberSince: '2023-01-15'
  })
  const [loading, setLoading] = useState(true)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
  })
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

  // Handle profile editing
  const handleEditProfile = () => {
    setEditFormData({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      address: { ...profile.address }
    })
    setIsEditingProfile(true)
  }

  const handleSaveProfile = () => {
    setProfile({ ...profile, ...editFormData })
    setIsEditingProfile(false)
    // Here you would typically make an API call to update the profile
  }

  const handleCancelEdit = () => {
    setIsEditingProfile(false)
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
      wishlist: wishlist,
      profile: profile,
      stats: stats
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nubiago-customer-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    alert('Data exported successfully!')
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
        router.push(`/orders/${orderId}`)
        break
      case 'track':
        router.push(`/order/track/${orderId}`)
        break
      case 'reorder':
        // Add to cart logic
        alert('Added to cart for reorder!')
        break
      default:
        break
    }
  }

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.items.some(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || order.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  useEffect(() => {
    setTimeout(() => {
      setOrders([
        {
          id: 'ORD-001',
          status: 'delivered',
          items: [
            { name: 'Premium Wireless Headphones', price: 299.99, quantity: 1, image: '/images/headphones.jpg' }
          ],
          total: 299.99,
          createdAt: '2024-01-15',
          estimatedDelivery: '2024-01-20',
          trackingNumber: 'TRK123456789'
        },
        {
          id: 'ORD-002',
          status: 'shipped',
          items: [
            { name: 'Smart Fitness Watch', price: 199.99, quantity: 1, image: '/images/watch.jpg' }
          ],
          total: 199.99,
          createdAt: '2024-01-18',
          estimatedDelivery: '2024-01-25',
          trackingNumber: 'TRK987654321'
        },
        {
          id: 'ORD-003',
          status: 'processing',
          items: [
            { name: 'Laptop Stand', price: 49.99, quantity: 1, image: '/images/laptop-stand.jpg' }
          ],
          total: 49.99,
          createdAt: '2024-01-20',
          estimatedDelivery: '2024-01-27'
        }
      ])
      setWishlist([
        { id: '1', name: 'Gaming Mouse', price: 79.99, image: '/images/mouse.jpg', category: 'Electronics', inStock: true },
        { id: '2', name: 'Mechanical Keyboard', price: 149.99, image: '/images/keyboard.jpg', category: 'Electronics', inStock: true },
        { id: '3', name: 'Wireless Charger', price: 39.99, image: '/images/charger.jpg', category: 'Electronics', inStock: false }
      ])
      setNotifications([
        { id: '1', title: 'Order Delivered', message: 'Your order ORD-001 has been delivered successfully.', type: 'order', date: '2024-01-20', read: false },
        { id: '2', title: 'Special Offer', message: 'Get 20% off on all electronics this week!', type: 'promotion', date: '2024-01-19', read: true },
        { id: '3', title: 'Order Shipped', message: 'Your order ORD-002 has been shipped.', type: 'order', date: '2024-01-18', read: true }
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
    { id: 'overview', icon: Grid3X3, label: 'Overview', path: '/customer' },
    { id: 'orders', icon: ShoppingBag, label: 'Order Management', path: '/customer/orders' },
    { id: 'wishlist', icon: Heart, label: 'Wishlist', path: '/customer/wishlist' },
    { id: 'profile', icon: User, label: 'Profile Settings', path: '/customer/profile' },
    { id: 'notifications', icon: Bell, label: 'Notifications', path: '/customer/notifications' },
    { id: 'support', icon: MessageSquare, label: 'Support', path: '/customer/support' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/customer/settings' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-sm px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {profile.firstName}!</h1>
              <p className="text-gray-600 mt-1">Manage your orders, track deliveries, and explore your shopping experience.</p>
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
              <p className="text-sm text-gray-600">Access all customer sections quickly</p>
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
                  <span>Contact Support</span>
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
                    <span className="text-xs text-green-600">+12% this month</span>
                  </div>
                </div>
                
                {/* Total Spent Card */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalSpent.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">+8% this month</span>
                  </div>
                </div>
                
                {/* Loyalty Points Card */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Award className="h-8 w-8 text-yellow-600" />
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.loyaltyPoints}</p>
                  <p className="text-sm text-gray-600">Loyalty Points</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">+150 this month</span>
                  </div>
                </div>
                
                {/* Wishlist Card */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Heart className="h-8 w-8 text-red-600" />
                    <Plus className="h-5 w-5 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeWishlist}</p>
                  <p className="text-sm text-gray-600">Wishlist Items</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">+2 this month</span>
                  </div>
                </div>
              </div>

              {/* Row 2: Recent Orders and Quick Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                    <Link href="/customer/orders" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      View All Orders
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{order.id}</p>
                            <p className="text-sm text-gray-600">
                              {order.items.length} item{order.items.length > 1 ? 's' : ''} • ${order.total}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-900">Member Since</span>
                  </div>
                      <span className="text-sm text-gray-600">{new Date(stats.memberSince).toLocaleDateString()}</span>
                </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-900">Average Rating</span>
              </div>
                      <span className="text-sm text-gray-600">{stats.averageRating}★</span>
            </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-900">Pending Orders</span>
                      </div>
                      <span className="text-sm text-yellow-600 font-medium">{stats.pendingOrders}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-900">Completed Orders</span>
                      </div>
                      <span className="text-sm text-gray-600">{stats.completedOrders}</span>
                    </div>
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
                            {order.items.map(item => item.name).join(', ')}
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
                                    onClick={() => handleOrderAction('track', order.id)}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                                  >
                                    <Truck className="h-3 w-3" />
                                    <span>Track</span>
                                  </button>
                                  <button
                                  onClick={() => handleOrderAction('reorder', order.id)}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                                  >
                                  <ShoppingCart className="h-3 w-3" />
                                  <span>Reorder</span>
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
              <h3 className="text-lg font-semibold">Contact Support</h3>
              <button onClick={() => setShowMessageModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-5 w-5" />
                  </button>
                    </div>
            <div className="space-y-4">
              <div className="text-center py-8">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Contact support feature coming soon!</p>
                    </div>
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