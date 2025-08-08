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
  Shield, CreditCard as CreditCardIcon, Truck as TruckIcon
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
    loyaltyPoints: 0,
    memberSince: ''
  })
  const [darkMode, setDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [showMoreOptions, setShowMoreOptions] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Handle profile edit
  const handleEditProfile = () => {
    setEditFormData({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      address: { ...profile.address },
      loyaltyPoints: profile.loyaltyPoints,
      memberSince: profile.memberSince
    })
    setIsEditingProfile(true)
  }

  // Handle profile save
  const handleSaveProfile = () => {
    setProfile(editFormData)
    setIsEditingProfile(false)
    alert('Profile updated successfully!')
  }

  // Handle profile cancel
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
      profile: profile,
      wishlist: wishlist
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `customer-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    alert('Data exported successfully!')
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
        router.push(`/orders/${orderId}`)
        break
      case 'track':
        router.push(`/orders/${orderId}/track`)
        break
      case 'review':
        router.push(`/orders/${orderId}/review`)
        break
      default:
        break
    }
  }

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    return matchesSearch && matchesStatus
  })

  useEffect(() => {
    // Simulate loading user data and orders
    setTimeout(() => {
      setOrders([
        {
          id: 'ORD-001',
          status: 'delivered',
          items: [
            { name: 'Wireless Headphones', price: 99.99, quantity: 1, image: 'https://firebasestorage.googleapis.com/v0/b/nubiago-a000f.firebasestorage.app/o/categories%2Fcategory-api-5.jpg?alt=media&token=620c447f-6c82-4b5b-b44c-d71ee2c1a494' }
          ],
          total: 99.99,
          createdAt: '2024-01-15',
          estimatedDelivery: '2024-01-20',
          trackingNumber: 'TRK123456789'
        },
        {
          id: 'ORD-002',
          status: 'shipped',
          items: [
            { name: 'Smart Watch', price: 199.99, quantity: 1, image: 'https://firebasestorage.googleapis.com/v0/b/nubiago-a000f.firebasestorage.app/o/products%2Fproduct-order-2.jpg?alt=media&token=480b2c3e-9a42-4c23-8435-a19ebe5ddde8' }
          ],
          total: 199.99,
          createdAt: '2024-01-20',
          estimatedDelivery: '2024-01-25',
          trackingNumber: 'TRK987654321'
        },
        {
          id: 'ORD-003',
          status: 'processing',
          items: [
            { name: 'Women\'s Dress', price: 49.99, quantity: 1, image: '/product-lifestyle-1.jpg' }
          ],
          total: 49.99,
          createdAt: '2024-01-22',
          estimatedDelivery: '2024-01-27'
        }
      ])
      setWishlist([
        { id: 'WISH-001', name: 'Leather Handbag', price: 79.99, image: '/product-accessories-1.jpg', category: 'Shoes & Bags', inStock: true },
        { id: 'WISH-002', name: 'Kitchen Set', price: 89.99, image: '/product-lifestyle-1.jpg', category: 'Home & Living', inStock: false },
        { id: 'WISH-003', name: 'Lipstick Set', price: 24.99, image: '/product-home-1.jpg', category: 'Cosmetics', inStock: true }
      ])
      setNotifications([
        { id: 'NOT-001', title: 'Order Delivered', message: 'Your order ORD-001 has been delivered successfully.', type: 'order', date: '2024-01-20', read: false },
        { id: 'NOT-002', title: 'Special Offer', message: 'Get 20% off on all electronics this week!', type: 'promotion', date: '2024-01-19', read: true },
        { id: 'NOT-003', title: 'Order Shipped', message: 'Your order ORD-002 has been shipped.', type: 'order', date: '2024-01-18', read: true }
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const sidebarItems = [
    { id: 'theme', icon: darkMode ? Moon : Sun, label: 'Theme' },
    { id: 'overview', icon: Grid3X3, label: 'Overview' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'orders', icon: Package, label: 'Orders' },
    { id: 'wishlist', icon: Heart, label: 'Wishlist' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'profile', icon: User, label: 'Profile' },
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
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {profile.firstName}!</h1>
            <p className="text-gray-600 mt-1">Track your orders, manage your profile, and discover new products.</p>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          <div className="space-y-8">
            {/* Row 1: Total Spent, Summary Cards, Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Total Spent Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Total Spent</h3>
                  <div className="flex items-center space-x-2">
                    <Wallet className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">This Year</span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-3xl font-bold text-gray-900">${orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">+15% this month</span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={handleExportData}
                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Export Data</span>
                  </button>
                  <button 
                    onClick={() => router.push('/products')}
                    className="flex-1 bg-gray-100 text-gray-900 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Shop Now</span>
                  </button>
                </div>
              </div>

              {/* Summary Cards Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary-600 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="h-5 w-5" />
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                  <p className="text-2xl font-bold">{orders.length}</p>
                  <p className="text-sm opacity-90">Total Orders</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span className="text-xs">This year</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <ArrowUpRight className="h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{wishlist.length}</p>
                  <p className="text-sm text-gray-600">Wishlist Items</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-3 w-3 text-red-500 mr-1" />
                    <span className="text-xs text-red-500">Saved items</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <StarIcon className="h-5 w-5 text-yellow-500" />
                    <ArrowUpRight className="h-4 w-4 text-yellow-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{profile.loyaltyPoints}</p>
                  <p className="text-sm text-gray-600">Loyalty Points</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-3 w-3 text-yellow-500 mr-1" />
                    <span className="text-xs text-yellow-500">Earned</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <ShoppingCart className="h-5 w-5 text-gray-600" />
                    <ArrowUpRight className="h-4 w-4 text-gray-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                  <p className="text-sm text-gray-600">Cart Items</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-3 w-3 text-gray-600 mr-1" />
                    <span className="text-xs text-gray-600">Ready to buy</span>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Shopping Activity</h3>
                <p className="text-sm text-gray-600 mb-6">Your shopping patterns over time</p>
                <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Chart Component</p>
                    <p className="text-xs text-gray-400">Coming soon</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Recent Orders and Wishlist */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                            {order.items.length} items
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
                                {order.trackingNumber && (
                                  <button
                                    onClick={() => handleOrderAction('track', order.id)}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                                  >
                                    <Truck className="h-3 w-3" />
                                    <span>Track</span>
                                  </button>
                                )}
                                {order.status === 'delivered' && (
                                  <button
                                    onClick={() => handleOrderAction('review', order.id)}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                                  >
                                    <Star className="h-3 w-3" />
                                    <span>Review</span>
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

              {/* Wishlist Section */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Wishlist</h3>
                  <span className="text-sm text-gray-600">{wishlist.length} items</span>
                </div>
                <div className="space-y-4">
                  {wishlist.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Heart className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-900 font-medium">${item.price}</span>
                        <div className="flex items-center mt-1">
                          {item.inStock ? (
                            <span className="text-xs text-green-600">In Stock</span>
                          ) : (
                            <span className="text-xs text-red-600">Out of Stock</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 3: Account Overview and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Account Overview */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Overview</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">Account Status</span>
                    </div>
                    <span className="text-sm text-green-600 font-medium">Active</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">Member Since</span>
                    </div>
                    <span className="text-sm text-gray-600">{profile.memberSince}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">Loyalty Points</span>
                    </div>
                    <span className="text-sm text-yellow-600 font-medium">{profile.loyaltyPoints} pts</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">Total Spent</span>
                    </div>
                    <span className="text-sm text-gray-600">${orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}</span>
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
                    onClick={() => router.push('/products')}
                    className="bg-primary-600 rounded-xl p-4 text-white hover:bg-primary-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <ShoppingBag className="h-5 w-5" />
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-medium">Shop Now</p>
                  </button>
                  
                  <button 
                    onClick={() => router.push('/wishlist')}
                    className="bg-gray-900 rounded-xl p-4 text-white hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Heart className="h-5 w-5" />
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-medium">Wishlist</p>
                  </button>
                  
                  <button 
                    onClick={() => router.push('/orders')}
                    className="bg-white border border-gray-200 rounded-xl p-4 text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Package className="h-5 w-5 text-gray-600" />
                      <ArrowUpRight className="h-4 w-4 text-gray-600" />
                    </div>
                    <p className="text-sm font-medium">My Orders</p>
                  </button>
                  
                  <button 
                    onClick={() => router.push('/profile')}
                    className="bg-white border border-gray-200 rounded-xl p-4 text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <User className="h-5 w-5 text-gray-600" />
                      <ArrowUpRight className="h-4 w-4 text-gray-600" />
                    </div>
                    <p className="text-sm font-medium">Profile</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
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
                <span className="text-sm font-medium">Email Notifications</span>
                <button className="w-12 h-6 rounded-full bg-primary-600">
                  <div className="w-4 h-4 bg-white rounded-full transform translate-x-6"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">SMS Notifications</span>
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