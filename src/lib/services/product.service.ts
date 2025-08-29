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
  limit 
} from 'firebase/firestore'
import { Product } from '@/types'
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/lib/mock/products'

// Safe Firebase import with fallback
let db: any = null
let firebaseAvailable = false

try {
  if (typeof window !== 'undefined') {
    import('@/lib/firebase/config').then((firebaseConfig) => {
      db = firebaseConfig.db
      firebaseAvailable = !!db
    }).catch(() => {
      firebaseAvailable = false
    })
  }
} catch {
  firebaseAvailable = false
}

export class ProductService {
  private readonly COLLECTION_NAME = 'products'
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  private cache: Map<string, { data: any; timestamp: number }> = new Map()

  private getCacheKey(method: string, params: any = {}): string {
    return `${method}:${JSON.stringify(params)}`
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key)
      return null
    }
    return cached.data as T
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  private normalizeCategorySlug(value: string | null | undefined): string {
    if (!value) return ''
    return String(value)
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  async getAllProducts(page: number = 1, pageSize: number = 20): Promise<{
    products: Product[]
    total: number
    hasMore: boolean
  }> {
    const cacheKey = this.getCacheKey('getAllProducts', { page, pageSize })
    const cached = this.getFromCache<{ products: Product[]; total: number; hasMore: boolean }>(cacheKey)
    if (cached) return cached

    if (!firebaseAvailable || !db) {
      const allProducts = MOCK_PRODUCTS.filter(p => p.isActive)
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedProducts = pageSize >= allProducts.length ? allProducts : allProducts.slice(startIndex, endIndex)
      
      const result = {
        products: paginatedProducts,
        total: allProducts.length,
        hasMore: pageSize < allProducts.length && endIndex < allProducts.length
      }
      
      this.setCache(cacheKey, result)
      return result
    }

    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('isActive', '==', true),
        limit(pageSize)
      )

      const [snapshot, countSnapshot] = await Promise.all([
        getDocs(q),
        getDocs(query(collection(db, this.COLLECTION_NAME), where('isActive', '==', true)))
      ])

      const result = {
        products: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[],
        total: countSnapshot.size,
        hasMore: snapshot.docs.length === pageSize
      }

      this.setCache(cacheKey, result)
      return result
    } catch {
      return this.getAllProducts(page, pageSize)
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    const cacheKey = this.getCacheKey('getProduct', { id })
    const cached = this.getFromCache<Product>(cacheKey)
    if (cached) return cached

    const mockProduct = MOCK_PRODUCTS.find(p => p.id === id)
    if (mockProduct) {
      this.setCache(cacheKey, mockProduct)
      return mockProduct
    }

    return MOCK_PRODUCTS[0] || null
  }

  async getProductsByCategory(category: string, page: number = 1, pageSize: number = 20): Promise<{
    products: Product[]
    total: number
    hasMore: boolean
  }> {
    const cacheKey = this.getCacheKey('getProductsByCategory', { category, page, pageSize })
    const cached = this.getFromCache<{ products: Product[]; total: number; hasMore: boolean }>(cacheKey)
    if (cached) return cached

    const inputSlug = this.normalizeCategorySlug(category)
    const filteredProducts = MOCK_PRODUCTS.filter(p => {
      const productCategorySlug = this.normalizeCategorySlug(p.category as any)
      return productCategorySlug === inputSlug || productCategorySlug.includes(inputSlug)
    })

    const result = {
      products: filteredProducts,
      total: filteredProducts.length,
      hasMore: false
    }

    this.setCache(cacheKey, result)
    return result
  }

  async getProductsBySubcategory(subcategory: string, page: number = 1, pageSize: number = 20): Promise<{
    products: Product[]
    total: number
    hasMore: boolean
  }> {
    const cacheKey = this.getCacheKey('getProductsBySubcategory', { subcategory, page, pageSize })
    const cached = this.getFromCache<{ products: Product[]; total: number; hasMore: boolean }>(cacheKey)
    if (cached) return cached

    // For mock data, treat subcategory similar to category
    const inputSlug = this.normalizeCategorySlug(subcategory)
    const filteredProducts = MOCK_PRODUCTS.filter(p => {
      const productCategorySlug = this.normalizeCategorySlug(p.category as any)
      const productTags = p.tags?.map(tag => this.normalizeCategorySlug(tag)) || []
      return productCategorySlug === inputSlug || 
             productCategorySlug.includes(inputSlug) ||
             productTags.some(tag => tag === inputSlug || tag.includes(inputSlug))
    })

    const result = {
      products: filteredProducts,
      total: filteredProducts.length,
      hasMore: false
    }

    this.setCache(cacheKey, result)
    return result
  }

  async getFeaturedProducts(limitCount: number = 10): Promise<Product[]> {
    const cacheKey = this.getCacheKey('getFeaturedProducts', { limitCount })
    const cached = this.getFromCache<Product[]>(cacheKey)
    if (cached) return cached

    const result = MOCK_PRODUCTS.slice(0, limitCount)
    this.setCache(cacheKey, result)
    return result
  }

  async searchProducts(searchQuery: string, filters?: {
    category?: string
    priceRange?: { min: number; max: number }
    rating?: number
  }): Promise<Product[]> {
    const cacheKey = this.getCacheKey('searchProducts', { searchQuery, filters })
    const cached = this.getFromCache<Product[]>(cacheKey)
    if (cached) return cached

    let filteredProducts = MOCK_PRODUCTS.filter(p => p.isActive)
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      )
    }
    
    if (filters?.category) {
      filteredProducts = filteredProducts.filter(p => p.category === filters.category)
    }
    
    if (filters?.priceRange) {
      filteredProducts = filteredProducts.filter(p => 
        p.price >= filters.priceRange!.min && p.price <= filters.priceRange!.max
      )
    }
    
    if (filters?.rating) {
      filteredProducts = filteredProducts.filter(p => p.rating >= filters.rating!)
    }
    
    this.setCache(cacheKey, filteredProducts)
    return filteredProducts
  }

  async getCategories(): Promise<any[]> {
    const cacheKey = this.getCacheKey('getCategories')
    const cached = this.getFromCache<any[]>(cacheKey)
    if (cached) return cached

    this.setCache(cacheKey, MOCK_CATEGORIES)
    return MOCK_CATEGORIES
  }

  async getCategory(id: string): Promise<any> {
    const cacheKey = this.getCacheKey('getCategory', { id })
    const cached = this.getFromCache<any>(cacheKey)
    if (cached) return cached

    const category = MOCK_CATEGORIES.find(c => c.id === id) || { 
      id, 
      name: 'Mock Category', 
      isActive: true, 
      order: 1 
    }

    this.setCache(cacheKey, category)
    return category
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const productService = new ProductService()
