'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Search, Filter, Edit, Eye, Trash2, X } from 'lucide-react'
import { ImageUpload } from '@/components/ui/image-upload'
import { SupplierImageUpload } from '@/components/supplier/supplier-image-upload'
import { SupplierImageManager } from '@/components/supplier/supplier-image-manager'
import { ImageMetadata } from '@/lib/image-utils'

interface Product {
  id: number
  name: string
  price: number
  status: string
  stock: number
  category: string
  image: string
}

interface NewProduct {
  name: string
  price: number
  category: string
  stock: number
  description: string
  images: string[]
}

export default function SupplierProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: '',
    price: 0,
    category: '',
    stock: 0,
    description: '',
    images: []
  })

  // Mock user ID for demo
  const userId = 'supplier-user-123'

  // Handle product actions
  const handleViewProduct = (productId: number) => {
    alert(`Viewing product ${productId}`)
    // Navigate to product detail page
    // router.push(`/products/${productId}`)
  }

  const handleEditProduct = (productId: number) => {
    alert(`Editing product ${productId}`)
    // Navigate to product edit page
    // router.push(`/products/${productId}/edit`)
  }

  const handleDeleteProduct = (productId: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(product => product.id !== productId))
      alert('Product deleted successfully!')
    }
  }

  useEffect(() => {
    // Simulate loading products
    setTimeout(() => {
      setProducts([
        {
          id: 1,
          name: 'Wireless Bluetooth Headphones',
          price: 89.99,
          status: 'active',
          stock: 45,
          category: 'Electronics',
          image: 'https://firebasestorage.googleapis.com/v0/b/nubiago-a000f.firebasestorage.app/o/products%2Fproduct-headphones-1.jpg?alt=media&token=0269424c-3dc9-4cf7-97fa-06946af5b5b9'
        },
        {
          id: 2,
          name: 'Premium Cotton T-Shirt',
          price: 24.99,
          status: 'active',
          stock: 120,
          category: 'Men',
          image: 'https://firebasestorage.googleapis.com/v0/b/nubiago-a000f.firebasestorage.app/o/products%2Fproduct-watch-1.jpg?alt=media&token=684f73a3-7bfd-45d0-bba4-0412320887bf'
        },
        {
          id: 4,
          name: 'Women\'s Summer Dress',
          price: 49.99,
          status: 'active',
          stock: 65,
          category: 'Women',
          image: 'https://firebasestorage.googleapis.com/v0/b/nubiago-a000f.firebasestorage.app/o/products%2Fproduct-electronics-1.jpg?alt=media&token=837abd91-14f9-4e9e-ad43-750608e37426'
        },
        {
          id: 5,
          name: 'Baby Onesie Set',
          price: 19.99,
          status: 'active',
          stock: 95,
          category: 'Mother & Child',
          image: 'https://firebasestorage.googleapis.com/v0/b/nubiago-a000f.firebasestorage.app/o/products%2Fproduct-clothing-1.jpg?alt=media&token=fc3cd73e-fc43-4820-9f57-3993b5d88bf9'
        },
        {
          id: 6,
          name: 'Lipstick Collection',
          price: 24.99,
          status: 'active',
          stock: 110,
          category: 'Cosmetics',
          image: 'https://firebasestorage.googleapis.com/v0/b/nubiago-a000f.firebasestorage.app/o/products%2Fproduct-lipstick-1.jpg?alt=media&token=3q4r5s6t-7u8v-9w0x-1y2z-3a4b5c6d7e8f'
        },
        {
          id: 7,
          name: 'Leather Handbag',
          price: 79.99,
          status: 'active',
          stock: 35,
          category: 'Shoes & Bags',
          image: 'https://firebasestorage.googleapis.com/v0/b/nubiago-a000f.firebasestorage.app/o/products%2Fproduct-shoes-2.jpg?alt=media&token=1a056417-94f4-4803-9302-20907ffe1ed5'
        },
        {
          id: 3,
          name: 'Ceramic Coffee Mug Set',
          price: 19.99,
          status: 'draft',
          stock: 0,
          category: 'Home & Living',
          image: 'https://firebasestorage.googleapis.com/v0/b/nubiago-a000f.firebasestorage.app/o/products%2Fproduct-shoes-1.jpg?alt=media&token=7e78981a-54fb-4745-8923-30d432eb8bcf'
        }
      ])
      setIsLoading(false)
    }, 1000)
  }, [])

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || product.status === filterStatus
    return matchesSearch && matchesFilter
  })

  // Handle image upload completion
  const handleImageUploadComplete = (metadata: ImageMetadata) => {
    // Single image uploaded
    setNewProduct(prev => ({
      ...prev,
      images: [...prev.images, metadata.urls.original]
    }))
  }

  // Handle image upload error
  const handleImageUploadError = (error: string) => {
    console.error('Image upload failed:', error)
    // Show error toast notification
    alert(`Image upload failed: ${error}`)
  }

  // Remove image
  const removeImage = (index: number) => {
    setNewProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Product created:', newProduct)
    
    // Add the new product to the list
    const newProductItem: Product = {
      id: products.length + 1,
      name: newProduct.name,
      price: newProduct.price,
      status: 'active',
      stock: newProduct.stock,
      category: newProduct.category,
      image: newProduct.images[0] || ''
    }
    
    setProducts(prev => [newProductItem, ...prev])
    
    // Show success message
    alert('Product created successfully!')
    
    // Reset form and close modal
    setNewProduct({
      name: '',
      price: 0,
      category: '',
      stock: 0,
      description: '',
      images: []
    })
    setShowAddModal(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/supplier" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600 mt-2">Manage your product catalog</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Products ({filteredProducts.length})
            </h3>
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </button>
            </div>
          ) : (
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
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover mr-4"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">ID: {product.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.status === 'active' ? 'bg-green-100 text-green-800' :
                          product.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewProduct(product.id)}
                            className="text-primary-600 hover:text-primary-900"
                            title="View product"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditProduct(product.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit product"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Add New Product</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={newProduct.category}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select category</option>
                    <option value="Women">Women</option>
                    <option value="Men">Men</option>
                    <option value="Mother & Child">Mother & Child</option>
                    <option value="Home & Living">Home & Living</option>
                    <option value="Cosmetics">Cosmetics</option>
                    <option value="Shoes & Bags">Shoes & Bags</option>
                    <option value="Electronics">Electronics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, stock: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Describe your product..."
                />
              </div>

              {/* Images Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images
                </label>
                
                {/* Current Images */}
                {newProduct.images.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {newProduct.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Upload */}
                <SupplierImageUpload
                  productId="new-product"
                  userId={userId}
                  onUploadComplete={handleImageUploadComplete}
                  onUploadError={handleImageUploadError}
                  showOptimizationInfo={true}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <Plus className="h-4 w-4 mr-2 inline" />
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 