'use client'

import { useState } from 'react'
import {
  GradientProductPlaceholder,
  CategoryIconPlaceholder,
  HeroBannerPlaceholder,
  AvatarPlaceholder,
  DealPlaceholder,
  MinimalProductPlaceholder,
  MinimalCategoryPlaceholder
} from './ImagePlaceholders'

export default function PlaceholderDemo() {
  const [showDemo, setShowDemo] = useState(false)

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  if (!showDemo) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowDemo(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm shadow-lg hover:bg-purple-700 transition-colors"
        >
          View Placeholder Options
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Image Placeholder Options</h2>
          <button
            onClick={() => setShowDemo(false)}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Current vs New */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-red-600">❌ Current (Boring)</h3>
              <div className="bg-gray-100 h-48 flex items-center justify-center rounded-lg border">
                <div className="text-center text-gray-500">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-2"></div>
                  <span className="text-sm">Product Image</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-600">✅ New (Beautiful)</h3>
              <GradientProductPlaceholder width={300} height={192} />
            </div>
          </div>

          {/* Product Placeholders */}
          <div>
            <h3 className="text-xl font-bold mb-4">🛍️ Product Placeholders</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium mb-2">Gradient Style</h4>
                <GradientProductPlaceholder width={200} height={250} />
              </div>
              <div>
                <h4 className="font-medium mb-2">Minimal Style</h4>
                <MinimalProductPlaceholder width={200} height={250} />
              </div>
              <div>
                <h4 className="font-medium mb-2">Deal Style</h4>
                <DealPlaceholder width={200} height={250} dealType="sale" />
              </div>
            </div>
          </div>

          {/* Category Placeholders */}
          <div>
            <h3 className="text-xl font-bold mb-4">📂 Category Placeholders</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <h4 className="font-medium mb-2">Electronics</h4>
                <CategoryIconPlaceholder categoryType="electronics" width={180} height={140} />
              </div>
              <div>
                <h4 className="font-medium mb-2">Fashion</h4>
                <CategoryIconPlaceholder categoryType="fashion" width={180} height={140} />
              </div>
              <div>
                <h4 className="font-medium mb-2">Home</h4>
                <CategoryIconPlaceholder categoryType="home" width={180} height={140} />
              </div>
              <div>
                <h4 className="font-medium mb-2">Beauty</h4>
                <CategoryIconPlaceholder categoryType="cosmetics" width={180} height={140} />
              </div>
            </div>
          </div>

          {/* Hero Banner */}
          <div>
            <h3 className="text-xl font-bold mb-4">🎯 Hero Banner Placeholder</h3>
            <HeroBannerPlaceholder width={600} height={300} />
          </div>

          {/* Avatars */}
          <div>
            <h3 className="text-xl font-bold mb-4">👤 Avatar Placeholders</h3>
            <div className="flex gap-4 items-center">
              <AvatarPlaceholder width={60} height={60} initials="JD" />
              <AvatarPlaceholder width={80} height={80} initials="SA" />
              <AvatarPlaceholder width={100} height={100} initials="MK" />
            </div>
          </div>

          {/* Deal Types */}
          <div>
            <h3 className="text-xl font-bold mb-4">🔥 Deal Placeholders</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium mb-2">Sale</h4>
                <DealPlaceholder width={200} height={150} dealType="sale" />
              </div>
              <div>
                <h4 className="font-medium mb-2">New</h4>
                <DealPlaceholder width={200} height={150} dealType="new" />
              </div>
              <div>
                <h4 className="font-medium mb-2">Flash</h4>
                <DealPlaceholder width={200} height={150} dealType="flash" />
              </div>
            </div>
          </div>

          {/* Implementation Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">🚀 Ready to Implement</h4>
            <p className="text-blue-800 text-sm">
              Choose any style above and I'll update your homepage immediately! 
              These placeholders are much more attractive than the current gray boxes 
              and will make your site look professional and polished.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
