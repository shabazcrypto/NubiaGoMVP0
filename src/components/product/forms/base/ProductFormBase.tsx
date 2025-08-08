'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Package, Upload, Save, X, Plus, Trash2, 
  DollarSign, Tag, FileText, Image as ImageIcon
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'

export interface ProductFormData {
  name: string
  description: string
  price: number
  comparePrice?: number
  category: string
  images: string[]
  stock: number
  sku: string
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  tags: string[]
  isActive: boolean
  requiresApproval: boolean
}

export interface ProductFormProps {
  mode: 'admin' | 'supplier'
  initialData?: Partial<ProductFormData>
  onSubmit: (data: ProductFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function ProductFormBase({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}: ProductFormProps) {
  const router = useRouter()
  const { success, error } = useToast()
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    comparePrice: 0,
    category: '',
    images: [],
    stock: 0,
    sku: '',
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0
    },
    tags: [],
    isActive: mode === 'admin', // Admin can publish directly, supplier needs approval
    requiresApproval: mode === 'supplier', // Supplier products require approval
    ...initialData
  })

  const [newTag, setNewTag] = useState('')
  const [uploadingImages, setUploadingImages] = useState(false)

  // Handle form field changes
  const handleFieldChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle nested field changes
  const handleNestedFieldChange = (parentField: string, field: string, value: any) => {
    setFormData(prev => {
      const parentValue = prev[parentField as keyof ProductFormData]
      if (parentValue && typeof parentValue === 'object' && !Array.isArray(parentValue)) {
        return {
          ...prev,
          [parentField]: {
            ...(parentValue as Record<string, any>),
            [field]: value
          }
        }
      }
      return prev
    })
  }

  // Add tag
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // Handle image upload
  const handleImageUpload = async (files: FileList) => {
    setUploadingImages(true)
    try {
      // Simulate image upload - replace with actual Firebase Storage upload
      const uploadedUrls = await Promise.all(
        Array.from(files).map(async (file) => {
          // Mock upload - replace with actual upload logic
          await new Promise(resolve => setTimeout(resolve, 1000))
          return `https://firebasestorage.googleapis.com/v0/b/nubiago-a000f.firebasestorage.app/o/products%2F${file.name}?alt=media&token=mock-token`
        })
      )
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }))
      success('Images uploaded successfully!')
    } catch (err) {
      error('Failed to upload images')
    } finally {
      setUploadingImages(false)
    }
  }

  // Remove image
  const handleRemoveImage = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== imageUrl)
    }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price || !formData.category) {
      error('Please fill in all required fields')
      return
    }

    try {
      await onSubmit(formData)
      success(`Product ${mode === 'admin' ? 'created' : 'submitted for approval'} successfully!`)
      router.push(mode === 'admin' ? '/admin/products' : '/supplier/products')
    } catch (err) {
      error('Failed to save product')
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">
          {mode === 'admin' ? 'Create New Product' : 'Add New Product'}
        </h2>
        <p className="text-gray-600 mt-1">
          {mode === 'admin' 
            ? 'Create a new product with full admin privileges'
            : 'Add a new product to your catalog (requires approval)'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter product name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU *
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => handleFieldChange('sku', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter SKU"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleFieldChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Select category</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="home">Home & Living</option>
                <option value="beauty">Beauty & Health</option>
                <option value="sports">Sports & Outdoors</option>
                <option value="books">Books & Media</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => handleFieldChange('stock', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter product description"
              required
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Pricing
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleFieldChange('price', parseFloat(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compare Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={formData.comparePrice || ''}
                  onChange={(e) => handleFieldChange('comparePrice', parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ImageIcon className="h-5 w-5 mr-2" />
            Product Images
          </h3>
          
          <div className="space-y-4">
            {/* Image Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Drag and drop images here, or click to select</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer"
              >
                {uploadingImages ? 'Uploading...' : 'Choose Images'}
              </label>
            </div>

            {/* Image Preview */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(image)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Tag className="h-5 w-5 mr-2" />
            Tags
          </h3>
          
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        {mode === 'admin' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Status
            </h3>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleFieldChange('isActive', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Publish immediately (admin only)
              </label>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {mode === 'admin' ? 'Create Product' : 'Submit for Approval'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
} 