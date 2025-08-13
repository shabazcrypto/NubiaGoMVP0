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
import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import { useAdminDashboardStore } from '@/store/admin/admin-dashboard.store'
import { useAuth } from '@/hooks/useAuth'

export default function AdminDashboard() {
  const router = useRouter()
  const { user: adminUser } = useAuth()
  const {
    // Store state
    users,
    suppliers,
    orders,
    userStats,
    productStats,
    orderStats,
    supplierStats,
    activeTab,
    darkMode,
    searchQuery,
    selectedOrders,
    loading,
    
    // Store actions
    fetchUsers,
    fetchSuppliers,
    fetchOrders,
    setActiveTab,
    setSearchQuery,
    setSelectedOrders,
    updateSupplierApproval,
    updateOrderStatus,
    toggleDarkMode
  } = useAdminDashboardStore()

  // Local state for modals
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  // Mock data for messages and notifications
  const messages = [
    { id: '1', title: 'New Supplier Application', content: 'TechCorp Ltd has submitted their application', type: 'info', date: '2 hours ago', read: false },
    { id: '2', title: 'Order Issue Reported', content: 'Order #12345 has a delivery problem', type: 'warning', date: '4 hours ago', read: true },
    { id: '3', title: 'System Update Complete', content: 'Database maintenance completed successfully', type: 'success', date: '1 day ago', read: true }
  ]

  const notifications = [
    { id: '1', title: 'New Order', message: 'Order #12346 received from John Doe', type: 'order', date: '1 hour ago', read: false },
    { id: '2', title: 'Supplier Approved', message: 'GreenTech Solutions has been approved', type: 'supplier', date: '3 hours ago', read: true },
    { id: '3', title: 'System Alert', message: 'High server load detected', type: 'system', date: '6 hours ago', read: false }
  ]

  useEffect(() => {
    fetchUsers()
    fetchSuppliers()
    fetchOrders()
  }, [fetchUsers, fetchSuppliers, fetchOrders])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  const handleLogout = () => {
    // Handle logout logic
    router.push('/auth/login')
  }

  const handleThemeToggle = () => {
    toggleDarkMode()
  }

  const getRoleBadgeClass = (role: string) => {
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
    <AdminAuthGuard>
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
                  <button
                    onClick={() => setShowSettingsModal(true)}
                    className="w-full flex items-center space-x-2 p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 p-8">
              {/* Overview Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Users</p>
                          <p className="text-3xl font-bold text-gray-900">{userStats.totalUsers}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600">+12%</span>
                        <span className="text-gray-500 ml-1">from last month</span>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
                          <p className="text-3xl font-bold text-gray-900">{supplierStats.totalSuppliers}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Shield className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600">+8%</span>
                        <span className="text-gray-500 ml-1">from last month</span>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Orders</p>
                          <p className="text-3xl font-bold text-gray-900">{orderStats.totalOrders}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600">+15%</span>
                        <span className="text-gray-500 ml-1">from last month</span>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                          <p className="text-3xl font-bold text-gray-900">${orderStats.totalRevenue.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="h-6 w-6 text-yellow-600" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600">+22%</span>
                        <span className="text-gray-500 ml-1">from last month</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {orders.slice(0, 5).map((order) => (
                          <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                <ShoppingCart className="h-5 w-5 text-primary-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Order #{order.id}</p>
                                <p className="text-sm text-gray-600">{order.customer?.name || 'Unknown Customer'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">${order.totalAmount}</p>
                              <p className="text-sm text-gray-600">{order.status}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message Modal */}
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

      {/* Notification Modal */}
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

      {/* Calendar Modal */}
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

      {/* Settings Modal */}
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
    </AdminAuthGuard>
  )
} 
