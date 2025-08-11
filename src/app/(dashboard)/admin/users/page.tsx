'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, Shield, Store, UserCheck, UserX, UserPlus, 
  Search, Filter, MoreVertical, Eye, Edit, Trash2,
  CheckCircle, XCircle, Clock, AlertTriangle, Plus,
  Sun, Moon, LogOut, BarChart3, Settings, Calendar,
  Mail, Bell, ChevronDown, Globe, FileText, Download,
  ArrowUpRight, TrendingUp, Activity, Grid3X3
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { UserService } from '@/lib/services/user.service'

interface User {
  uid: string
  email: string
  displayName?: string
  role?: 'customer' | 'supplier' | 'admin'
  status?: 'active' | 'pending' | 'suspended'
  createdAt?: Date
  updatedAt?: Date
}

interface SupplierProfile {
  uid: string
  businessName: string
  businessType: string
  phoneNumber: string
  documentUrls: string[]
  approvalStatus: 'pending' | 'approved' | 'rejected'
  submittedAt: Date
  approvedAt?: Date
  approvedBy?: string
}

interface UserStats {
  totalUsers: number
  activeUsers: number
  pendingUsers: number
  suspendedUsers: number
  totalSuppliers: number
  totalAdmins: number
  totalCustomers: number
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { success, error } = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState<User[]>([])
  const [suppliers, setSuppliers] = useState<SupplierProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)
  const [showSupplierDetails, setShowSupplierDetails] = useState<string | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    suspendedUsers: 0,
    totalSuppliers: 0,
    totalAdmins: 0,
    totalCustomers: 0
  })

  // Fetch users from Firebase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const userService = new UserService()
        const allUsers = await userService.getAllUsers()
        const filteredUsers = allUsers.filter(user => user.role !== undefined)
        setUsers(filteredUsers)
        
        // Filter suppliers from users
        const supplierUsers = allUsers.filter(user => user.role === 'supplier')
        const supplierProfiles: SupplierProfile[] = supplierUsers.map(user => ({
          uid: user.uid,
          businessName: user.displayName || user.email,
          businessType: 'retail', // Default value - should be stored in user profile
          phoneNumber: user.phoneNumber || '',
          documentUrls: [], // Should be stored in user profile
          approvalStatus: user.status === 'active' ? 'approved' : 'pending',
          submittedAt: user.createdAt,
          approvedAt: user.status === 'active' ? user.updatedAt : undefined,
          approvedBy: undefined
        }))
        
        setSuppliers(supplierProfiles)

        // Calculate stats
        const active = filteredUsers.filter(u => u.status === 'active').length
        const pending = filteredUsers.filter(u => u.status === 'pending').length
        const suspended = filteredUsers.filter(u => u.status === 'suspended').length
        const suppliers = filteredUsers.filter(u => u.role === 'supplier').length
        const admins = filteredUsers.filter(u => u.role === 'admin').length
        const customers = filteredUsers.filter(u => u.role === 'customer').length

        setStats({
          totalUsers: filteredUsers.length,
          activeUsers: active,
          pendingUsers: pending,
          suspendedUsers: suspended,
          totalSuppliers: suppliers,
          totalAdmins: admins,
          totalCustomers: customers
        })
      } catch (err) {
        console.error('Error fetching users:', err)
        error('Failed to fetch users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [error])

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    return matchesSearch && matchesStatus && matchesRole
  })

  const pendingSuppliers = users.filter(user => 
    user.role === 'supplier' && user.status === 'pending'
  )

  const handleApproveSupplier = async (uid: string) => {
    try {
      // Call auth service to approve supplier
      const { authService } = await import('@/lib/services/auth.service')
      await authService.approveSupplier(uid, 'admin-user-id') // This should come from session
      
      setUsers(prev => prev.map(user => 
        user.uid === uid ? { ...user, status: 'active' } : user
      ))
      
      success('Supplier approved successfully! Email notification sent.')
    } catch (err: any) {
      error(`Failed to approve supplier: ${err.message}`)
    }
  }

  const handleRejectSupplier = async (uid: string, reason: string) => {
    try {
      // Call auth service to reject supplier
      const { authService } = await import('@/lib/services/auth.service')
      await authService.rejectSupplier(uid, reason, 'admin-user-id') // This should come from session
      
      setUsers(prev => prev.map(user => 
        user.uid === uid ? { ...user, status: 'suspended' } : user
      ))
      
      success('Supplier rejected successfully! Email notification sent.')
    } catch (err: any) {
      error(`Failed to reject supplier: ${err.message}`)
    }
  }

  const handleSuspendUser = async (uid: string, reason: string) => {
    try {
      // Call auth service to suspend user
      const { authService } = await import('@/lib/services/auth.service')
      await authService.suspendUser(uid, reason, 'admin-user-id') // This should come from session
      
      setUsers(prev => prev.map(user => 
        user.uid === uid ? { ...user, status: 'suspended' } : user
      ))
      
      success('User suspended successfully! Email notification sent.')
    } catch (err: any) {
      error(`Failed to suspend user: ${err.message}`)
    }
  }

  const handleReactivateUser = async (uid: string) => {
    try {
      // Call auth service to reactivate user
      const { authService } = await import('@/lib/services/auth.service')
      await authService.reactivateUser(uid, 'admin-user-id') // This should come from session
      
      setUsers(prev => prev.map(user => 
        user.uid === uid ? { ...user, status: 'active' } : user
      ))
      
      success('User reactivated successfully! Email notification sent.')
    } catch (err: any) {
      error(`Failed to reactivate user: ${err.message}`)
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'suspended':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-purple-500" />
      case 'supplier':
        return <Store className="h-4 w-4 text-blue-500" />
      case 'customer':
        return <Users className="h-4 w-4 text-green-500" />
      default:
        return <Users className="h-4 w-4 text-gray-500" />
    }
  }

  const sidebarItems = [
    { id: 'overview', icon: Grid3X3, label: 'Overview', path: '/admin/users' },
    { id: 'customers', icon: Users, label: 'Customer Management', path: '/admin/users' },
    { id: 'suppliers', icon: Store, label: 'Supplier Management', path: '/admin/users' },
    { id: 'admins', icon: Shield, label: 'Admin Management', path: '/admin/users' },
    { id: 'pending', icon: Clock, label: 'Pending Approvals', path: '/admin/users' },
    { id: 'analytics', icon: BarChart3, label: 'User Analytics', path: '/admin/users' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/admin/users' }
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
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Manage users, approve suppliers, and control access</p>
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
              <p className="text-sm text-gray-600">Access all user sections quickly</p>
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
              {/* Row 1: Total Users, Summary Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Total Users Card */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">NubiaGo</span>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="mb-6">
                    <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                    <div className="flex items-center mt-2">
                      <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">Active marketplace users</span>
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
                      <Users className="h-5 w-5" />
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                    <p className="text-2xl font-bold">{stats.activeUsers}</p>
                    <p className="text-sm opacity-90">Active Users</p>
                    <div className="flex items-center mt-2">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      <span className="text-xs">Currently online</span>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <ArrowUpRight className="h-4 w-4 text-yellow-600" />
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pendingUsers}</p>
                    <p className="text-sm text-gray-600">Pending</p>
                    <div className="flex items-center mt-2">
                      <ArrowUpRight className="h-3 w-3 text-yellow-600 mr-1" />
                      <span className="text-xs text-yellow-600">Awaiting approval</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending Suppliers</p>
                      <p className="text-2xl font-bold text-gray-900">{pendingSuppliers.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Store className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Suppliers</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalSuppliers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Shield className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Admins</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalAdmins}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>

                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="all">All Roles</option>
                      <option value="customer">Customer</option>
                      <option value="supplier">Supplier</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setShowCreateAdmin(true)}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Admin
                  </button>
                </div>
              </div>

              {/* Row 4: Users Table */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">All Users</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.uid} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700">
                                    {user.displayName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.displayName || 'No name'}
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getRoleIcon(user.role || 'customer')}
                              <span className="ml-2 text-sm text-gray-900 capitalize">{user.role || 'customer'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getStatusIcon(user.status || 'active')}
                              <span className="ml-2 text-sm text-gray-900 capitalize">{user.status || 'active'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.createdAt?.toLocaleDateString() || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setShowSupplierDetails(user.uid)}
                                className="text-primary-600 hover:text-primary-900"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              
                              {user.role === 'supplier' && user.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApproveSupplier(user.uid)}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRejectSupplier(user.uid, 'Rejected by admin')}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                              
                              {user.status === 'active' && (
                                <button
                                  onClick={() => handleSuspendUser(user.uid, 'Suspended by admin')}
                                  className="text-yellow-600 hover:text-yellow-900"
                                >
                                  <UserX className="h-4 w-4" />
                                </button>
                              )}
                              
                              {user.status === 'suspended' && (
                                <button
                                  onClick={() => handleReactivateUser(user.uid)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <UserCheck className="h-4 w-4" />
                                </button>
                              )}
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

      {/* Create Admin Modal */}
      {showCreateAdmin && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create Admin Account</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="admin@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Display Name</label>
                  <input
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Admin Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Strong password"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateAdmin(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Create Admin
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Details Modal */}
      {showSupplierDetails && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Supplier Details</h3>
              {suppliers.find(s => s.uid === showSupplierDetails) && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Business Name</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {suppliers.find(s => s.uid === showSupplierDetails)?.businessName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Business Type</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {suppliers.find(s => s.uid === showSupplierDetails)?.businessType}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {suppliers.find(s => s.uid === showSupplierDetails)?.phoneNumber}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Documents</label>
                    <div className="mt-1 space-y-1">
                      {suppliers.find(s => s.uid === showSupplierDetails)?.documentUrls.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-primary-600 hover:text-primary-500"
                        >
                          Document {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowSupplierDetails(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 