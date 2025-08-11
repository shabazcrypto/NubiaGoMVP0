'use client'

import { useState, useEffect } from 'react'
import { 
  ShoppingCart, Search, Filter, MoreHorizontal, 
  CheckCircle, XCircle, Eye, Edit, Package, TrendingUp,
  Clock, DollarSign, User, Store
} from 'lucide-react'

interface Order {
  id: string
  customerName: string
  customerEmail: string
  productName: string
  supplierName: string
  amount: number
  status: 'completed' | 'pending' | 'processing' | 'cancelled'
  date: string
  paymentMethod: string
  shippingAddress: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setOrders([
        {
          id: 'ORD-001',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          productName: 'Wireless Headphones',
          supplierName: 'Tech Solutions Inc',
          amount: 129.99,
          status: 'completed',
          date: '2024-03-15',
          paymentMethod: 'Credit Card',
          shippingAddress: '123 Main St, City, State 12345'
        },
        {
          id: 'ORD-002',
          customerName: 'Jane Smith',
          customerEmail: 'jane@example.com',
          productName: 'Running Shoes',
          supplierName: 'Fashion Forward',
          amount: 89.99,
          status: 'processing',
          date: '2024-03-16',
          paymentMethod: 'PayPal',
          shippingAddress: '456 Oak Ave, City, State 12345'
        },
        {
          id: 'ORD-003',
          customerName: 'Mike Johnson',
          customerEmail: 'mike@example.com',
          productName: 'Home Decor Lamp',
          supplierName: 'Home Decor Plus',
          amount: 45.50,
          status: 'pending',
          date: '2024-03-17',
          paymentMethod: 'Credit Card',
          shippingAddress: '789 Pine Rd, City, State 12345'
        },
        {
          id: 'ORD-004',
          customerName: 'Sarah Wilson',
          customerEmail: 'sarah@example.com',
          productName: 'Smart Watch',
          supplierName: 'Tech Solutions Inc',
          amount: 299.99,
          status: 'cancelled',
          date: '2024-03-14',
          paymentMethod: 'Credit Card',
          shippingAddress: '321 Elm St, City, State 12345'
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const handleOrderSelection = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, orderId])
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId))
    }
  }

  const handleSelectAllOrders = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(orders.map(order => order.id))
    } else {
      setSelectedOrders([])
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'processing': return <Clock className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.supplierName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0)
  const completedOrders = orders.filter(order => order.status === 'completed').length
  const pendingOrders = orders.filter(order => order.status === 'pending').length
  const processingOrders = orders.filter(order => order.status === 'processing').length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
          <p className="text-gray-600">Monitor and manage all marketplace orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{completedOrders}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingOrders + processingOrders}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
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
                      All Orders
                    </button>
                    <button
                      onClick={() => { setFilterStatus('completed'); setShowFilterDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      Completed
                    </button>
                    <button
                      onClick={() => { setFilterStatus('processing'); setShowFilterDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      Processing
                    </button>
                    <button
                      onClick={() => { setFilterStatus('pending'); setShowFilterDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => { setFilterStatus('cancelled'); setShowFilterDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      Cancelled
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {selectedOrders.length > 0 && (
                <span className="text-sm text-gray-600">
                  {selectedOrders.length} order(s) selected
                </span>
              )}
              <button className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                <Package className="h-4 w-4" />
                <span>Export Orders</span>
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{order.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                          <p className="text-xs text-gray-500">{order.customerEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.productName}</p>
                          <p className="text-xs text-gray-500">{order.paymentMethod}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Store className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.supplierName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">${order.amount.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-primary-600 hover:text-primary-900" title="View Order">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900" title="Edit Order">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600" title="More Options">
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
  )
}
