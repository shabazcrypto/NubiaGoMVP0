/**
 * 🛡️ UI DESIGN PROTECTION NOTICE
 * 
 * This file contains UI elements that are PROTECTED from changes.
 * The current design is FROZEN and cannot be modified unless:
 * 1. User explicitly requests a specific change
 * 2. User confirms the change before implementation
 * 3. Change is documented in UI_DESIGN_PROTECTION.md
 * 
 * DO NOT MODIFY UI ELEMENTS WITHOUT EXPLICIT USER AUTHORIZATION
 * 
 * @ui-protected: true
 * @requires-user-approval: true
 * @last-approved: 2024-12-19
 */

'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { Trash, Plus, Minus, ShoppingBag, ArrowRight, Heart, Share2, Save, Eye, Star, Truck, Shield, CreditCard, Clock, Tag, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils'
import { CURRENCY } from '@/lib/constants'
import Image from 'next/image'
import Link from 'next/link'

interface CartItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  quantity: number
  image: string
  inStock: boolean
  maxQuantity?: number
  category: string
  supplierName: string
}

interface RecommendedItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviewCount: number
  category: string
  isPrime?: boolean
  discount?: number
}

interface ShoppingCartProps {
  items: CartItem[]
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemoveItem: (itemId: string) => void
  onClearCart: () => void
  onCheckout: () => void
  onSaveForLater?: (itemId: string) => void
  onMoveToCart?: (itemId: string) => void
  onAddToCart?: (item: RecommendedItem) => void
  onAddToWishlist?: (item: RecommendedItem) => void
  className?: string
}

