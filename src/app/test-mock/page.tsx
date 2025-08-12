'use client'

import { useState, useEffect } from 'react'
import { mockProductService } from '@/lib/mock-services'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { Product } from '@/types'

export default function TestMockPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { user, signIn, signOut } = useFirebaseAuth()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const allProducts = await mockProductService.getAllProducts()
      setProducts(allProducts)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    try {
      await signIn('john.doe@example.com', 'password')
      alert('Login successful!')
    } catch (error) {
      alert('Login failed: ' + error)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      alert('Logout successful!')
    } catch (error) {
      alert('Logout failed: ' + error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mock System Test</h1>
        
        {/* Auth Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Authentication Test</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Current User: {user ? user.displayName : 'None'}</p>
              <p className="text-gray-600">Email: {user ? user.email : 'None'}</p>
              <p className="text-gray-600">Role: Customer (Default)</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Login (john.doe@example.com)
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Products Test */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Products Test</h2>
          {loading ? (
            <p>Loading products...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product.id} className="border rounded-lg p-4">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-gray-600">${product.price}</p>
                  <p className="text-sm text-gray-500">{product.category}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Test Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Test Instructions:</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Click "Login" to test authentication with mock data</li>
            <li>Products should load from mock data (6 products)</li>
            <li>All images should display from local /downloads folder</li>
            <li>Authentication state should persist in localStorage</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 
