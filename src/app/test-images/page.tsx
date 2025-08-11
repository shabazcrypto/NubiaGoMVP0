'use client'

import { useState, useEffect } from 'react'
import { SafeImage } from '@/components/ui/safe-image'
import { getImagePath, imageExists } from '@/lib/image-utils'

export default function TestImagesPage() {
  const [testResults, setTestResults] = useState<Array<{
    imageName: string
    exists: boolean
    path: string
    status: 'loading' | 'success' | 'error'
  }>>([])

  // Test images from the codebase
  const testImages = [
    'product-lipstick-1.jpg',
    'avatar-user-5.jpg',
    'product-recommendation-2.jpg',
    'avatar-user-1.jpg',
    'product-cosmetics-1.jpg',
    'product-laptop-1.jpg',
    'category-cosmetics.jpg',
    'product-headphones-1.jpg',
    'product-watch-1.jpg',
    'product-bag-1.jpg',
    'product-shoes-1.jpg',
    'product-home-1.jpg',
    'category-electronics.jpg',
    'category-men.jpg',
    'category-home-living.jpg',
    'category-shoes-bags.jpg',
    'category-mother-child.jpg',
    'ui-logo-1.jpg',
    'ui-logo-2.jpg',
    'ui-logo-3.jpg',
    'ui-logo-4.jpg',
    'ui-hero-banner.jpg',
    'product-bag-2.jpg',
    'product-watch-3.jpg',
    'product-logo-1.jpg',
    'product-clothing-1.jpg',
    'product-brand-1.jpg',
    'product-fashion-1.jpg',
    'product-tech-1.jpg',
    'product-accessories-1.jpg',
    'product-lifestyle-1.jpg',
    'category-electronics-2.jpg',
    'product-recommendation-1.jpg',
    'product-recommendation-3.jpg',
    'product-recommendation-4.jpg',
    'product-recommendation-6.jpg',
    'avatar-user-2.jpg',
    'avatar-user-3.jpg',
    'avatar-user-4.jpg'
  ]

  useEffect(() => {
    const results = testImages.map(imageName => ({
      imageName,
      exists: imageExists(imageName),
      path: getImagePath(imageName),
      status: 'loading' as const
    }))
    
    setTestResults(results)
  }, [])

  const handleImageLoad = (imageName: string) => {
    setTestResults(prev => 
      prev.map(result => 
        result.imageName === imageName 
          ? { ...result, status: 'success' as const }
          : result
      )
    )
  }

  const handleImageError = (imageName: string) => {
    setTestResults(prev => 
      prev.map(result => 
        result.imageName === imageName 
          ? { ...result, status: 'error' as const }
          : result
      )
    )
  }

  const successCount = testResults.filter(r => r.status === 'success').length
  const errorCount = testResults.filter(r => r.status === 'error').length
  const loadingCount = testResults.filter(r => r.status === 'loading').length

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Image Loading Test</h1>
        
        {/* Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
              <div className="text-sm text-green-700">Success</div>
            </div>
            <div className="bg-red-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-sm text-red-700">Errors</div>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{loadingCount}</div>
              <div className="text-sm text-yellow-700">Loading</div>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{testResults.length}</div>
              <div className="text-sm text-blue-700">Total</div>
            </div>
          </div>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {testResults.map((result) => (
            <div key={result.imageName} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-square relative">
                <SafeImage
                  src={result.path}
                  alt={result.imageName}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                  onLoad={() => handleImageLoad(result.imageName)}
                  onError={() => handleImageError(result.imageName)}
                />
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                  result.status === 'success' ? 'bg-green-500 text-white' :
                  result.status === 'error' ? 'bg-red-500 text-white' :
                  'bg-yellow-500 text-white'
                }`}>
                  {result.status}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 truncate">{result.imageName}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {result.exists ? '✅ Exists' : '❌ Missing'}
                </p>
                <p className="text-xs text-gray-400 mt-1 truncate">{result.path}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 
