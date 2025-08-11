'use client'

import { useState } from 'react'

export default function SimpleTestPage() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Simple Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Functionality Test</h2>
          <div className="space-y-4">
            <p className="text-gray-600">If you can see this page, the basic setup is working!</p>
            <div className="flex space-x-4">
              <button
                onClick={() => setCount(count + 1)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Count: {count}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">✅ Basic Setup Working:</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Next.js 14 is running</li>
            <li>React components are working</li>
            <li>Tailwind CSS is working</li>
            <li>State management is working</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 
