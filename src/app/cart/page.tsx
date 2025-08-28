'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ShoppingBag, Trash, Plus, Minus, Shield, Truck, CreditCard, Star, Clock, Tag, AlertTriangle, Heart } from 'lucide-react'
import { useCartStore } from '@/hooks/useCartStore'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/toast'
import EnhancedImage from '@/components/mobile/EnhancedImage'

export default function CartPage() {
  const { items, total, itemCount, updateQuantity, removeItem, clearCart } = useCartStore()
  const { user } = useAuth()
  const router = useRouter()
  const { success, error } = useToast()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading for better UX
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    try {
      updateQuantity(itemId, newQuantity)
      success('Quantity updated')
    } catch (err) {
      error('Failed to update quantity')
    }
  }

  const handleRemoveItem = (itemId: string) => {
    try {
      removeItem(itemId)
      success('Item removed from cart')
    } catch (err) {
      error('Failed to remove item')
    }
  }

  const handleClearCart = () => {
    try {
      clearCart()
      success('Cart cleared')
    } catch (err) {
      error('Failed to clear cart')
    }
  }

  const handleCheckout = () => {
    if (items.length === 0) {
      error('Your cart is empty')
      return
    }
    
    // Allow guest checkout
    router.push('/checkout')
  }

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = subtotal > 50 ? 0 : 5.99
  const tax = subtotal * 0.08
  const finalTotal = subtotal + shipping + tax

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary-400 rounded-full animate-ping"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading your cart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/products" 
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors duration-200 mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Continue Shopping</span>
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-1">
                Shopping Cart
              </h1>
              <p className="text-lg text-gray-600">
                Review your items and proceed to secure checkout
              </p>
            </div>
            
            <div className="mt-4 lg:mt-0 flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-4 w-4 text-primary-600" />
                <span>{itemCount} Items</span>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-green-600" />
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">Secure Payment</div>
                <div className="text-xs text-gray-500">256-bit SSL encryption</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Truck className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">Free Shipping</div>
                <div className="text-xs text-gray-500">On orders over $50</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">Easy Returns</div>
                <div className="text-xs text-gray-500">30-day return policy</div>
              </div>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          /* Empty Cart */
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] p-12 text-center">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          /* Cart with Items */
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Cart Items</h2>
                  <button
                    onClick={handleClearCart}
                    className="text-sm text-red-600 hover:text-red-700 transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
                      <div className="w-20 h-20 flex-shrink-0">
                        <EnhancedImage
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.category}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="font-semibold text-gray-900">${item.price}</span>
                          {item.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">${item.originalPrice}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-50 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="h-4 w-4 text-gray-600" />
                        </button>
                        <span className="w-12 text-center font-medium text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= (item.maxQuantity || 99)}
                          className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-50 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({itemCount} items)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    Proceed to Checkout
                  </button>
                  
                  <Link
                    href="/products"
                    className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm hover:bg-gray-50 transition-colors text-center block"
                  >
                    Continue Shopping
                  </Link>
                </div>

                {/* Free Shipping Progress */}
                {subtotal < 50 && (
                  <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="h-4 w-4 text-primary-600" />
                      <span className="text-sm font-medium text-primary-800">Free Shipping Progress</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((subtotal / 50) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-primary-700">
                      Add ${(50 - subtotal).toFixed(2)} more to get free shipping!
                    </p>
                  </div>
                )}

                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Shield className="h-3 w-3" />
                  <span>Secure checkout with SSL encryption</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
