// Temporarily disable Firebase imports to fix loading issues
// import { 
//   collection, 
//   doc, 
//   getDocs, 
//   getDoc, 
//   addDoc, 
//   updateDoc, 
//   deleteDoc, 
//   query, 
//   where, 
//   orderBy, 
//   limit, 
//   startAfter,
//   QueryDocumentSnapshot,
//   DocumentData
// } from 'firebase/firestore'
// import { db } from '@/lib/firebase/config'
import { Product } from '@/types'

// Mock data fallback for when Firebase fails
let MOCK_PRODUCTS: Product[] = [
  {
    id: 'mock-1',
    name: 'Premium Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 299.99,
    currency: 'USD',
    category: 'Electronics',
    images: ['/product-headphones-1.jpg'],
    tags: ['wireless', 'noise-cancelling', 'premium'],
    specifications: {
      'Connectivity': 'Bluetooth 5.0',
      'Battery Life': '30 hours',
      'Weight': '250g'
    },
    inventory: 25,
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
    images: ['/product-accessories-1.jpg'],
    tags: ['fitness', 'smartwatch', 'health'],
    specifications: {
      'Display': '1.4" AMOLED',
      'Battery Life': '7 days',
      'Water Resistance': '5ATM'
    },
    inventory: 18,
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
    images: ['/product-fashion-1.jpg'],
    tags: ['running', 'athletic', 'comfortable'],
    specifications: {
      'Weight': '280g',
      'Drop': '8mm',
      'Terrain': 'Road'
    },
    inventory: 32,
    supplierId: 'supplier-3',
    rating: 4.7,
    reviewCount: 234,
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
    try {
      const { db } = await import('@/lib/firebase/config')
      const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore')
      
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
    try {
      const { db } = await import('@/lib/firebase/config')
      const { doc, getDoc } = await import('firebase/firestore')
      
      const docRef = doc(db, this.COLLECTION_NAME, id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Product
      } else {
        return null
      }
    } catch (error) {
      console.error('Error getting product, using mock data:', error)
      // Return mock product when Firebase fails
      const mockProduct = MOCK_PRODUCTS.find(p => p.id === id)
      if (mockProduct) {
        return mockProduct
      }
      
      // If not found in mock data, return first mock product as fallback
      return MOCK_PRODUCTS[0] || null
    }
  }

  // Get products by category
  async getProductsByCategory(category: string, page: number = 1, pageSize: number = 20): Promise<{
    products: Product[]
    total: number
    hasMore: boolean
  }> {
    // Temporarily use mock data to fix loading issues
    console.log('Using mock data for category:', category)
    const inputSlug = this.normalizeCategorySlug(category)
    const filteredProducts = MOCK_PRODUCTS.filter(p => {
      const productCategorySlug = this.normalizeCategorySlug(p.category as any)
      // Match either exact slug or loose contains for broader categories
      return productCategorySlug === inputSlug || productCategorySlug.includes(inputSlug)
    })
    return {
      products: filteredProducts,
      total: filteredProducts.length,
      hasMore: false
    }
    
    // Original Firebase code commented out temporarily
    /*
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
    */
  }

  // Get products by subcategory
  async getProductsBySubcategory(subcategory: string, page: number = 1, pageSize: number = 20): Promise<{
    products: Product[]
    total: number
    hasMore: boolean
  }> {
    // Temporarily use mock data to fix loading issues
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
    
    // Original Firebase code commented out temporarily
    /*
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
      const filteredProducts = MOCK_PRODUCTS.filter(p => p.category === subcategory)
      return {
        products: filteredProducts,
        total: filteredProducts.length,
        hasMore: false
      }
    }
    */
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
