'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Package, Search, Filter, Edit, Eye, Trash2,
  MoreHorizontal, ArrowLeft, TrendingUp, TrendingDown,
  CheckCircle, Clock, XCircle, AlertTriangle, ChevronDown,
  Download, Upload, FileText, BarChart3, Settings, Users,
  ShoppingCart, Activity, Star, Tag, DollarSign, Grid3X3
} from 'lucide-react'
import Link from 'next/link'

interface AdminProduct {
  id: string
  name: string
  price: number
  stock: number
  status: 'active' | 'inactive' | 'draft' | 'archived'
  category: string
  supplier: string
  sales: number
  rating: number
  image: string
  approvalStatus: 'pending' | 'approved' | 'rejected'
  approvalNotes?: string
  submittedAt: string
  approvedAt?: string
  isFeatured: boolean
  commissionRate: number
}

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)

  useEffect(() => {
    // Simulate loading products
    setTimeout(() => {
      setProducts([
        {
          id: '1',
          name: 'Premium Wireless Headphones',
          price: 299.99,
          stock: 25,
          status: 'active',
          category: 'Electronics',
          supplier: 'TechCorp Ltd',
          sales: 45,
          rating: 4.8,
          image: '/headphones.jpg',
          approvalStatus: 'approved',
          submittedAt: '2024-01-15',
          approvedAt: '2024-01-16',
          isFeatured: true,
          commissionRate: 15
        },
        {
          id: '2',
          name: 'Smart Fitness Watch',
          price: 199.99,
          stock: 15,
          status: 'active',
          category: 'Electronics',
          supplier: 'FitTech Solutions',
          sales: 32,
          rating: 4.6,
          image: '/watch.jpg',
          approvalStatus: 'approved',
          submittedAt: '2024-01-10',
          approvedAt: '2024-01-11',
          isFeatured: false,
          commissionRate: 12
        },
        {
          id: '3',
          name: 'Laptop Stand',
          price: 49.99,
          stock: 8,
          status: 'draft',
          category: 'Accessories',
          supplier: 'OfficePro',
          sales: 0,
          rating: 0,
          image: '/laptop-stand.jpg',
          approvalStatus: 'pending',
          submittedAt: '2024-01-20',
          isFeatured: false,
          commissionRate: 10
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const handleAddProduct = () => {
    router.push('/products/create')
  }

  const handleEditProduct = (productId: string) => {
    router.push(`/products/${productId}/edit`)
  }

  const handleViewProduct = (productId: string) => {
    router.push(`/products/${productId}`)
  }

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== productId))
    }
  }

  const handleBulkAction = (action: string) => {
    if (selectedProducts.length === 0) return

    switch (action) {
      case 'activate':
        setProducts(products.map(p => 
          selectedProducts.includes(p.id) ? { ...p, status: 'active' as const } : p
        ))
        break
      case 'deactivate':
        setProducts(products.map(p => 
          selectedProducts.includes(p.id) ? { ...p, status: 'inactive' as const } : p
        ))
        break
      case 'delete':
        if (confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
          setProducts(products.filter(p => !selectedProducts.includes(p.id)))
        }
        break
      case 'approve':
        setProducts(products.map(p => 
          selectedProducts.includes(p.id) ? { ...p, approvalStatus: 'approved' as const } : p
        ))
        break
      case 'reject':
        setProducts(products.map(p => 
          selectedProducts.includes(p.id) ? { ...p, approvalStatus: 'rejected' as const } : p
        ))
        break
    }
    setSelectedProducts([])
    setShowBulkActions(false)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map(p => p.id))
    } else {
      setSelectedProducts([])
    }
  }

  const handleProductSelection = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId])
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'inactive': return 'text-gray-600 bg-gray-100'
      case 'draft': return 'text-yellow-600 bg-yellow-100'
      case 'archived': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getApprovalStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        product.supplier.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory
    return matchesSearch && matchesStatus && matchesCategory
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin"
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-600 mt-2">Manage all marketplace products, approvals, and performance</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowBulkUpload(true)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </button>
              <button
                onClick={handleAddProduct}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Product
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => p.approvalStatus === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.reduce((sum, p) => sum + p.sales, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedProducts.length} product(s) selected
                </span>
                <button
                  onClick={() => setSelectedProducts([])}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction('approve')}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="bg-red-800 text-white px-3 py-1 rounded text-sm hover:bg-red-900"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products, suppliers, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  <ChevronDown className="w-4 h-4 ml-2" />
                </button>

                {showFilterDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                          <option value="all">All Status</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="draft">Draft</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                          <option value="all">All Categories</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Accessories">Accessories</option>
                          <option value="Clothing">Clothing</option>
                          <option value="Home">Home</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center"
              >
                <Settings className="w-4 h-4 mr-2" />
                Bulk Actions
              </button>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Products</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === products.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">Select All</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approval
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={(e) => handleProductSelection(product.id, e.target.checked)}
                          className="rounded border-gray-300 mr-3"
                        />
                        <div className="flex items-center">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover mr-3"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">SKU: {product.id}</div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{product.category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{product.supplier}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">₦{product.price.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{product.stock}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getApprovalStatusIcon(product.approvalStatus)}
                        <span className="ml-2 text-sm text-gray-900">{product.approvalStatus}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewProduct(product.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditProduct(product.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || filterStatus !== 'all' || filterCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first product'
              }
            </p>
            {!searchQuery && filterStatus === 'all' && filterCategory === 'all' && (
              <button
                onClick={handleAddProduct}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
              >
                Add Product
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
