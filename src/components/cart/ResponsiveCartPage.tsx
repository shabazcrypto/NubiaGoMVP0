'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, Heart, Tag } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import ResponsiveImage from '@/components/ui/responsive-image'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

const ResponsiveCartPage: React.FC = () => {
  const { cartItems, updateQuantity, removeItem, getTotalPrice, clearCart } = useCart()
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null)

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      })
    } else {
      updateQuantity(itemId, newQuantity)
    }
  }

  const handleRemoveItem = (itemId: string, itemName: string) => {
    removeItem(itemId)
    toast({
      title: "Item removed",
      description: `${itemName} has been removed from your cart.`,
    })
  }

  const handleClearCart = () => {
    clearCart()
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    })
  }

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === 'save10') {
      setAppliedPromo('SAVE10')
      toast({
        title: "Promo code applied!",
        description: "You saved 10% on your order.",
      })
    } else {
      toast({
        title: "Invalid promo code",
        description: "Please check your promo code and try again.",
        variant: "destructive",
      })
    }
  }

  const subtotal = getTotalPrice()
  const discount = appliedPromo === 'SAVE10' ? subtotal * 0.1 : 0
  const discountedSubtotal = subtotal - discount
  const shipping = discountedSubtotal > 50 ? 0 : 9.99
  const tax = discountedSubtotal * 0.08
  const total = discountedSubtotal + shipping + tax

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <Link href="/" className="touch-target">
              <ArrowLeft size={24} className="text-gray-700" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">Shopping Cart</h1>
          </div>
        </div>

        {/* Empty Cart */}
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag size={32} className="text-gray-400" />
          </div>
          <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-3">
            Your cart is empty
          </h2>
          <p className="text-gray-500 text-center mb-8 max-w-md">
            Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
          </p>
          <Link href="/products">
            <Button className="mobile-button bg-blue-600 hover:bg-blue-700 text-white px-8">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="touch-target">
              <ArrowLeft size={24} className="text-gray-700" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">
              Cart ({cartItems.length})
            </h1>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-sm text-red-600 hover:text-red-700 touch-target"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Shopping Cart ({cartItems.length} items)
            </h1>
            {cartItems.length > 0 && (
              <button
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Clear All Items
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4 lg:py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Cart Items - Mobile: Full width, Desktop: 2/3 width */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            {/* Free Shipping Progress - Mobile */}
            {discountedSubtotal < 50 && (
              <div className="lg:hidden bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-blue-700 font-medium">
                    Add ${(50 - discountedSubtotal).toFixed(2)} for free shipping
                  </span>
                  <span className="text-blue-600">
                    ${discountedSubtotal.toFixed(2)} / $50.00
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((discountedSubtotal / 50) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="space-y-3 lg:space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg p-4 lg:p-6 shadow-sm border border-gray-200">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-20 h-20 lg:w-24 lg:h-24 rounded-lg overflow-hidden">
                      <ResponsiveImage
                        src={item.image}
                        alt={item.name}
                        width={96}
                        height={96}
                        aspectRatio="square"
                        sizes="(max-width: 768px) 80px, 96px"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1">
                          <h3 className="text-base lg:text-lg font-medium text-gray-900 line-clamp-2 mb-1">
                            {item.name}
                          </h3>
                          <p className="text-lg lg:text-xl font-semibold text-blue-600 mb-3 lg:mb-4">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>

                        {/* Desktop Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.id, item.name)}
                          className="hidden lg:flex items-center space-x-1 text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                          <span className="text-sm">Remove</span>
                        </button>
                      </div>

                      {/* Quantity Controls & Mobile Remove */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600 lg:text-base">Quantity:</span>
                          <div className="flex items-center space-x-2 lg:space-x-3">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="touch-target bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="text-base lg:text-lg font-medium min-w-[2.5rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="touch-target bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Mobile Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.id, item.name)}
                          className="lg:hidden touch-target text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Item total:</span>
                          <span className="text-lg font-semibold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary - Mobile: Full width below items, Desktop: 1/3 width sidebar */}
          <div className="mt-6 lg:mt-0">
            <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm border border-gray-200 sticky top-20">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6">
                Order Summary
              </h2>

              {/* Free Shipping Progress - Desktop */}
              {discountedSubtotal < 50 && (
                <div className="hidden lg:block bg-blue-50 p-4 rounded-lg mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-blue-700 font-medium">
                      Add ${(50 - discountedSubtotal).toFixed(2)} for free shipping
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-blue-600">
                      ${discountedSubtotal.toFixed(2)} / $50.00
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((discountedSubtotal / 50) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Promo Code */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Tag size={16} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Promo Code</span>
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button
                    onClick={handleApplyPromo}
                    variant="outline"
                    className="px-4 py-2 text-sm"
                    disabled={!promoCode.trim()}
                  >
                    Apply
                  </Button>
                </div>
                {appliedPromo && (
                  <div className="mt-2 text-sm text-green-600 flex items-center space-x-1">
                    <span>✓ {appliedPromo} applied</span>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm lg:text-base">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm lg:text-base">
                    <span className="text-gray-600">Discount ({appliedPromo})</span>
                    <span className="font-medium text-green-600">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm lg:text-base">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm lg:text-base">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg lg:text-xl font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link href="/checkout" className="block">
                  <Button className="w-full mobile-button bg-blue-600 hover:bg-blue-700 text-white">
                    Proceed to Checkout
                  </Button>
                </Link>
                <Link href="/products" className="block">
                  <Button 
                    variant="outline" 
                    className="w-full mobile-button border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResponsiveCartPage
