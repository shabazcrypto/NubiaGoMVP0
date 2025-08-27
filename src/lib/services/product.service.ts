import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore'
import { Product } from '@/types'

// Safe Firebase import with fallback
let db: any = null
let firebaseAvailable = false

try {
  // Try to import Firebase config
  if (typeof window !== 'undefined') {
    // Client-side: use dynamic import
    import('@/lib/firebase/config').then((firebaseConfig) => {
      db = firebaseConfig.db
      firebaseAvailable = !!db
      console.log('Firebase initialized successfully')
    }).catch((error) => {
      console.warn('Firebase not available, using mock data:', error)
      firebaseAvailable = false
    })
  } else {
    // Server-side: use require
    const firebaseConfig = require('@/lib/firebase/config')
    db = firebaseConfig.db
    firebaseAvailable = !!db
  }
} catch (error) {
  console.warn('Firebase not available, using mock data:', error)
  firebaseAvailable = false
}

// Mock data fallback for when Firebase fails - EXPANDED for better display
let MOCK_PRODUCTS: Product[] = [
  {
    id: 'mock-1',
    name: 'Premium Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 299.99,
    currency: 'USD',
    category: 'Electronics',
    imageUrl: '/product-headphones-1.jpg',
    images: ['/product-headphones-1.jpg', '/product-headphones-2.jpg'],
    thumbnailUrl: '/product-headphones-1.jpg',
    tags: ['wireless', 'noise-cancelling', 'premium'],
    specifications: {
      'Connectivity': 'Bluetooth 5.0',
      'Battery Life': '30 hours',
      'Weight': '250g'
    },
    inventory: 25,
    stock: 25,
    supplierId: 'supplier-1',
    rating: 4.8,
    reviewCount: 156,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mock-2',
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracking with heart rate monitoring',
    price: 199.99,
    currency: 'USD',
    category: 'Electronics',
    imageUrl: '/product-watch-1.jpg',
    images: ['/product-watch-1.jpg', '/product-watch-2.jpg'],
    thumbnailUrl: '/product-watch-1.jpg',
    tags: ['fitness', 'smartwatch', 'health'],
    specifications: {
      'Display': '1.4" AMOLED',
      'Battery Life': '7 days',
      'Water Resistance': '5ATM'
    },
    inventory: 18,
    stock: 18,
    supplierId: 'supplier-2',
    rating: 4.6,
    reviewCount: 89,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mock-3',
    name: 'Premium Running Sneakers',
    description: 'Professional running shoes with advanced cushioning',
    price: 149.99,
    currency: 'USD',
    category: 'Sports',
    imageUrl: '/product-shoes-1.jpg',
    images: ['/product-shoes-1.jpg', '/product-shoes-2.jpg'],
    thumbnailUrl: '/product-shoes-1.jpg',
    tags: ['running', 'athletic', 'comfortable'],
    specifications: {
      'Weight': '280g',
      'Drop': '8mm',
      'Terrain': 'Road'
    },
    inventory: 32,
    stock: 32,
    supplierId: 'supplier-3',
    rating: 4.7,
    reviewCount: 234,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mock-4',
    name: 'Designer Handbag',
    description: 'Luxury leather handbag with premium craftsmanship',
    price: 399.99,
    originalPrice: 599.99,
    currency: 'USD',
    category: 'Fashion',
    imageUrl: '/product-bag-1.jpg',
    images: ['/product-bag-1.jpg', '/product-bag-2.jpg'],
    thumbnailUrl: '/product-bag-1.jpg',
    tags: ['luxury', 'leather', 'designer'],
    specifications: {
      'Material': 'Genuine Leather',
      'Dimensions': '30cm x 20cm x 10cm',
      'Color': 'Brown'
    },
    inventory: 15,
    stock: 15,
    supplierId: 'supplier-4',
    rating: 4.9,
    reviewCount: 89,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mock-5',
    name: 'Organic Skincare Set',
    description: 'Natural skincare products for all skin types',
    price: 89.99,
    currency: 'USD',
    category: 'Beauty',
    imageUrl: '/product-cosmetics-1.jpg',
    images: ['/product-cosmetics-1.jpg', '/product-cosmetics-2.jpg'],
    thumbnailUrl: '/product-cosmetics-1.jpg',
    tags: ['organic', 'skincare', 'natural'],
    specifications: {
      'Skin Type': 'All Types',
      'Volume': '100ml each',
      'Ingredients': '100% Natural'
    },
    inventory: 45,
    stock: 45,
    supplierId: 'supplier-5',
    rating: 4.5,
    reviewCount: 167,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mock-6',
    name: 'Modern Coffee Table',
    description: 'Contemporary coffee table with storage',
    price: 249.99,
    currency: 'USD',
    category: 'Home & Living',
    imageUrl: '/product-home-1.jpg',
    images: ['/product-home-1.jpg', '/product-home-2.jpg'],
    thumbnailUrl: '/product-home-1.jpg',
    tags: ['furniture', 'modern', 'storage'],
    specifications: {
      'Material': 'Solid Wood',
      'Dimensions': '120cm x 60cm x 45cm',
      'Weight': '25kg'
    },
    inventory: 12,
    stock: 12,
    supplierId: 'supplier-6',
    rating: 4.6,
    reviewCount: 78,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mock-7',
    name: 'Wireless Gaming Mouse',
    description: 'High-performance gaming mouse with RGB lighting',
    price: 79.99,
    originalPrice: 99.99,
    currency: 'USD',
    category: 'Electronics',
    imageUrl: '/product-tech-1.jpg',
    images: ['/product-tech-1.jpg', '/product-tech-2.jpg'],
    thumbnailUrl: '/product-tech-1.jpg',
    tags: ['gaming', 'wireless', 'rgb'],
    specifications: {
      'DPI': '25,600',
      'Battery Life': '70 hours',
      'Connectivity': '2.4GHz Wireless'
    },
    inventory: 28,
    stock: 28,
    supplierId: 'supplier-7',
    rating: 4.7,
    reviewCount: 203,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mock-8',
    name: 'Yoga Mat Premium',
    description: 'Non-slip yoga mat with alignment lines',
    price: 49.99,
    currency: 'USD',
    category: 'Sports',
    imageUrl: '/product-sports-1.jpg',
    images: ['/product-sports-1.jpg', '/product-sports-2.jpg'],
    thumbnailUrl: '/product-sports-1.jpg',
    tags: ['yoga', 'fitness', 'non-slip'],
    specifications: {
      'Material': 'TPE',
      'Thickness': '6mm',
      'Size': '183cm x 61cm'
    },
    inventory: 67,
    stock: 67,
    supplierId: 'supplier-8',
    rating: 4.4,
    reviewCount: 134,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // ADDITIONAL PRODUCTS FOR BETTER DISPLAY
  {
    id: 'mock-9',
    name: 'Bluetooth Speaker Portable',
    description: 'Waterproof portable speaker with 360° sound',
    price: 129.99,
    originalPrice: 159.99,
    currency: 'USD',
    category: 'Electronics',
    imageUrl: '/product-tech-1.jpg',
    images: ['/product-tech-1.jpg', '/product-tech-2.jpg'],
    thumbnailUrl: '/product-tech-1.jpg',
    tags: ['bluetooth', 'portable', 'waterproof'],
    specifications: {
      'Battery Life': '20 hours',
      'Water Resistance': 'IPX7',
      'Connectivity': 'Bluetooth 5.0'
    },
    inventory: 34,
    stock: 34,
    supplierId: 'supplier-9',
    rating: 4.6,
    reviewCount: 187,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mock-10',
    name: 'Denim Jacket Classic',
    description: 'Timeless denim jacket with modern fit',
    price: 89.99,
    currency: 'USD',
    category: 'Fashion',
    imageUrl: '/product-watch-1.jpg',
    images: ['/product-watch-1.jpg', '/product-watch-2.jpg'],
    thumbnailUrl: '/product-watch-1.jpg',
    tags: ['denim', 'jacket', 'casual'],
    specifications: {
      'Material': '100% Cotton Denim',
      'Fit': 'Regular',
      'Care': 'Machine Washable'
    },
    inventory: 41,
    stock: 41,
    supplierId: 'supplier-10',
    rating: 4.5,
    reviewCount: 98,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mock-11',
    name: 'Kitchen Knife Set Professional',
    description: 'Professional-grade knife set with wooden block',
    price: 199.99,
    originalPrice: 299.99,
    currency: 'USD',
    category: 'Home & Living',
    imageUrl: '/product-home-1.jpg',
    images: ['/product-home-1.jpg', '/product-home-2.jpg'],
    thumbnailUrl: '/product-home-1.jpg',
    tags: ['kitchen', 'knives', 'professional'],
    specifications: {
      'Material': 'Stainless Steel',
      'Set Includes': '8 knives + block',
      'Warranty': 'Lifetime'
    },
    inventory: 23,
    stock: 23,
    supplierId: 'supplier-11',
    rating: 4.8,
    reviewCount: 156,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mock-12',
    name: 'Vitamin C Serum',
    description: 'Brightening vitamin C serum for radiant skin',
    price: 34.99,
    currency: 'USD',
    category: 'Beauty',
    imageUrl: '/product-cosmetics-1.jpg',
    images: ['/product-cosmetics-1.jpg', '/product-cosmetics-2.jpg'],
    thumbnailUrl: '/product-cosmetics-1.jpg',
    tags: ['vitamin-c', 'brightening', 'serum'],
    specifications: {
      'Concentration': '20% Vitamin C',
      'Volume': '30ml',
      'Skin Type': 'All Types'
    },
    inventory: 89,
    stock: 89,
    supplierId: 'supplier-12',
    rating: 4.7,
    reviewCount: 234,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mock-13',
    name: 'Basketball Official Size',
    description: 'Official size basketball for indoor/outdoor use',
    price: 39.99,
    currency: 'USD',
    category: 'Sports',
    imageUrl: '/product-shoes-1.jpg',
    images: ['/product-shoes-1.jpg', '/product-shoes-2.jpg'],
    thumbnailUrl: '/product-shoes-1.jpg',
    tags: ['basketball', 'sports', 'official'],
    specifications: {
      'Size': 'Official (29.5")',
      'Material': 'Composite Leather',
      'Indoor/Outdoor': 'Both'
    },
    inventory: 56,
    stock: 56,
    supplierId: 'supplier-13',
    rating: 4.4,
    reviewCount: 112,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mock-14',
    name: 'Laptop Stand Adjustable',
    description: 'Ergonomic laptop stand with height adjustment',
    price: 59.99,
    originalPrice: 79.99,
    currency: 'USD',
    category: 'Electronics',
    imageUrl: '/product-headphones-1.jpg',
    images: ['/product-headphones-1.jpg', '/product-headphones-2.jpg'],
    thumbnailUrl: '/product-headphones-1.jpg',
    tags: ['laptop', 'stand', 'ergonomic'],
    specifications: {
      'Material': 'Aluminum',
      'Adjustable Height': 'Yes',
      'Max Weight': '4kg'
    },
    inventory: 38,
    stock: 38,
    supplierId: 'supplier-14',
    rating: 4.6,
    reviewCount: 145,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mock-15',
    name: 'Sunglasses Aviator',
    description: 'Classic aviator sunglasses with UV protection',
    price: 149.99,
    currency: 'USD',
    category: 'Fashion',
    imageUrl: '/product-bag-1.jpg',
    images: ['/product-bag-1.jpg', '/product-bag-2.jpg'],
    thumbnailUrl: '/product-bag-1.jpg',
    tags: ['sunglasses', 'aviator', 'uv-protection'],
    specifications: {
      'Lens Material': 'Polarized Glass',
      'UV Protection': '100%',
      'Frame': 'Metal'
    },
    inventory: 27,
    stock: 27,
    supplierId: 'supplier-15',
    rating: 4.8,
    reviewCount: 89,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mock-16',
    name: 'Throw Pillow Set',
    description: 'Decorative throw pillows for home decor',
    price: 29.99,
    currency: 'USD',
    category: 'Home & Living',
    imageUrl: '/product-sports-1.jpg',
    images: ['/product-sports-1.jpg', '/product-sports-2.jpg'],
    thumbnailUrl: '/product-sports-1.jpg',
    tags: ['pillows', 'decor', 'home'],
    specifications: {
      'Size': '18" x 18"',
      'Material': 'Polyester',
      'Set Includes': '4 pillows'
    },
    inventory: 73,
    stock: 73,
    supplierId: 'supplier-16',
    rating: 4.3,
    reviewCount: 67,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mock-17',
    name: 'Hair Dryer Professional',
    description: 'Professional hair dryer with ionic technology',
    price: 89.99,
    originalPrice: 129.99,
    currency: 'USD',
    category: 'Beauty',
    imageUrl: '/product-cosmetics-1.jpg',
    images: ['/product-cosmetics-1.jpg', '/product-cosmetics-2.jpg'],
    thumbnailUrl: '/product-cosmetics-1.jpg',
    tags: ['hair-dryer', 'professional', 'ionic'],
    specifications: {
      'Power': '2000W',
      'Ionic Technology': 'Yes',
      'Attachments': '3 included'
    },
    inventory: 31,
    stock: 31,
    supplierId: 'supplier-17',
    rating: 4.7,
    reviewCount: 178,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mock-18',
    name: 'Tennis Racket Pro',
    description: 'Professional tennis racket with premium strings',
    price: 179.99,
    currency: 'USD',
    category: 'Sports',
    imageUrl: '/product-shoes-1.jpg',
    images: ['/product-shoes-1.jpg', '/product-shoes-2.jpg'],
    thumbnailUrl: '/product-shoes-1.jpg',
    tags: ['tennis', 'racket', 'professional'],
    specifications: {
      'Head Size': '100 sq inches',
      'Weight': '300g',
      'String Pattern': '16x19'
    },
    inventory: 19,
    stock: 19,
    supplierId: 'supplier-18',
    rating: 4.9,
    reviewCount: 92,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mock-19',
    name: 'Wireless Earbuds',
    description: 'True wireless earbuds with active noise cancellation',
    price: 159.99,
    originalPrice: 199.99,
    currency: 'USD',
    category: 'Electronics',
    imageUrl: '/product-headphones-1.jpg',
    images: ['/product-headphones-1.jpg', '/product-headphones-2.jpg'],
    thumbnailUrl: '/product-headphones-1.jpg',
    tags: ['earbuds', 'wireless', 'noise-cancelling'],
    specifications: {
      'Battery Life': '24 hours total',
      'Noise Cancellation': 'Active',
      'Water Resistance': 'IPX4'
    },
    inventory: 42,
    stock: 42,
    supplierId: 'supplier-19',
    rating: 4.6,
    reviewCount: 203,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mock-20',
    name: 'Leather Wallet Minimalist',
    description: 'Minimalist leather wallet with RFID protection',
    price: 49.99,
    currency: 'USD',
    category: 'Fashion',
    imageUrl: '/product-bag-1.jpg',
    images: ['/product-bag-1.jpg', '/product-bag-2.jpg'],
    thumbnailUrl: '/product-bag-1.jpg',
    tags: ['wallet', 'leather', 'minimalist'],
    specifications: {
      'Material': 'Genuine Leather',
      'RFID Protection': 'Yes',
      'Card Slots': '6'
    },
    inventory: 58,
    stock: 58,
    supplierId: 'supplier-20',
    rating: 4.5,
    reviewCount: 134,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

export class ProductService {
  private readonly COLLECTION_NAME = 'products'
  
  // Normalize arbitrary category strings and slugs to a comparable slug
  private normalizeCategorySlug(value: string | null | undefined): string {
    if (!value) return ''
    return String(value)
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  // Get all products with pagination (supports large page size)
  async getAllProducts(page: number = 1, pageSize: number = 20): Promise<{
    products: Product[]
    total: number
    hasMore: boolean
  }> {
    // If Firebase is not available, use mock data immediately
    if (!firebaseAvailable || !db) {
      console.log('Using mock data for getAllProducts')
      const allProducts = MOCK_PRODUCTS.filter(p => p.isActive)
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedProducts = pageSize >= allProducts.length ? allProducts : allProducts.slice(startIndex, endIndex)
      
      return {
        products: paginatedProducts,
        total: allProducts.length,
        hasMore: pageSize < allProducts.length && endIndex < allProducts.length
      }
    }

    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('isActive', '==', true),
        limit(pageSize)
      )

      const snapshot = await getDocs(q)
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[]

      // Get total count
      const countQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('isActive', '==', true)
      )
      const countSnapshot = await getDocs(countQuery)
      const total = countSnapshot.size

      return {
        products,
        total,
        hasMore: products.length === pageSize
      }
    } catch (error) {
      console.error('Error getting all products, using mock data:', error)
      // Return paginated mock data when Firebase fails
      const allProducts = MOCK_PRODUCTS.filter(p => p.isActive)
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedProducts = pageSize >= allProducts.length ? allProducts : allProducts.slice(startIndex, endIndex)
      
      return {
        products: paginatedProducts,
        total: allProducts.length,
        hasMore: pageSize < allProducts.length && endIndex < allProducts.length
      }
    }
  }

  // Get a single product by ID
  async getProduct(id: string): Promise<Product | null> {
    // Always use mock data since Firebase is disabled
    console.log('Using mock data for getProduct:', id)
    const mockProduct = MOCK_PRODUCTS.find(p => p.id === id)
    if (mockProduct) {
      return mockProduct
    }
    
    // If not found in mock data, return first mock product as fallback
    return MOCK_PRODUCTS[0] || null
  }

  // Get products by category
  async getProductsByCategory(category: string, page: number = 1, pageSize: number = 20): Promise<{
    products: Product[]
    total: number
    hasMore: boolean
  }> {
    // If Firebase is not available, use mock data immediately
    if (!firebaseAvailable || !db) {
      console.log('Using mock data for category:', category)
      const inputSlug = this.normalizeCategorySlug(category)
      const filteredProducts = MOCK_PRODUCTS.filter(p => {
        const productCategorySlug = this.normalizeCategorySlug(p.category as any)
        // Match either exact slug or loose contains for broader categories
        return productCategorySlug === inputSlug || productCategorySlug.includes(inputSlug)
      })
      
      console.log('Category products found:', filteredProducts.length)
      
      return {
        products: filteredProducts,
        total: filteredProducts.length,
        hasMore: false
      }
    }

    // Try Firebase if available
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('category', '==', category),
        where('isActive', '==', true),
        limit(pageSize)
      )

      const snapshot = await getDocs(q)
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[]

      return {
        products,
        total: products.length,
        hasMore: products.length === pageSize
      }
    } catch (error) {
      console.error('Error getting products by category, using mock data:', error)
      // Return filtered mock data when Firebase fails
      const inputSlug = this.normalizeCategorySlug(category)
      const filteredProducts = MOCK_PRODUCTS.filter(p => {
        const productCategorySlug = this.normalizeCategorySlug(p.category as any)
        return productCategorySlug === inputSlug || productCategorySlug.includes(inputSlug)
      })
      return {
        products: filteredProducts,
        total: filteredProducts.length,
        hasMore: false
      }
    }
  }

  // Get products by subcategory
  async getProductsBySubcategory(subcategory: string, page: number = 1, pageSize: number = 20): Promise<{
    products: Product[]
    total: number
    hasMore: boolean
  }> {
    // If Firebase is not available, use mock data immediately
    if (!firebaseAvailable || !db) {
      console.log('Using mock data for subcategory:', subcategory)
      // Since Product interface doesn't have subcategory, approximate by category match using slug normalization
      const inputSlug = this.normalizeCategorySlug(subcategory)
      const filteredProducts = MOCK_PRODUCTS.filter(p => {
        const productCategorySlug = this.normalizeCategorySlug(p.category as any)
        return productCategorySlug === inputSlug || productCategorySlug.includes(inputSlug)
      })
      return {
        products: filteredProducts,
        total: filteredProducts.length,
        hasMore: false
      }
    }

    // Try Firebase if available
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('subcategory', '==', subcategory),
        where('isActive', '==', true),
        limit(pageSize)
      )

      const snapshot = await getDocs(q)
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[]

      return {
        products,
        total: products.length,
        hasMore: products.length === pageSize
      }
    } catch (error) {
      console.error('Error getting products by subcategory, using mock data:', error)
      // Return filtered mock data when Firebase fails
      const inputSlug = this.normalizeCategorySlug(subcategory)
      const filteredProducts = MOCK_PRODUCTS.filter(p => {
        const productCategorySlug = this.normalizeCategorySlug(p.category as any)
        return productCategorySlug === inputSlug || productCategorySlug.includes(inputSlug)
      })
      return {
        products: filteredProducts,
        total: filteredProducts.length,
        hasMore: false
      }
    }
  }

  // Get featured products
  async getFeaturedProducts(limitCount: number = 10): Promise<Product[]> {
    // Temporarily use mock data to fix loading issues
    console.log('Using mock data for featured products')
    // Since Product interface doesn't have isFeatured, return first few products
    return MOCK_PRODUCTS.slice(0, limitCount)
    
    // Original Firebase code commented out temporarily
    /*
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('isFeatured', '==', true),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[]
    } catch (error) {
      console.error('Error getting featured products, using mock data:', error)
      // Return featured mock products when Firebase fails
      return MOCK_PRODUCTS.filter(p => p.isFeatured).slice(0, limitCount)
    }
    */
  }

  // Search products
  async searchProducts(searchQuery: string, filters?: {
    category?: string
    priceRange?: { min: number; max: number }
    rating?: number
  }): Promise<Product[]> {
    // Temporarily use mock data to fix loading issues
    console.log('Using mock data for search:', searchQuery)
    let filteredProducts = MOCK_PRODUCTS.filter(p => p.isActive)
    
    // Apply search query
    if (searchQuery) {
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Apply category filter
    if (filters?.category) {
      filteredProducts = filteredProducts.filter(p => p.category === filters.category)
    }
    
    // Apply price range filter
    if (filters?.priceRange) {
      filteredProducts = filteredProducts.filter(p => 
        p.price >= filters.priceRange!.min && p.price <= filters.priceRange!.max
      )
    }
    
    // Apply rating filter
    if (filters?.rating) {
      filteredProducts = filteredProducts.filter(p => p.rating >= filters.rating!)
    }
    
    return filteredProducts
    
    // Original Firebase code commented out temporarily
    /*
    try {
      let q = query(
        collection(db, this.COLLECTION_NAME),
        where('isActive', '==', true)
      )

      // Add category filter if provided
      if (filters?.category) {
        q = query(q, where('category', '==', filters.category))
      }

      // Add price range filter if provided
      if (filters?.priceRange) {
        q = query(
          q,
          where('price', '>=', filters.priceRange.min),
          where('price', '<=', filters.priceRange.max)
        )
      }

      // Add rating filter if provided
      if (filters?.rating) {
        q = query(q, where('rating', '>=', filters.rating))
      }

      const snapshot = await getDocs(q)
      let products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[]

      // Apply search query filter in memory
      if (searchQuery) {
        products = products.filter(p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      return products
    } catch (error) {
      console.error('Error searching products, using mock data:', error)
      // Return filtered mock data when Firebase fails
      let filteredProducts = MOCK_PRODUCTS.filter(p => p.isActive)
      
      if (searchQuery) {
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      
      if (filters?.category) {
        filteredProducts = filteredProducts.filter(p => p.category === filters.category)
      }
      
      if (filters?.priceRange) {
        filteredProducts = filteredProducts.filter(p => 
          p.price >= filters.priceRange.min && p.price <= filters.priceRange.max
        )
      }
      
      if (filters?.rating) {
        filteredProducts = filteredProducts.filter(p => p.rating >= filters.rating)
      }
      
      return filteredProducts
    }
    */
  }

  // Create new product (for suppliers)
  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    try {
      const newProduct = {
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // const docRef = await addDoc(collection(db, this.COLLECTION_NAME), newProduct)
      
      // return {
      //   id: docRef.id,
      //   ...newProduct
      // } as Product
      console.log('Mock create product:', newProduct)
      return newProduct as Product
    } catch (error) {
      console.error('Error creating product:', error)
      throw new Error('Failed to create product')
    }
  }

  // Update product
  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    try {
      // const docRef = doc(db, this.COLLECTION_NAME, id)
      // await updateDoc(docRef, {
      //   ...updates,
      //   updatedAt: new Date()
      // })

      // // Get updated product
      // const updatedDoc = await getDoc(docRef)
      // if (!updatedDoc.exists()) {
      //   return null
      // }

      // return {
      //   id: updatedDoc.id,
      //   ...updatedDoc.data()
      // } as Product
      console.log('Mock update product:', id, updates)
      const mockProduct = MOCK_PRODUCTS.find(p => p.id === id)
      if (!mockProduct) {
        return null
      }
      const updatedMockProduct = {
        ...mockProduct,
        ...updates,
        updatedAt: new Date()
      }
      const index = MOCK_PRODUCTS.findIndex(p => p.id === id)
      if (index !== -1) {
        MOCK_PRODUCTS[index] = updatedMockProduct
      }
      return updatedMockProduct
    } catch (error) {
      console.error('Error updating product:', error)
      throw new Error('Failed to update product')
    }
  }

  // Delete product
  async deleteProduct(id: string): Promise<boolean> {
    try {
      // const docRef = doc(db, this.COLLECTION_NAME, id)
      // await deleteDoc(docRef)
      console.log('Mock delete product:', id)
      const initialLength = MOCK_PRODUCTS.length
      MOCK_PRODUCTS = MOCK_PRODUCTS.filter(p => p.id !== id)
      return MOCK_PRODUCTS.length < initialLength
    } catch (error) {
      console.error('Error deleting product:', error)
      throw new Error('Failed to delete product')
    }
  }

  // Get product categories
  async getCategories(): Promise<any[]> { // Assuming Category type is not defined, using 'any' for now
    try {
      // const q = query(
      //   collection(db, 'categories'),
      //   where('isActive', '==', true),
      //   orderBy('order', 'asc')
      // )

      // const snapshot = await getDocs(q)
      // return snapshot.docs.map(doc => ({
      //   id: doc.id,
      //   ...doc.data()
      // })) as Category[]
      console.log('Mock get categories')
      return [
        { id: 'cat-1', name: 'Electronics', isActive: true, order: 1 },
        { id: 'cat-2', name: 'Fashion', isActive: true, order: 2 },
        { id: 'cat-3', name: 'Sports', isActive: true, order: 3 },
        { id: 'cat-4', name: 'Home & Garden', isActive: true, order: 4 },
        { id: 'cat-5', name: 'Toys & Games', isActive: true, order: 5 },
        { id: 'cat-6', name: 'Books & Media', isActive: true, order: 6 },
        { id: 'cat-7', name: 'Health & Beauty', isActive: true, order: 7 },
        { id: 'cat-8', name: 'Automotive', isActive: true, order: 8 },
        { id: 'cat-9', name: 'Pets', isActive: true, order: 9 },
        { id: 'cat-10', name: 'Food & Beverages', isActive: true, order: 10 },
      ]
    } catch (error) {
      console.error('Error getting categories:', error)
      throw new Error('Failed to fetch categories')
    }
  }

  // Get category by ID
  async getCategory(id: string): Promise<any> { // Assuming Category type is not defined, using 'any' for now
    try {
      // const docRef = doc(db, 'categories', id)
      // const docSnap = await getDoc(docRef)

      // if (!docSnap.exists()) {
      //   return null
      // }

      // return {
      //   id: docSnap.id,
      //   ...docSnap.data()
      // } as Category
      console.log('Mock get category by ID:', id)
      return { id, name: 'Mock Category', isActive: true, order: 1 }
    } catch (error) {
      console.error('Error getting category:', error)
      throw new Error('Failed to fetch category')
    }
  }
}

export const productService = new ProductService() 
