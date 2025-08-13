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
import { db } from '@/lib/firebase/config'
import { Product, Category } from '@/types'

// Mock data fallback for when Firebase fails
const MOCK_PRODUCTS: Product[] = [
  {
    id: 'mock-1',
    name: 'Premium Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 299.99,
    category: 'Electronics',
    subcategory: 'Audio',
    brand: 'AudioTech',
    imageUrl: '/product-headphones-1.jpg',
    images: ['/product-headphones-1.jpg'],
    thumbnailUrl: '/product-headphones-1.jpg',
    sku: 'AUDIO-001',
    rating: 4.8,
    reviewCount: 156,
    stock: 25,
    isActive: true,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['wireless', 'noise-cancelling', 'premium'],
    specifications: {
      'Connectivity': 'Bluetooth 5.0',
      'Battery Life': '30 hours',
      'Weight': '250g'
    }
  },
  {
    id: 'mock-2',
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracking with heart rate monitoring',
    price: 199.99,
    category: 'Electronics',
    subcategory: 'Wearables',
    brand: 'FitTech',
    imageUrl: '/product-accessories-1.jpg',
    images: ['/product-accessories-1.jpg'],
    thumbnailUrl: '/product-accessories-1.jpg',
    sku: 'WEAR-001',
    rating: 4.6,
    reviewCount: 89,
    stock: 18,
    isActive: true,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['fitness', 'smartwatch', 'health'],
    specifications: {
      'Display': '1.4" AMOLED',
      'Battery Life': '7 days',
      'Water Resistance': '5ATM'
    }
  },
  {
    id: 'mock-3',
    name: 'Premium Running Sneakers',
    description: 'Professional running shoes with advanced cushioning',
    price: 149.99,
    category: 'Sports',
    subcategory: 'Footwear',
    brand: 'RunFast',
    imageUrl: '/product-fashion-1.jpg',
    images: ['/product-fashion-1.jpg'],
    thumbnailUrl: '/product-fashion-1.jpg',
    sku: 'SHOE-001',
    rating: 4.7,
    reviewCount: 234,
    stock: 32,
    isActive: true,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['running', 'athletic', 'comfortable'],
    specifications: {
      'Weight': '280g',
      'Drop': '8mm',
      'Terrain': 'Road'
    }
  }
]

export class ProductService {
  private readonly COLLECTION_NAME = 'products'

  // Get all products with pagination
  async getAllProducts(page: number = 1, pageSize: number = 20): Promise<{
    products: Product[]
    total: number
    hasMore: boolean
  }> {
    try {
      // Check if we're in build time or if Firestore is not available
      if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
        console.log('Build time detected, returning mock products')
        return {
          products: MOCK_PRODUCTS,
          total: MOCK_PRODUCTS.length,
          hasMore: false
        }
      }

      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
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
      console.error('Error getting all products, using mock data:', error)
      // Return mock data when Firebase fails
      return {
        products: MOCK_PRODUCTS,
        total: MOCK_PRODUCTS.length,
        hasMore: false
      }
    }
  }

  // Get product by ID
  async getProduct(id: string): Promise<Product | null> {
    try {
      // Check if we're in build time or if Firestore is not available
      if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
        console.log('Build time detected, returning null for product:', id)
        return null
      }

      const docRef = doc(db, this.COLLECTION_NAME, id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return null
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Product
    } catch (error) {
      console.error('Error getting product, checking mock data:', error)
      // Try to find in mock data when Firebase fails
      const mockProduct = MOCK_PRODUCTS.find(p => p.id === id)
      return mockProduct || null
    }
  }

  // Get products by category
  async getProductsByCategory(category: string, page: number = 1, pageSize: number = 20): Promise<{
    products: Product[]
    total: number
    hasMore: boolean
  }> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('category', '==', category),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
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
      const filteredProducts = MOCK_PRODUCTS.filter(p => p.category === category)
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
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('subcategory', '==', subcategory),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
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
      const filteredProducts = MOCK_PRODUCTS.filter(p => p.subcategory === subcategory)
      return {
        products: filteredProducts,
        total: filteredProducts.length,
        hasMore: false
      }
    }
  }

  // Get featured products
  async getFeaturedProducts(limitCount: number = 10): Promise<Product[]> {
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
  }

  // Search products
  async searchProducts(searchQuery: string, filters?: {
    category?: string
    priceRange?: { min: number; max: number }
    rating?: number
  }): Promise<Product[]> {
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

      const snapshot = await getDocs(q)
      let products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[]

      // Filter by search query (client-side for better performance)
      if (searchQuery) {
        const lowercaseQuery = searchQuery.toLowerCase()
        products = products.filter(product => 
          product.name.toLowerCase().includes(lowercaseQuery) ||
          product.description.toLowerCase().includes(lowercaseQuery) ||
          product.category.toLowerCase().includes(lowercaseQuery) ||
          product.brand?.toLowerCase().includes(lowercaseQuery)
        )
      }

      // Filter by rating if provided
      if (filters?.rating) {
        products = products.filter(product => product.rating >= filters.rating!)
      }

      return products
    } catch (error) {
      console.error('Error searching products:', error)
      throw new Error('Failed to search products')
    }
  }

  // Create new product (for suppliers)
  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    try {
      const newProduct = {
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), newProduct)
      
      return {
        id: docRef.id,
        ...newProduct
      } as Product
    } catch (error) {
      console.error('Error creating product:', error)
      throw new Error('Failed to create product')
    }
  }

  // Update product
  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      })

      // Get updated product
      const updatedDoc = await getDoc(docRef)
      if (!updatedDoc.exists()) {
        return null
      }

      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      } as Product
    } catch (error) {
      console.error('Error updating product:', error)
      throw new Error('Failed to update product')
    }
  }

  // Delete product
  async deleteProduct(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id)
      await deleteDoc(docRef)
      return true
    } catch (error) {
      console.error('Error deleting product:', error)
      throw new Error('Failed to delete product')
    }
  }

  // Get product categories
  async getCategories(): Promise<Category[]> {
    try {
      const q = query(
        collection(db, 'categories'),
        where('isActive', '==', true),
        orderBy('order', 'asc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[]
    } catch (error) {
      console.error('Error getting categories:', error)
      throw new Error('Failed to fetch categories')
    }
  }

  // Get category by ID
  async getCategory(id: string): Promise<Category | null> {
    try {
      const docRef = doc(db, 'categories', id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return null
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Category
    } catch (error) {
      console.error('Error getting category:', error)
      throw new Error('Failed to fetch category')
    }
  }
}

export const productService = new ProductService() 
