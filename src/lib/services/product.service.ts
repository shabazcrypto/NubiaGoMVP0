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
          products: [],
          total: 0,
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
      console.error('Error getting products:', error)
      // During build time or when Firestore is unavailable, return empty array
      if (process.env.NODE_ENV === 'production' || process.env.NEXT_PHASE === 'phase-production-build') {
        return {
          products: [],
          total: 0,
          hasMore: false
        }
      }
      throw new Error('Failed to fetch products')
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
      console.error('Error getting product:', error)
      // During build time or when Firestore is unavailable, return null
      if (process.env.NODE_ENV === 'production' || process.env.NEXT_PHASE === 'phase-production-build') {
        return null
      }
      throw new Error('Failed to fetch product')
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
      console.error('Error getting products by category:', error)
      throw new Error('Failed to fetch products by category')
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
      console.error('Error getting products by subcategory:', error)
      throw new Error('Failed to fetch products by subcategory')
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
      console.error('Error getting featured products:', error)
      throw new Error('Failed to fetch featured products')
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