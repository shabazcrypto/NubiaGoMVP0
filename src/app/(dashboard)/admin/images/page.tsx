'use client';

import React, { useState } from 'react'
import { ArrowLeft, Upload, Trash2, Search, Filter, Image as ImageIcon, FolderOpen } from 'lucide-react'
import { ImageUpload } from '@/components/ui/image-upload'
import { ImageMetadata } from '@/lib/image-utils'

interface ImageItem {
  id: string
  name: string
  url: string
  category: string
  size: string
  uploadedAt: string
  thumbnailUrl?: string
}

export default function AdminImagesPage() {
  const [images, setImages] = useState<ImageItem[]>([
    {
      id: '1',
      name: 'product-headphones-1.jpg',
      url: 'https://firebasestorage.googleapis.com/v0/b/nubiago-a000f.firebasestorage.app/o/products%2Fproduct-headphones-1.jpg?alt=media&token=0269424c-3dc9-4cf7-97fa-06946af5b5b9',
      category: 'products',
      size: '2.3 MB',
      uploadedAt: '2024-01-15',
      thumbnailUrl: 'https://firebasestorage.googleapis.com/v0/b/nubiago-a000f.firebasestorage.app/o/products%2Fproduct-headphones-1_thumb.jpg?alt=media&token=abc123'
    },
    {
      id: '2',
      name: 'avatar-user-2.jpg',
      url: 'https://firebasestorage.googleapis.com/v0/b/nubiago-a000f.firebasestorage.app/o/avatars%2Favatar-user-2.jpg?alt=media&token=25c37b6f-5150-4fce-90b3-54fd01731a8b',
      category: 'avatars',
      size: '1.1 MB',
      uploadedAt: '2024-01-14'
    },
    {
      id: '3',
      name: 'category-electronics.jpg',
      url: 'https://firebasestorage.googleapis.com/v0/b/nubiago-a000f.firebasestorage.app/o/categories%2Fcategory-electronics.jpg?alt=media&token=def456',
      category: 'categories',
      size: '3.2 MB',
      uploadedAt: '2024-01-13'
    }
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<'products' | 'categories' | 'avatars' | 'ui' | 'fallbacks'>('products')

  // Mock user ID for demo
  const userId = 'admin-user-123'

  // Handle image upload completion
  const handleImageUploadComplete = (metadata: ImageMetadata | ImageMetadata[]) => {
    if (Array.isArray(metadata)) {
      // Multiple images uploaded
      const newImages: ImageItem[] = metadata.map((img, index) => ({
        id: Date.now().toString() + index,
        name: img.originalName,
        url: img.urls.original,
        category: selectedCategory,
        size: formatFileSize(img.size),
        uploadedAt: new Date().toISOString().split('T')[0],
        thumbnailUrl: img.urls.thumbnail
      }))
      
      setImages(prev => [...newImages, ...prev])
    } else {
      // Single image uploaded
      const newImage: ImageItem = {
        id: Date.now().toString(),
        name: metadata.originalName,
        url: metadata.urls.original,
        category: selectedCategory,
        size: formatFileSize(metadata.size),
        uploadedAt: new Date().toISOString().split('T')[0],
        thumbnailUrl: metadata.urls.thumbnail
      }
      
      setImages(prev => [newImage, ...prev])
    }
    
    setShowUploadModal(false)
  }

  // Handle image upload error
  const handleImageUploadError = (error: string) => {
    console.error('Image upload failed:', error)
    // You can add toast notification here
  }

  // Delete image
  const deleteImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Filter images
  const filteredImages = images.filter(image => {
    const matchesSearch = image.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || image.category === filterCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-2 text-gray-600">
              <ArrowLeft className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Image Management</h1>
              <p className="text-gray-600 mt-2">Manage and organize your image assets</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {filteredImages.length} images
              </div>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Images
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
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Categories</option>
                <option value="products">Products</option>
                <option value="categories">Categories</option>
                <option value="avatars">Avatars</option>
                <option value="ui">UI Elements</option>
                <option value="fallbacks">Fallbacks</option>
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Images Grid */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Images ({filteredImages.length})
            </h3>
          </div>
          
          {filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <ImageIcon className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First Image
              </button>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredImages.map((image) => (
                  <div key={image.id} className="group relative bg-gray-50 rounded-lg overflow-hidden">
                    <div className="aspect-square relative">
                      <img
                        src={image.thumbnailUrl || image.url}
                        alt={image.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                          <button
                            onClick={() => window.open(image.url, '_blank')}
                            className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
                            title="View full size"
                          >
                            <ImageIcon className="h-4 w-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => deleteImage(image.id)}
                            className="p-2 bg-red-500 rounded-full shadow-lg hover:bg-red-600"
                            title="Delete image"
                          >
                            <Trash2 className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500 uppercase">
                          {image.category}
                        </span>
                        <span className="text-xs text-gray-400">
                          {image.size}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 truncate mb-1">
                        {image.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Uploaded {image.uploadedAt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Upload Images</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Category *
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="products">Products</option>
                  <option value="categories">Categories</option>
                  <option value="avatars">Avatars</option>
                  <option value="ui">UI Elements</option>
                  <option value="fallbacks">Fallbacks</option>
                </select>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Images
                </label>
                <ImageUpload
                  category={selectedCategory}
                  userId={userId}
                  multiple={true}
                  maxFiles={10}
                  generateThumbnails={true}
                  onUploadComplete={handleImageUploadComplete}
                  onUploadError={handleImageUploadError}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 