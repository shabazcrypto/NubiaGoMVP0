import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product, Cart, Wishlist, User } from '@/types'
import { mockCartService, mockWishlistService } from '@/lib/mock-services'

// ============================================================================
// MOCK CART STORE
// ============================================================================

interface MockCartState {
  items: Cart['items']
  total: number
  itemCount: number
  loading: boolean
}

interface MockCartActions {
  addItem: (product: Product, quantity?: number) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  setLoading: (loading: boolean) => void
}

export const useMockCartStore = create<MockCartState & MockCartActions>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,
      loading: false,

      addItem: async (product: Product, quantity = 1) => {
        set({ loading: true })
        try {
          const cart = await mockCartService.addToCart('user-1', product.id, quantity)
          set({
            items: cart.items,
            total: cart.total,
            itemCount: cart.itemCount,
            loading: false
          })
        } catch (error) {
          console.error('Error adding item to cart:', error)
          set({ loading: false })
        }
      },

      removeItem: async (productId: string) => {
        set({ loading: true })
        try {
          const cart = await mockCartService.removeFromCart('user-1', productId)
          set({
            items: cart.items,
            total: cart.total,
            itemCount: cart.itemCount,
            loading: false
          })
        } catch (error) {
          console.error('Error removing item from cart:', error)
          set({ loading: false })
        }
      },

      updateQuantity: async (productId: string, quantity: number) => {
        set({ loading: true })
        try {
          const cart = await mockCartService.updateCartItemQuantity('user-1', productId, quantity)
          set({
            items: cart.items,
            total: cart.total,
            itemCount: cart.itemCount,
            loading: false
          })
        } catch (error) {
          console.error('Error updating cart quantity:', error)
          set({ loading: false })
        }
      },

      clearCart: async () => {
        set({ loading: true })
        try {
          const cart = await mockCartService.clearCart('user-1')
          set({
            items: cart.items,
            total: cart.total,
            itemCount: cart.itemCount,
            loading: false
          })
        } catch (error) {
          console.error('Error clearing cart:', error)
          set({ loading: false })
        }
      },

      setLoading: (loading: boolean) => set({ loading })
    }),
    {
      name: 'mock-cart-storage',
      partialize: (state) => ({
        items: state.items,
        total: state.total,
        itemCount: state.itemCount
      })
    }
  )
)

// ============================================================================
// MOCK WISHLIST STORE
// ============================================================================

interface MockWishlistState {
  items: Wishlist['items']
  loading: boolean
}

interface MockWishlistActions {
  addItem: (product: Product) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  clearWishlist: () => Promise<void>
  setLoading: (loading: boolean) => void
}

export const useMockWishlistStore = create<MockWishlistState & MockWishlistActions>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,

      addItem: async (product: Product) => {
        set({ loading: true })
        try {
          const wishlist = await mockWishlistService.addToWishlist('user-1', product.id)
          set({
            items: wishlist.items,
            loading: false
          })
        } catch (error) {
          console.error('Error adding item to wishlist:', error)
          set({ loading: false })
        }
      },

      removeItem: async (productId: string) => {
        set({ loading: true })
        try {
          const wishlist = await mockWishlistService.removeFromWishlist('user-1', productId)
          set({
            items: wishlist.items,
            loading: false
          })
        } catch (error) {
          console.error('Error removing item from wishlist:', error)
          set({ loading: false })
        }
      },

      clearWishlist: async () => {
        set({ loading: true })
        try {
          const wishlist = await mockWishlistService.clearWishlist('user-1')
          set({
            items: wishlist.items,
            loading: false
          })
        } catch (error) {
          console.error('Error clearing wishlist:', error)
          set({ loading: false })
        }
      },

      setLoading: (loading: boolean) => set({ loading })
    }),
    {
      name: 'mock-wishlist-storage',
      partialize: (state) => ({
        items: state.items
      })
    }
  )
)

// ============================================================================
// MOCK AUTH STORE
// ============================================================================

interface MockAuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
}

interface MockAuthActions {
  setUser: (user: User | null) => void
  setAuthenticated: (authenticated: boolean) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useMockAuthStore = create<MockAuthState & MockAuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,

      setUser: (user: User | null) => set({ 
        user, 
        isAuthenticated: !!user 
      }),

      setAuthenticated: (authenticated: boolean) => set({ isAuthenticated: authenticated }),

      setLoading: (loading: boolean) => set({ loading }),

      logout: () => set({ 
        user: null, 
        isAuthenticated: false 
      })
    }),
    {
      name: 'mock-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
) 