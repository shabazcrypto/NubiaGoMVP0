import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// TEMPORARY: Mock types since Firebase is disabled
interface AdminUser {
  uid: string
  displayName: string
  name?: string
  email: string
  role: 'customer' | 'supplier' | 'admin'
  status: 'active' | 'pending' | 'suspended'
  phoneNumber?: string
  createdAt: Date
  lastLoginAt?: Date
  updatedAt?: Date
}

interface AdminProduct {
  id: string
  name: string
  description?: string
  price: number
  status: 'active' | 'inactive' | 'draft'
  approvalStatus: 'approved' | 'pending' | 'rejected'
  supplierId: string
  supplier?: { name: string }
  category: string
  stock?: number
  submittedAt?: Date
}

interface AdminOrder {
  id: string
  customer: { name: string; email: string }
  totalAmount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items?: Array<{ productName: string }>
  supplier?: { name: string }
  paymentMethod?: string
  createdAt: Date
}

interface AdminSupplier {
  id: string
  name: string
  businessName?: string
  email: string
  ownerName?: string
  ownerEmail?: string
  ownerPhone?: string
  businessType?: string
  categories?: string[]
  status: 'active' | 'pending' | 'suspended' | 'approved' | 'rejected'
  approvalStatus: 'approved' | 'pending' | 'rejected'
  verificationStatus: {
    email: boolean
    phone: boolean
    business: boolean
  }
  businessMetrics?: {
    totalOrders: number
    totalRevenue: number
    averageRating: number
  }
}

interface UserStats {
  totalUsers: number
  activeUsers: number
  pendingUsers: number
  suspendedUsers: number
  totalSuppliers: number
  totalAdmins: number
  totalCustomers: number
  newUsersThisMonth: number
  activeUsersThisWeek: number
}

interface ProductStats {
  totalProducts: number
  activeProducts: number
  pendingApproval: number
  lowStockProducts: number
  outOfStockProducts: number
  totalCategories: number
  totalSuppliers: number
  averagePrice: number
  totalSales: number
  featuredProducts: number
}

interface OrderStats {
  totalOrders: number
  pendingOrders: number
  processingOrders: number
  shippedOrders: number
  deliveredOrders: number
  cancelledOrders: number
  totalRevenue: number
  averageOrderValue: number
  totalCommission: number
  ordersThisMonth: number
  revenueThisMonth: number
  ordersThisWeek: number
  revenueThisWeek: number
}

interface SupplierStats {
  totalSuppliers: number
  approvedSuppliers: number
  pendingSuppliers: number
  rejectedSuppliers: number
  suspendedSuppliers: number
  totalRevenue: number
  averageRating: number
  totalProducts: number
  activeCategories: number
  newSuppliersThisMonth: number
  topPerformingSuppliers: number
}

type UserFilters = Record<string, any>
type ProductFilters = Record<string, any>
type OrderFilters = Record<string, any>
type SupplierFilters = Record<string, any>

interface AdminDashboardState {
  // User Management
  users: AdminUser[]
  userStats: UserStats
  userFilters: UserFilters
  selectedUsers: string[]
  userLoading: boolean
  userError: string | null

  // Product Management
  products: AdminProduct[]
  productStats: ProductStats
  productFilters: ProductFilters
  selectedProducts: string[]
  productLoading: boolean
  productError: string | null

  // Order Management
  orders: AdminOrder[]
  orderStats: OrderStats
  orderFilters: OrderFilters
  selectedOrders: string[]
  orderLoading: boolean
  orderError: string | null

  // Supplier Management
  suppliers: AdminSupplier[]
  supplierStats: SupplierStats
  supplierFilters: SupplierFilters
  selectedSuppliers: string[]
  supplierLoading: boolean
  supplierError: string | null

  // UI State
  activeTab: string
  searchQuery: string
  showFilters: boolean
  darkMode: boolean
  loading: boolean

  // Actions
  // User Actions
  fetchUsers: (filters?: UserFilters) => Promise<void>
  updateUserRole: (uid: string, newRole: 'customer' | 'supplier' | 'admin', newStatus: 'active' | 'pending' | 'suspended', adminId: string, reason?: string) => Promise<void>
  bulkUpdateUsers: (userIds: string[], updates: Partial<AdminUser>, adminId: string, reason?: string) => Promise<void>
  deleteUser: (uid: string, adminId: string, reason?: string) => Promise<void>
  setUserFilters: (filters: UserFilters) => void
  setSelectedUsers: (userIds: string[]) => void
  clearUserSelection: () => void

