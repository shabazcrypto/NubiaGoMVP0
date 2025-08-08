import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/types'

// ============================================================================
// CART TYPES
// ============================================================================

export interface CartItem {
  productId: string
  quantity: number
  price: number
  product: Product
}

export interface Cart {
  items: CartItem[]
  total: number
  itemCount: number
  updatedAt: Date
}

// ============================================================================
// CART STORE
// ============================================================================

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
  loading: boolean
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setLoading: (loading: boolean) => void
  getTotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,
      loading: false,
      
      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(item => item.productId === product.id)
          
          if (existingItem) {
            existingItem.quantity += quantity
            return {
              ...state,
              items: [...state.items],
              total: state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
              itemCount: state.items.reduce((sum, item) => sum + item.quantity, 0)
            }
          } else {
            const newItem: CartItem = {
              productId: product.id,
              quantity,
              price: product.price,
              product
            }
            return {
              ...state,
              items: [...state.items, newItem],
              total: state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + (product.price * quantity),
              itemCount: state.items.reduce((sum, item) => sum + item.quantity, 0) + quantity
            }
          }
        })
      },
      
      removeItem: (productId: string) => {
        set((state) => ({
          ...state,
          items: state.items.filter(item => item.productId !== productId),
          total: state.items.filter(item => item.productId !== productId).reduce((sum, item) => sum + (item.price * item.quantity), 0),
          itemCount: state.items.filter(item => item.productId !== productId).reduce((sum, item) => sum + item.quantity, 0)
        }))
      },
      
      updateQuantity: (productId: string, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              ...state,
              items: state.items.filter(item => item.productId !== productId),
              total: state.items.filter(item => item.productId !== productId).reduce((sum, item) => sum + (item.price * item.quantity), 0),
              itemCount: state.items.filter(item => item.productId !== productId).reduce((sum, item) => sum + item.quantity, 0)
            }
          }
          
          const updatedItems = state.items.map(item => 
            item.productId === productId ? { ...item, quantity } : item
          )
          
          return {
            ...state,
            items: updatedItems,
            total: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
          }
        })
      },
      
      clearCart: () => {
        set({ items: [], total: 0, itemCount: 0 })
      },
      
      setLoading: (loading: boolean) => {
        set({ loading })
      },

      getTotal: () => {
        const items = get().items
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items, total: state.total, itemCount: state.itemCount })
    }
  )
) 