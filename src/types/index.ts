// User types
export interface User {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  phoneNumber?: string
  role?: 'customer' | 'supplier' | 'admin'
  status?: 'active' | 'suspended' | 'pending'
  emailVerified?: boolean
  approvedAt?: Date
  approvedBy?: string
  rejectedAt?: Date
  rejectedBy?: string
  rejectionReason?: string
  suspendedAt?: Date
  suspendedBy?: string
  suspensionReason?: string
  reactivatedAt?: Date
  reactivatedBy?: string
  createdAt: Date
  updatedAt: Date
}

// Product types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  imageUrl: string // Main image URL from Firebase Storage
  images: string[] // Array of additional image URLs
  thumbnailUrl: string // Optimized thumbnail URL
  category: string
  subcategory?: string
  brand?: string
  sku: string
  stock: number
  rating: number
  reviewCount: number
  tags: string[]
  specifications?: Record<string, any>
  isActive: boolean
  isFeatured: boolean
  createdAt: Date
  updatedAt: Date
}

// Category types
export interface Category {
  id: string
  name: string
  description?: string
  image: string
  slug: string
  parentId?: string
  isActive: boolean
  order: number
}

// Cart types
export interface CartItem {
  productId: string
  quantity: number
  price: number
  product: Product
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  total: number
  itemCount: number
  updatedAt: Date
}

// Order types
export interface OrderItem {
  productId: string
  quantity: number
  price: number
  product: Product
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  total: number
  subtotal: number
  tax: number
  shipping: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  shippingAddress: Address
  billingAddress: Address
  paymentMethod: string
  trackingNumber?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'

// Address types
export interface Address {
  id?: string
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
  isDefault?: boolean
}

// Review types
export interface Review {
  id: string
  productId: string
  userId: string
  rating: number
  title: string
  comment: string
  images?: string[]
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

// Wishlist types
export interface WishlistItem {
  productId: string
  product: Product
  addedAt: Date
}

export interface Wishlist {
  id: string
  userId: string
  items: WishlistItem[]
  updatedAt: Date
}

// Search and Filter types
export interface SearchFilters {
  category?: string
  priceRange?: {
    min: number
    max: number
  }
  rating?: number[]
  brand?: string[]
  availability?: 'in-stock' | 'out-of-stock'
  sortBy?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'rating' | 'newest'
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// API Management types
export interface ApiConfiguration {
  id: string
  name: string
  type: 'logistics' | 'payment' | 'communication' | 'analytics' | 'storage' | 'other'
  provider: string
  apiKey?: string
  apiSecret?: string
  baseUrl?: string
  webhookUrl?: string
  isActive: boolean
  isTestMode: boolean
  config: Record<string, any>
  createdAt: Date
  updatedAt: Date
  lastTested?: Date
  status: 'active' | 'inactive' | 'error' | 'testing'
  errorMessage?: string
}

export interface ApiTestResult {
  success: boolean
  message: string
  responseTime?: number
  error?: string
  timestamp: Date
}

export interface ApiProvider {
  id: string
  name: string
  type: 'logistics' | 'payment' | 'communication' | 'analytics' | 'storage' | 'other'
  description: string
  logo?: string
  website?: string
  documentation?: string
  features: string[]
  pricing?: string
  isPopular?: boolean
} 