  // Product Actions
  fetchProducts: (filters?: ProductFilters) => Promise<void>
  updateProductApproval: (productId: string, approvalStatus: 'approved' | 'rejected', adminId: string, notes?: string) => Promise<void>
  updateProductStatus: (productId: string, newStatus: 'active' | 'inactive' | 'draft' | 'archived', adminId: string, reason?: string) => Promise<void>
  bulkUpdateProducts: (productIds: string[], updates: Partial<AdminProduct>, adminId: string, reason?: string) => Promise<void>
  deleteProduct: (productId: string, adminId: string, reason?: string) => Promise<void>
  setProductFilters: (filters: ProductFilters) => void
  setSelectedProducts: (productIds: string[]) => void
  clearProductSelection: () => void

  // Order Actions
  fetchOrders: (filters?: OrderFilters) => Promise<void>
  updateOrderStatus: (orderId: string, newStatus: AdminOrder['status'], adminId: string, notes?: string, trackingNumber?: string) => Promise<void>
  cancelOrder: (orderId: string, adminId: string, reason: string, refundAmount?: number) => Promise<void>
  processRefund: (orderId: string, adminId: string, refundAmount: number, reason: string) => Promise<void>
  bulkUpdateOrders: (orderIds: string[], updates: Partial<AdminOrder>, adminId: string, reason?: string) => Promise<void>
  setOrderFilters: (filters: OrderFilters) => void
  setSelectedOrders: (orderIds: string[]) => void
  clearOrderSelection: () => void

  // Supplier Actions
  fetchSuppliers: (filters?: SupplierFilters) => Promise<void>
  updateSupplierApproval: (supplierId: string, approvalStatus: 'approved' | 'rejected', adminId: string, notes?: string) => Promise<void>
  suspendSupplier: (supplierId: string, adminId: string, reason: string, duration?: number) => Promise<void>
  reactivateSupplier: (supplierId: string, adminId: string, reason?: string) => Promise<void>
  updateVerificationStatus: (supplierId: string, verificationType: keyof AdminSupplier['verificationStatus'], verified: boolean, adminId: string, notes?: string) => Promise<void>
  bulkUpdateSuppliers: (supplierIds: string[], updates: Partial<AdminSupplier>, adminId: string, reason?: string) => Promise<void>
  setSupplierFilters: (filters: SupplierFilters) => void
  setSelectedSuppliers: (supplierIds: string[]) => void
  clearSupplierSelection: () => void

  // UI Actions
  setActiveTab: (tab: string) => void
  setSearchQuery: (query: string) => void
  toggleFilters: () => void
  toggleDarkMode: () => void
  setLoading: (loading: boolean) => void

  // Real-time subscriptions
  subscribeToRealTimeUpdates: () => void
  unsubscribeFromRealTimeUpdates: () => void
}