const ShoppingCart = React.memo(function ShoppingCart({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  onSaveForLater,
  onMoveToCart,
  onAddToCart,
  onAddToWishlist,
  className = ''
}: ShoppingCartProps) {
  // Apply compact styles if cart-compact-v2 class is present
  const isCompact = className.includes('cart-compact-v2')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [savedItems, setSavedItems] = useState<CartItem[]>([])

  const subtotal = useMemo(() => 
    items.reduce((sum, item) => sum + (item.price * item.quantity), 0), 
    [items]
  )
  const totalItems = useMemo(() => 
    items.reduce((sum, item) => sum + item.quantity, 0), 
    [items]
  )
  const FREE_SHIP_THRESHOLD = 50
  const SHIPPING_FLAT = 5.99
  const TAX_RATE = 0.08
  const shipping = useMemo(() =>
    subtotal > FREE_SHIP_THRESHOLD ? 0 : SHIPPING_FLAT,
    [subtotal]
  )
  const tax = useMemo(() =>
    subtotal * TAX_RATE,
    [subtotal]
  )
  const total = useMemo(() => 
    subtotal + shipping + tax, 
    [subtotal, shipping, tax]
  )

  const handleQuantityChange = useCallback((itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    const item = items.find(i => i.id === itemId)
    if (item && item.maxQuantity && newQuantity > item.maxQuantity) return
    onUpdateQuantity(itemId, newQuantity)
  }, [items, onUpdateQuantity])

  const handleQuantityInputChange = (itemId: string, value: string) => {
    const quantity = parseInt(value) || 1
    const item = items.find(i => i.id === itemId)
    if (item) {
      const maxQuantity = item.maxQuantity || 99
      const validQuantity = Math.max(1, Math.min(quantity, maxQuantity))
      onUpdateQuantity(itemId, validQuantity)
    }
  }

  const handleRemoveItem = (itemId: string) => {
    onRemoveItem(itemId)
  }

  const handleSaveForLater = (itemId: string) => {
    const item = items.find(i => i.id === itemId)
    if (item) {
      setSavedItems([...savedItems, item])
      onRemoveItem(itemId)
    }
  }

  const handleMoveToCart = (itemId: string) => {
    const item = savedItems.find(i => i.id === itemId)
    if (item) {
      setSavedItems(savedItems.filter(i => i.id !== itemId))
      // Add back to cart logic would go here
    }
  }

  if (items.length === 0 && savedItems.length === 0) {
    return (
              <div className={`bg-white rounded-lg shadow-md border border-gray-100 ${className} ${isCompact ? 'max-w-xs scale-90 transform-gpu' : ''}`}>
        <div className="text-center py-6 px-3">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Your cart is empty
          </h3>
          <p className="text-gray-500 mb-4 text-xs">
            Add some products to get started
          </p>
          <Button 
            onClick={() => window.history.back()}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-1.5 rounded-md text-xs"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  return (
          <div className={`bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden ${className} ${isCompact ? 'max-w-xs scale-90 transform-gpu' : ''}`}>
      {/* Compact Cart Header */}
      <div className={`bg-gradient-to-r from-primary-600 to-primary-700 text-white ${isCompact ? 'p-2' : 'p-3'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`bg-white/20 rounded-full flex items-center justify-center ${isCompact ? 'w-5 h-5' : 'w-6 h-6'}`}>
              <ShoppingBag className={isCompact ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
            </div>
            <div>
              <h2 className={`font-bold ${isCompact ? 'text-xs' : 'text-sm'}`}>
                Cart
              </h2>
              <p className="text-primary-100 text-xs">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white/80 hover:text-white transition-colors"
          >
            {isCollapsed ? (
              <Plus className="h-4 w-4" />
            ) : (
              <Minus className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Cart Items - Compact Design */}
          <div className={`overflow-y-auto ${isCompact ? 'max-h-36' : 'max-h-48'}`}>
            <div className="divide-y divide-gray-100">
              {items.map((item, index) => (
                <div key={item.id || `cart-item-${index}`} className={`hover:bg-gray-50 transition-colors ${isCompact ? 'p-2' : 'p-3'}`}>
                  <div className="flex gap-2">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className={`bg-gray-100 rounded-md overflow-hidden ${isCompact ? 'w-10 h-10' : 'w-12 h-12'}`}>
                        <Image
                          src={item.image || '/fallback-product.jpg'}
                          alt={`${item.name} - Product image`}
                          width={isCompact ? 40 : 48}
                          height={isCompact ? 40 : 48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight">
                            {item.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">{item.supplierName}</p>
                          
                          {/* Price and Savings */}
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs font-bold text-gray-900">
                              {formatPrice(item.price, CURRENCY.CODE)}
                            </span>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <>
                                <span className="text-xs text-gray-400 line-through">
                                  {formatPrice(item.originalPrice, CURRENCY.CODE)}
                                </span>
                                <span className="text-xs text-green-600 font-medium bg-green-50 px-1 py-0.5 rounded">
                                  Save {formatPrice(item.originalPrice - item.price, CURRENCY.CODE)}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Stock Status */}
                          {!item.inStock && (
                            <span className="text-xs text-red-500 mt-1 inline-block bg-red-50 px-1.5 py-0.5 rounded">
                              Out of stock
                            </span>
                          )}
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500 font-medium">Qty:</span>
                          <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Minus className="h-2.5 w-2.5" />
                            </button>
                            
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleQuantityInputChange(item.id, e.target.value)}
                              min="1"
                              max={item.maxQuantity || 99}
                              className="w-8 text-center text-xs border-0 focus:ring-0 bg-transparent"
                              disabled={!item.inStock}
                            />
                            
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={item.maxQuantity ? item.quantity >= item.maxQuantity : false}
                              className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Plus className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <div className="text-xs font-bold text-gray-900">
                            {formatPrice(item.price * item.quantity, CURRENCY.CODE)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compact Cart Summary */}
          <div className={`border-t border-gray-100 bg-gray-50 ${isCompact ? 'p-2' : 'p-3'}`}>
            {/* Summary Details */}
            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                <span className="font-semibold">{formatPrice(subtotal, CURRENCY.CODE)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-semibold' : 'font-semibold'}>
                  {shipping === 0 ? 'Free' : formatPrice(shipping, CURRENCY.CODE)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Tax</span>
                <span className="font-semibold">{formatPrice(tax, CURRENCY.CODE)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between font-bold text-sm">
                  <span>Total</span>
                  <span className="text-primary-600">{formatPrice(total, CURRENCY.CODE)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={onCheckout}
                disabled={items.some(item => !item.inStock)}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold py-2 rounded-md shadow-sm hover:shadow-md transition-all duration-200 text-xs"
              >
                <ShoppingBag className="h-3 w-3 mr-1" />
                Checkout
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
              
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  onClick={onClearCart}
                  className="flex-1 text-xs border-gray-200 hover:bg-gray-50 py-1"
                >
                  Clear
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="flex-1 text-xs border-gray-200 hover:bg-gray-50 py-1"
                >
                  Continue
                </Button>
              </div>
            </div>

            {/* Shipping Info */}
            {subtotal < FREE_SHIP_THRESHOLD && (
              <div className="mt-3 p-2 bg-blue-50 rounded-md border border-blue-100">
                <div className="flex items-center gap-1">
                  <Truck className="h-3 w-3 text-blue-600" />
                  <p className="text-xs text-blue-800 font-medium">
                    Add {formatPrice(FREE_SHIP_THRESHOLD - subtotal, CURRENCY.CODE)} more for free shipping!
                  </p>
                </div>
              </div>
            )}

            {/* Security Badge */}
            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-gray-500">
              <Shield className="h-2.5 w-2.5" />
              <span>Secure checkout</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
})

export default ShoppingCart 
