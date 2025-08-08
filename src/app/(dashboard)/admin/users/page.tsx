'use client'

import { useState, useEffect } from 'react'
import { 
  Users, Shield, Store, UserCheck, UserX, UserPlus, 
  Search, Filter, MoreVertical, Eye, Edit, Trash2,
  CheckCircle, XCircle, Clock, AlertTriangle, Plus
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

export default function AdminUsersPage() {
  const { success, error } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [suppliers, setSuppliers] = useState<SupplierProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)
  const [showSupplierDetails, setShowSupplierDetails] = useState<string | null>(null)

  // Fetch users from Firebase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const userService = new UserService()
        const allUsers = await userService.getAllUsers()
        setUsers(allUsers.filter(user => user.role !== undefined))
        
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage users, approve suppliers, and control access</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'supplier' && u.status === 'active').length}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
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

        {/* Users Table */}
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
    </div>
  )
} 