// TEMPORARY: Mock data since Firebase is disabled
const mockUsers: AdminUser[] = [
  {
    uid: '1',
    displayName: 'John Doe',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'customer',
    status: 'active',
    phoneNumber: '+1234567890',
    createdAt: new Date('2024-01-01'),
    lastLoginAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    uid: '2',
    displayName: 'Jane Smith',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'supplier',
    status: 'active',
    phoneNumber: '+1234567891',
    createdAt: new Date('2024-01-02'),
    lastLoginAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14')
  },
  {
    uid: '3',
    displayName: 'Admin User',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    status: 'active',
    phoneNumber: '+1234567892',
    createdAt: new Date('2024-01-01'),
    lastLoginAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
]

const mockProducts: AdminProduct[] = [
  {
    id: '1',
    name: 'Sample Product 1',
    description: 'High-quality electronics product',
    price: 29.99,
    status: 'active',
    approvalStatus: 'approved',
    supplierId: '2',
    supplier: { name: 'GreenTech Solutions' },
    category: 'Electronics',
    stock: 50,
    submittedAt: new Date('2024-01-05')
  },
  {
    id: '2',
    name: 'Sample Product 2',
    description: 'Premium home and garden item',
    price: 49.99,
    status: 'active',
    approvalStatus: 'approved',
    supplierId: '2',
    supplier: { name: 'GreenTech Solutions' },
    category: 'Home & Garden',
    stock: 25,
    submittedAt: new Date('2024-01-06')
  }
]

const mockOrders: AdminOrder[] = [
  {
    id: '1',
    customer: { name: 'John Doe', email: 'john@example.com' },
    totalAmount: 79.98,
    status: 'delivered',
    items: [{ productName: 'Sample Product 1' }],
    supplier: { name: 'GreenTech Solutions' },
    paymentMethod: 'Credit Card',
    createdAt: new Date('2024-01-10')
  },
  {
    id: '2',
    customer: { name: 'Jane Smith', email: 'jane@example.com' },
    totalAmount: 29.99,
    status: 'processing',
    items: [{ productName: 'Sample Product 2' }],
    supplier: { name: 'GreenTech Solutions' },
    paymentMethod: 'PayPal',
    createdAt: new Date('2024-01-12')
  }
]

const mockSuppliers: AdminSupplier[] = [
  {
    id: '1',
    name: 'TechCorp Ltd',
    businessName: 'TechCorp Ltd',
    email: 'contact@techcorp.com',
    ownerName: 'John Tech',
    ownerEmail: 'john@techcorp.com',
    ownerPhone: '+1234567893',
    businessType: 'Technology',
    categories: ['Electronics', 'Software'],
    status: 'approved',
    approvalStatus: 'approved',
    verificationStatus: {
      email: true,
      phone: true,
      business: true
    },
    businessMetrics: {
      totalOrders: 150,
      totalRevenue: 25000,
      averageRating: 4.8
    }
  },
  {
    id: '2',
    name: 'GreenTech Solutions',
    businessName: 'GreenTech Solutions',
    email: 'info@greentech.com',
    ownerName: 'Sarah Green',
    ownerEmail: 'sarah@greentech.com',
    ownerPhone: '+1234567894',
    businessType: 'Home & Garden',
    categories: ['Home & Garden', 'Electronics'],
    status: 'approved',
    approvalStatus: 'approved',
    verificationStatus: {
      email: true,
      phone: true,
      business: true
    },
    businessMetrics: {
      totalOrders: 75,
      totalRevenue: 15000,
      averageRating: 4.5
    }
  }
]

export const useAdminDashboardStore = create<AdminDashboardState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        users: [],
        userStats: {
          totalUsers: 3,
          activeUsers: 3,
          pendingUsers: 0,
          suspendedUsers: 0,
          totalSuppliers: 1,
          totalAdmins: 1,
          totalCustomers: 1,
          newUsersThisMonth: 1,
          activeUsersThisWeek: 2
        },
        userFilters: {},
        selectedUsers: [],
        userLoading: false,
        userError: null,

        products: [],
        productStats: {
          totalProducts: 2,
          activeProducts: 2,
          pendingApproval: 0,
          lowStockProducts: 0,
          outOfStockProducts: 0,
          totalCategories: 2,
          totalSuppliers: 1,
          averagePrice: 39.99,
          totalSales: 79.98,
          featuredProducts: 2
        },
        productFilters: {},
        selectedProducts: [],
        productLoading: false,
        productError: null,

        orders: [],
        orderStats: {
          totalOrders: 2,
          pendingOrders: 0,
          processingOrders: 1,
          shippedOrders: 0,
          deliveredOrders: 1,
          cancelledOrders: 0,
          totalRevenue: 109.97,
          averageOrderValue: 54.99,
          totalCommission: 10.99,
          ordersThisMonth: 2,
          revenueThisMonth: 109.97,
          ordersThisWeek: 1,
          revenueThisWeek: 29.99
        },
        orderFilters: {},
        selectedOrders: [],
        orderLoading: false,
        orderError: null,

        suppliers: [],
        supplierStats: {
          totalSuppliers: 2,
          approvedSuppliers: 2,
          pendingSuppliers: 0,
          rejectedSuppliers: 0,
          suspendedSuppliers: 0,
          totalRevenue: 15000,
          averageRating: 4.5,
          totalProducts: 15,
          activeCategories: 8,
          newSuppliersThisMonth: 1,
          topPerformingSuppliers: 2
        },
        supplierFilters: {},
        selectedSuppliers: [],
        supplierLoading: false,
        supplierError: null,

        activeTab: 'overview',
        searchQuery: '',
        showFilters: false,
        darkMode: false,
        loading: false,

        // User Actions
        fetchUsers: async (filters = {}) => {
          try {
            set({ userLoading: true, userError: null, loading: true })
            // TEMPORARY: Return mock data since Firebase is disabled
            await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
            set({ 
              users: mockUsers, 
              userLoading: false 
            })
            get().checkAllDataLoaded()
          } catch (error) {
            set({ 
              userError: error instanceof Error ? error.message : 'Failed to fetch users', 
              userLoading: false 
            })
            get().checkAllDataLoaded()
          }
        },

        updateUserRole: async (uid, newRole, newStatus, adminId, reason) => {
          try {
            // TEMPORARY: Mock update since Firebase is disabled
            console.log('Mock: Updating user role', { uid, newRole, newStatus, adminId, reason })
            await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay
            // Refresh users after update
            await get().fetchUsers(get().userFilters)
          } catch (error) {
            set({ 
              userError: error instanceof Error ? error.message : 'Failed to update user role' 
            })
            throw error
          }
        },

        bulkUpdateUsers: async (userIds, updates, adminId, reason) => {
          try {
            // TEMPORARY: Mock bulk update since Firebase is disabled
            console.log('Mock: Bulk updating users', { userIds, updates, adminId, reason })
            await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay
            // Refresh users after update
            await get().fetchUsers(get().userFilters)
            set({ selectedUsers: [] })
          } catch (error) {
            set({ 
              userError: error instanceof Error ? error.message : 'Failed to bulk update users' 
            })
            throw error
          }
        },

        deleteUser: async (uid, adminId, reason) => {
          try {
            // TEMPORARY: Mock delete since Firebase is disabled
            console.log('Mock: Deleting user', { uid, adminId, reason })
            await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay
            // Refresh users after delete
            await get().fetchUsers(get().userFilters)
          } catch (error) {
            set({ 
              userError: error instanceof Error ? error.message : 'Failed to delete user' 
            })
            throw error
          }
        },

        setUserFilters: (filters) => set({ userFilters: filters }),
        setSelectedUsers: (userIds) => set({ selectedUsers: userIds }),
        clearUserSelection: () => set({ selectedUsers: [] }),

        // Product Actions
        fetchProducts: async (filters = {}) => {
          try {
            set({ productLoading: true, productError: null, loading: true })
            // TEMPORARY: Return mock data since Firebase is disabled
            await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
            set({ 
              products: mockProducts, 
              productLoading: false 
            })
            get().checkAllDataLoaded()
          } catch (error) {
            set({ 
              productError: error instanceof Error ? error.message : 'Failed to fetch products', 
              productLoading: false 
            })
            get().checkAllDataLoaded()
          }
        },

        updateProductApproval: async (productId, approvalStatus, adminId, notes) => {
          try {
            // TEMPORARY: Mock update since Firebase is disabled
            console.log('Mock: Updating product approval', { productId, approvalStatus, adminId, notes })
            await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay
            // Refresh products after update
            await get().fetchProducts(get().productFilters)
          } catch (error) {
            set({ 
              productError: error instanceof Error ? error.message : 'Failed to update product approval' 
            })
            throw error
          }
        },

        updateProductStatus: async (productId, newStatus, adminId, reason) => {
          try {
            // TEMPORARY: Mock update since Firebase is disabled
            console.log('Mock: Updating product status', { productId, newStatus, adminId, reason })
            await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay
            // Refresh products after update
            await get().fetchProducts(get().productFilters)
          } catch (error) {
            set({ 
              productError: error instanceof Error ? error.message : 'Failed to update product status' 
            })
            throw error
          }
        },

        bulkUpdateProducts: async (productIds, updates, adminId, reason) => {
          try {
            // TEMPORARY: Mock bulk update since Firebase is disabled
            console.log('Mock: Bulk updating products', { productIds, updates, adminId, reason })
            await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay
            // Refresh products after update
            await get().fetchProducts(get().productFilters)
            set({ selectedProducts: [] })
          } catch (error) {
            set({ 
              productError: error instanceof Error ? error.message : 'Failed to bulk update products' 
            })
            throw error
          }
        },

        deleteProduct: async (productId, adminId, reason) => {
          try {
            // TEMPORARY: Mock delete since Firebase is disabled
            console.log('Mock: Deleting product', { productId, adminId, reason })
            await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay
            // Refresh products after delete
            await get().fetchProducts(get().productFilters)
          } catch (error) {
            set({ 
              productError: error instanceof Error ? error.message : 'Failed to delete product' 
            })
            throw error
          }
        },

        setProductFilters: (filters) => set({ productFilters: filters }),
        setSelectedProducts: (productIds) => set({ selectedProducts: productIds }),
        clearProductSelection: () => set({ selectedProducts: [] }),

        // Order Actions
        fetchOrders: async (filters = {}) => {
          try {
            set({ orderLoading: true, orderError: null, loading: true })
            // TEMPORARY: Return mock data since Firebase is disabled
            await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
            set({ 
              orders: mockOrders, 
              orderLoading: false 
            })
            get().checkAllDataLoaded()
          } catch (error) {
            set({ 
              orderError: error instanceof Error ? error.message : 'Failed to fetch orders', 
              orderLoading: false 
            })
            get().checkAllDataLoaded()
          }
        },

        updateOrderStatus: async (orderId, newStatus, adminId, notes, trackingNumber) => {
          try {
            // TEMPORARY: Mock update since Firebase is disabled
            console.log('Mock: Updating order status', { orderId, newStatus, adminId, notes, trackingNumber })
            await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay
            // Refresh orders after update
            await get().fetchOrders(get().orderFilters)
          } catch (error) {
            set({ 
              orderError: error instanceof Error ? error.message : 'Failed to update order status' 
            })
            throw error
          }
        },

        cancelOrder: async (orderId, adminId, reason, refundAmount) => {
          try {
            // TEMPORARY: Mock cancel since Firebase is disabled
            console.log('Mock: Cancelling order', { orderId, adminId, reason, refundAmount })
            await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay
            // Refresh orders after update
            await get().fetchOrders(get().orderFilters)
          } catch (error) {
            set({ 
              orderError: error instanceof Error ? error.message : 'Failed to cancel order' 
            })
            throw error
          }
        },

        processRefund: async (orderId, adminId, refundAmount, reason) => {
          try {
            // TEMPORARY: Mock refund since Firebase is disabled
            console.log('Mock: Processing refund', { orderId, adminId, refundAmount, reason })
            await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay
            // Refresh orders after update
            await get().fetchOrders(get().orderFilters)
          } catch (error) {
            set({ 
              orderError: error instanceof Error ? error.message : 'Failed to process refund' 
            })
            throw error
          }
        },

        bulkUpdateOrders: async (orderIds, updates, adminId, reason) => {
          try {
            // TEMPORARY: Mock bulk update since Firebase is disabled
            console.log('Mock: Bulk updating orders', { orderIds, updates, adminId, reason })
            await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay
            // Refresh orders after update
            await get().fetchOrders(get().orderFilters)
            set({ selectedOrders: [] })
          } catch (error) {
            set({ 
              orderError: error instanceof Error ? error.message : 'Failed to bulk update orders' 
            })
            throw error
          }
        },

        setOrderFilters: (filters) => set({ orderFilters: filters }),
        setSelectedOrders: (orderIds) => set({ selectedOrders: orderIds }),
        clearOrderSelection: () => set({ selectedOrders: [] }),

        // Supplier Actions
        fetchSuppliers: async (filters = {}) => {
          try {
            set({ supplierLoading: true, supplierError: null, loading: true })
            // TEMPORARY: Return mock data since Firebase is disabled
            await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
            set({ 
              suppliers: mockSuppliers, 
              supplierLoading: false 
            })
            get().checkAllDataLoaded()
          } catch (error) {
            set({ 
              supplierError: error instanceof Error ? error.message : 'Failed to fetch suppliers', 
              supplierLoading: false 
            })
            get().checkAllDataLoaded()
          }
        },

        updateSupplierApproval: async (supplierId, approvalStatus, adminId, notes) => {
          try {
            // TEMPORARY: Mock update since Firebase is disabled
            console.log('Mock: Updating supplier approval', { supplierId, approvalStatus, adminId, notes })
            await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay
            // Refresh suppliers after update
            await get().fetchSuppliers(get().supplierFilters)
          } catch (error) {
            set({ 
              supplierError: error instanceof Error ? error.message : 'Failed to update supplier approval' 
            })
            throw error
          }
        },

        suspendSupplier: async (supplierId, adminId, reason, duration) => {
          try {
            // TEMPORARY: Mock suspend since Firebase is disabled
            console.log('Mock: Suspending supplier', { supplierId, adminId, reason, duration })
            await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay
            // Refresh suppliers after update
            await get().fetchSuppliers(get().supplierFilters)
          } catch (error) {
            set({ 
              supplierError: error instanceof Error ? error.message : 'Failed to suspend supplier' 
            })
            throw error
          }
        },

        reactivateSupplier: async (supplierId, adminId, reason) => {
          try {
            // TEMPORARY: Mock reactivate since Firebase is disabled
            console.log('Mock: Reactivating supplier', { supplierId, adminId, reason })
            await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay
            // Refresh suppliers after update
            await get().fetchSuppliers(get().supplierFilters)
          } catch (error) {
            set({ 
              supplierError: error instanceof Error ? error.message : 'Failed to reactivate supplier' 
            })
            throw error
          }
        },

        updateVerificationStatus: async (supplierId, verificationType, verified, adminId, notes) => {
          try {
            // TEMPORARY: Mock update since Firebase is disabled
            console.log('Mock: Updating verification status', { supplierId, verificationType, verified, adminId, notes })
            await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay
            // Refresh suppliers after update
            await get().fetchSuppliers(get().supplierFilters)
          } catch (error) {
            set({ 
              supplierError: error instanceof Error ? error.message : 'Failed to update verification status' 
            })
            throw error
          }
        },

        bulkUpdateSuppliers: async (supplierIds, updates, adminId, reason) => {
          try {
            // TEMPORARY: Mock bulk update since Firebase is disabled
            console.log('Mock: Bulk updating suppliers', { supplierIds, updates, adminId, reason })
            await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay
            // Refresh suppliers after update
            await get().fetchSuppliers(get().supplierFilters)
            set({ selectedSuppliers: [] })
          } catch (error) {
            set({ 
              supplierError: error instanceof Error ? error.message : 'Failed to bulk update suppliers' 
            })
            throw error
          }
        },

        setSupplierFilters: (filters) => set({ supplierFilters: filters }),
        setSelectedSuppliers: (supplierIds) => set({ selectedSuppliers: supplierIds }),
        clearSupplierSelection: () => set({ selectedSuppliers: [] }),

        // UI Actions
        setActiveTab: (tab) => set({ activeTab: tab }),
        setSearchQuery: (query) => set({ searchQuery: query }),
        toggleFilters: () => set((state) => ({ showFilters: !state.showFilters })),
        toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
        setLoading: (loading) => set({ loading }),

        // Real-time subscriptions
        subscribeToRealTimeUpdates: () => {
          // TEMPORARY: Mock real-time updates since Firebase is disabled
          console.log('Mock real-time updates enabled')
        },

        unsubscribeFromRealTimeUpdates: () => {
          // TEMPORARY: Mock cleanup since Firebase is disabled
          console.log('Mock real-time updates disabled')
        },

        // Helper function to check if all data is loaded
        checkAllDataLoaded: () => {
          const state = get()
          const allLoaded = !state.userLoading && !state.supplierLoading && !state.orderLoading && !state.productLoading
          if (allLoaded) {
            set({ loading: false })
          }
        }
      }),
      {
        name: 'admin-dashboard-store',
        partialize: (state) => ({
          activeTab: state.activeTab,
          darkMode: state.darkMode,
          userFilters: state.userFilters,
          productFilters: state.productFilters,
          orderFilters: state.orderFilters,
          supplierFilters: state.supplierFilters
        })
      }
    ),
    {
      name: 'admin-dashboard-store'
    }
  )
)
