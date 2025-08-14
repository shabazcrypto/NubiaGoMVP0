'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Package, Search, Filter, Edit, Eye, Trash2,
  MoreHorizontal, ArrowLeft, TrendingUp, TrendingDown,
  CheckCircle, Clock, XCircle, AlertTriangle, ChevronDown,
  Download, Upload, FileText, BarChart3, Settings, Users,
  ShoppingCart, Activity, Star, Tag, DollarSign, Grid3X3,
  Copy, ExternalLink, Target, Award, Zap
} from 'lucide-react'
import Link from 'next/link'

interface SupplierProduct {
  id: string
  name: string
  price: number
  stock: number
  status: 'active' | 'inactive' | 'draft' | 'pending' | 'rejected'
  category: string
  sales: number
  rating: number
  image: string
  approvalStatus: 'pending' | 'approved' | 'rejected'
  approvalNotes?: string
  submittedAt: string
  approvedAt?: string
  isFeatured: boolean
  commissionRate: number
  views: number
  clicks: number
  conversionRate: number
}

export default function SupplierProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<SupplierProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

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
          sales: 45,
          rating: 4.8,
          image: '/headphones.jpg',
          approvalStatus: 'approved',
          submittedAt: '2024-01-15',
          approvedAt: '2024-01-16',
          isFeatured: true,
          commissionRate: 10,
          views: 1250,
          clicks: 89,
          conversionRate: 7.1
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
          image: '/watch.jpg',
          approvalStatus: 'approved',
          submittedAt: '2024-01-10',
          approvedAt: '2024-01-11',
          isFeatured: false,
          commissionRate: 10,
          views: 890,
          clicks: 67,
          conversionRate: 7.5
        },
        {
          id: '3',
          name: 'Laptop Stand',
          price: 49.99,
          stock: 8,
          status: 'pending',
          category: 'Accessories',
          sales: 0,
          rating: 0,
          image: '/laptop-stand.jpg',
          approvalStatus: 'pending',
          submittedAt: '2024-01-20',
          isFeatured: false,
          commissionRate: 10,
          views: 0,
          clicks: 0,
          conversionRate: 0
        },
        {
          id: '4',
          name: 'Ergonomic Office Chair',
          price: 399.99,
          stock: 12,
          status: 'active',
          category: 'Furniture',
          sales: 18,
          rating: 4.9,
          image: '/chair.jpg',
          approvalStatus: 'approved',
          submittedAt: '2024-01-05',
          approvedAt: '2024-01-06',
          isFeatured: true,
          commissionRate: 10,
          views: 2100,
          clicks: 156,
          conversionRate: 7.4
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const handleAddProduct = () => {
    router.push('/products/supplier/create')
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
      case 'duplicate':
        // Duplicate selected products
        const duplicatedProducts = selectedProducts.map(id => {
          const original = products.find(p => p.id === id)
          if (original) {
            return {
              ...original,
              id: `${original.id}-copy-${Date.now()}`,
              name: `${original.name} (Copy)`,
              status: 'draft' as const,
              approvalStatus: 'pending' as const,
              submittedAt: new Date().toISOString().split('T')[0],
              sales: 0,
              views: 0,
              clicks: 0,
              conversionRate: 0
            }
          }
          return null
        }).filter(Boolean) as SupplierProduct[]
        
        setProducts([...products, ...duplicatedProducts])
        break
      case 'export':
        // Export selected products data
        const exportData = products.filter(p => selectedProducts.includes(p.id))
        const csvContent = [
          ['Name', 'Price', 'Stock', 'Category', 'Status', 'Sales', 'Rating'],
          ...exportData.map(p => [p.name, p.price.toString(), p.stock.toString(), p.category, p.status, p.sales.toString(), p.rating.toString()])
        ].map(row => row.join(',')).join('\n')
        
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'products-export.csv'
        a.click()
        window.URL.revokeObjectURL(url)
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
      case 'pending': return 'text-primary-600 bg-primary-100'
      case 'rejected': return 'text-red-600 bg-red-100'
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
                        product.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory
    return matchesSearch && matchesStatus && matchesCategory
  })

  const totalRevenue = products.reduce((sum, p) => sum + (p.sales * p.price), 0)
  const totalViews = products.reduce((sum, p) => sum + p.views, 0)
  const totalClicks = products.reduce((sum, p) => sum + p.clicks, 0)
  const avgConversionRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0

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
                href="/supplier"
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
              <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-600 mt-2">Manage your product catalog, track performance, and optimize sales</p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/products/supplier/bulk-upload"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Link>
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
              <div className="p-2 bg-primary-100 rounded-lg">
                <Package className="w-6 h-6 text-primary-600" />
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
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₦{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Target className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{avgConversionRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-primary-900">
                  {selectedProducts.length} product(s) selected
                </span>
                <button
                  onClick={() => setSelectedProducts([])}
                  className="text-sm text-primary-600 hover:text-primary-800"
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
                  onClick={() => handleBulkAction('duplicate')}
                  className="bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => handleBulkAction('export')}
                  className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                >
                  Export
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
                  placeholder="Search products, categories..."
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
                          <option value="pending">Pending</option>
                          <option value="rejected">Rejected</option>
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
                          <option value="Furniture">Furniture</option>
                          <option value="Clothing">Clothing</option>
              </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 ${viewMode === 'table' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <FileText className="w-4 h-4" />
                </button>
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

        {/* Products Display */}
        {viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="relative">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  
                  {/* Selection Checkbox */}
                  <div className="absolute top-2 left-2">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={(e) => handleProductSelection(product.id, e.target.checked)}
                      className="rounded border-gray-300 bg-white"
                    />
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
                      {product.status}
                    </span>
                  </div>

                  {/* Approval Status */}
                  <div className="absolute bottom-2 right-2">
                    {getApprovalStatusIcon(product.approvalStatus)}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {product.name}
            </h3>
          </div>
          
                  <p className="text-gray-600 text-sm mb-3">{product.category}</p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-gray-900">₦{product.price.toLocaleString()}</span>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-xs text-gray-500">
                    <div className="text-center">
                      <div className="font-medium">{product.views}</div>
                      <div>Views</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{product.clicks}</div>
                      <div>Clicks</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{product.conversionRate.toFixed(1)}%</div>
                      <div>Conv.</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>Stock: {product.stock}</span>
                    <span>Sales: {product.sales}</span>
                    <span>Rating: {product.rating}</span>
              </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewProduct(product.id)}
                      className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleEditProduct(product.id)}
                      className="flex-1 bg-primary-100 text-primary-700 px-3 py-2 rounded-lg hover:bg-primary-200 flex items-center justify-center"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
              <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200"
              >
                      <Trash2 className="w-4 h-4" />
              </button>
                  </div>
                </div>
              </div>
            ))}
            </div>
          ) : (
          /* Table View */
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
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
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
                        <span className="text-sm font-medium text-gray-900">₦{product.price.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{product.stock}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
                          {product.status}
                        </span>
                          <div className="flex items-center">
                            {getApprovalStatusIcon(product.approvalStatus)}
                            <span className="ml-1 text-xs text-gray-500">{product.approvalStatus}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>Views: {product.views}</div>
                          <div>Clicks: {product.clicks}</div>
                          <div>Conv: {product.conversionRate.toFixed(1)}%</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewProduct(product.id)}
                            className="text-primary-600 hover:text-primary-900"
                            title="View Product"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditProduct(product.id)}
                            className="text-primary-600 hover:text-primary-900"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Product"
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
                )}

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
