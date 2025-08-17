'use client'

import { useState } from 'react'
import { LocalImage, ProductImage, CategoryImage, HeroImage } from './LocalImage'

/**
 * Development component to test image loading
 * Only shows in development mode
 */
export default function ImageTest() {
  const [showTest, setShowTest] = useState(false)

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  if (!showTest) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => setShowTest(true)}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm shadow-lg"
        >
          Test Images
        </button>
      </div>
    )
  }

  const testImages = [
    { type: 'Direct SVG', src: '/product-tech-1.svg' },
    { type: 'Direct JPG', src: '/product-tech-1.jpg' },
    { type: 'Hero WebP', src: '/hero-image.webp' },
    { type: 'Fallback', src: '/fallbacks/product.svg' },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Image Loading Test</h2>
          <button
            onClick={() => setShowTest(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {testImages.map((test, index) => (
            <div key={index} className="border rounded-lg p-3">
              <div className="text-sm font-medium mb-2">{test.type}</div>
              <LocalImage
                src={test.src}
                alt={test.type}
                width={150}
                height={150}
                className="border"
              />
              <div className="text-xs text-gray-500 mt-1 break-all">
                {test.src}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3">Component Tests</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border rounded-lg p-3">
              <div className="text-sm font-medium mb-2">ProductImage</div>
              <ProductImage
                productCategory="tech"
                variant={1}
                alt="Tech Product"
                width={120}
                height={120}
              />
            </div>
            <div className="border rounded-lg p-3">
              <div className="text-sm font-medium mb-2">CategoryImage</div>
              <CategoryImage
                categoryName="electronics"
                variant={0}
                alt="Electronics"
                width={120}
                height={120}
              />
            </div>
            <div className="border rounded-lg p-3">
              <div className="text-sm font-medium mb-2">HeroImage</div>
              <HeroImage
                variant={0}
                alt="Hero"
                width={120}
                height={120}
              />
            </div>
            <div className="border rounded-lg p-3">
              <div className="text-sm font-medium mb-2">Broken Link</div>
              <LocalImage
                src="/non-existent-image.svg"
                alt="Should fallback"
                width={120}
                height={120}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Open browser dev tools (F12) → Console to see image loading diagnostics
        </div>
      </div>
    </div>
  )
}
