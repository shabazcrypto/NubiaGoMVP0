'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  originalPrice?: number
  inStock?: boolean
  maxQuantity?: number
  category?: string
  supplierName?: string
  variant?: {
    size?: string
    color?: string
  }
}

interface CartStore {
  items: CartItem[]
  total: number
  itemCount: number
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getItem: (id: string) => CartItem | undefined
}

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0)
}

const calculateItemCount = (items: CartItem[]): number => {
  return items.reduce((count, item) => count + item.quantity, 0)
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,

      addItem: (newItem) => {
        const { items } = get()
        
        // Ensure the item has all required properties with defaults
        const normalizedItem = {
          id: newItem.id || `item-${Date.now()}-${Math.random()}`,
          name: newItem.name || 'Unknown Product',
          price: newItem.price || 0,
          quantity: newItem.quantity || 1,
          image: newItem.image || '/product-placeholder.jpg',
          originalPrice: newItem.originalPrice,
          inStock: newItem.inStock !== undefined ? newItem.inStock : true,
          maxQuantity: newItem.maxQuantity || 99,
          category: newItem.category || 'General',
          supplierName: newItem.supplierName || 'NubiaGo',
          variant: newItem.variant
        }
        
        const existingItemIndex = items.findIndex(item => 
          item.id === normalizedItem.id && 
          JSON.stringify(item.variant) === JSON.stringify(normalizedItem.variant)
        )

        let updatedItems: CartItem[]

        if (existingItemIndex >= 0) {
          // Update existing item quantity
          updatedItems = items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + (normalizedItem.quantity || 1) }
              : item
          )
        } else {
          // Add new item
          updatedItems = [...items, normalizedItem]
        }

        set({
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemCount: calculateItemCount(updatedItems),
        })
      },

      removeItem: (id) => {
        const { items } = get()
        const updatedItems = items.filter(item => item.id !== id)
        
        set({
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemCount: calculateItemCount(updatedItems),
        })
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }

        const { items } = get()
        const updatedItems = items.map(item =>
          item.id === id ? { ...item, quantity } : item
        )

        set({
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemCount: calculateItemCount(updatedItems),
        })
      },

      clearCart: () => {
        set({
          items: [],
          total: 0,
          itemCount: 0,
        })
      },

      getItem: (id) => {
        const { items } = get()
        return items.find(item => item.id === id)
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => {
        // Use localStorage in browser, fallback to memory storage
        if (typeof window !== 'undefined') {
          return localStorage
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      }),
      partialize: (state) => ({
        items: state.items,
        total: state.total,
        itemCount: state.itemCount,
      }),
    }
  )
)
