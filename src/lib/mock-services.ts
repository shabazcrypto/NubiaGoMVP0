import { 
  mockUsers, 
  mockProducts, 
  mockCategories, 
  mockOrders, 
  mockReviews, 
  mockCart, 
  mockWishlist,
  getMockUser,
  getMockProduct,
  getMockCategory,
  getMockProductsByCategory,
  getMockProductsBySubcategory,
  getMockFeaturedProducts,
  getMockUserOrders,
  getMockProductReviews
} from './mock-data'
import { User, Product, Category, Order, Review, Cart, Wishlist } from '@/types'

// ============================================================================
// MOCK AUTH SERVICE
// ============================================================================

export class MockAuthService {
  private currentUser: User | null = null

  async signIn(email: string, password: string): Promise<User> {
    // Simple mock authentication
    const user = mockUsers.find(u => u.email === email)
    if (user && password === 'password') { // Mock password
      this.currentUser = user
      return user
    }
    throw new Error('Invalid credentials')
  }

  setCurrentUser(user: User | null): void {
    this.currentUser = user
  }

  async signUp(email: string, password: string, displayName?: string): Promise<User> {
    // Mock user creation
    const newUser: User = {
      uid: `user-${Date.now()}`,
      email,
      displayName: displayName || email.split('@')[0],
      role: 'customer',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.currentUser = newUser
    return newUser
  }

  async signOut(): Promise<void> {
    this.currentUser = null
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null
  }
}

// ============================================================================
// MOCK PRODUCT SERVICE
// ============================================================================

export class MockProductService {
  async getAllProducts(page: number = 1, limit: number = 12): Promise<Product[]> {
    const start = (page - 1) * limit
    const end = start + limit
    return mockProducts.slice(start, end)
  }

  async getProduct(id: string): Promise<Product | null> {
    return getMockProduct(id) || null
  }

  async getProductById(id: string): Promise<Product | null> {
    return getMockProduct(id) || null
  }

  async getProductsByCategory(category: string, page: number = 1, limit: number = 12): Promise<Product[]> {
    const categoryProducts = getMockProductsByCategory(category)
    const start = (page - 1) * limit
    const end = start + limit
    return categoryProducts.slice(start, end)
  }

  async getProductsBySubcategory(subcategory: string, page: number = 1, limit: number = 12): Promise<Product[]> {
    const subcategoryProducts = getMockProductsBySubcategory(subcategory)
    const start = (page - 1) * limit
    const end = start + limit
    return subcategoryProducts.slice(start, end)
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return getMockFeaturedProducts()
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowercaseQuery = query.toLowerCase()
    return mockProducts.filter(product => 
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery)
    )
  }

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const newProduct: Product = {
      id: `product-${Date.now()}`,
      name: productData.name || 'New Product',
      description: productData.description || '',
      price: productData.price || 0,
      originalPrice: productData.originalPrice,
      imageUrl: productData.imageUrl || '/fallback-product.jpg',
      images: productData.images || [],
      thumbnailUrl: productData.thumbnailUrl || '/fallback-product.jpg',
      category: productData.category || 'General',
      subcategory: productData.subcategory,
      brand: productData.brand,
      sku: productData.sku || `SKU-${Date.now()}`,
      stock: productData.stock || 0,
      rating: productData.rating || 0,
      reviewCount: productData.reviewCount || 0,
      tags: productData.tags || [],
      specifications: productData.specifications || {},
      isActive: productData.isActive ?? true,
      isFeatured: productData.isFeatured ?? false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    return newProduct
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const existingProduct = await this.getProductById(id)
    if (!existingProduct) return null

    const updatedProduct: Product = {
      ...existingProduct,
      ...updates,
      updatedAt: new Date()
    }
    return updatedProduct
  }

  async deleteProduct(id: string): Promise<boolean> {
    const product = await this.getProductById(id)
    return product !== null
  }
}

// ============================================================================
// MOCK CATEGORY SERVICE
// ============================================================================

export class MockCategoryService {
  async getAllCategories(): Promise<Category[]> {
    return mockCategories
  }

  async getCategory(id: string): Promise<Category | null> {
    return getMockCategory(id) || null
  }
}

// ============================================================================
// MOCK ORDER SERVICE
// ============================================================================

export class MockOrderService {
  async getUserOrders(userId: string): Promise<Order[]> {
    return getMockUserOrders(userId)
  }

  async getOrder(id: string): Promise<Order | null> {
    return mockOrders.find(order => order.id === id) || null
  }

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      userId: orderData.userId || 'user-1',
      items: orderData.items || [],
      total: orderData.total || 0,
      subtotal: orderData.subtotal || 0,
      tax: orderData.tax || 0,
      shipping: orderData.shipping || 0,
      status: 'pending',
      paymentStatus: 'pending',
      shippingAddress: orderData.shippingAddress!,
      billingAddress: orderData.billingAddress!,
      paymentMethod: orderData.paymentMethod || 'Credit Card',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    return newOrder
  }
}

// ============================================================================
// MOCK REVIEW SERVICE
// ============================================================================

export class MockReviewService {
  async getProductReviews(productId: string): Promise<Review[]> {
    return getMockProductReviews(productId)
  }

  async createReview(reviewData: Partial<Review>): Promise<Review> {
    const newReview: Review = {
      id: `review-${Date.now()}`,
      productId: reviewData.productId!,
      userId: reviewData.userId!,
      rating: reviewData.rating!,
      title: reviewData.title!,
      comment: reviewData.comment!,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    return newReview
  }
}

// ============================================================================
// MOCK CART SERVICE
// ============================================================================

export class MockCartService {
  private cart: Cart = mockCart

  async getCart(userId: string): Promise<Cart> {
    return this.cart
  }

  async addToCart(userId: string, productId: string, quantity: number = 1): Promise<Cart> {
    const product = getMockProduct(productId)
    if (!product) {
      throw new Error('Product not found')
    }

    const existingItem = this.cart.items.find(item => item.productId === productId)
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      this.cart.items.push({
        productId,
        quantity,
        price: product.price,
        product
      })
    }

    this.updateCartTotals()
    return this.cart
  }

  async removeFromCart(userId: string, productId: string): Promise<Cart> {
    this.cart.items = this.cart.items.filter(item => item.productId !== productId)
    this.updateCartTotals()
    return this.cart
  }

  async updateCartItemQuantity(userId: string, productId: string, quantity: number): Promise<Cart> {
    const item = this.cart.items.find(item => item.productId === productId)
    if (item) {
      if (quantity <= 0) {
        this.cart.items = this.cart.items.filter(item => item.productId !== productId)
      } else {
        item.quantity = quantity
      }
    }
    this.updateCartTotals()
    return this.cart
  }

  async clearCart(userId: string): Promise<Cart> {
    this.cart.items = []
    this.updateCartTotals()
    return this.cart
  }

  private updateCartTotals(): void {
    this.cart.total = this.cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    this.cart.itemCount = this.cart.items.reduce((sum, item) => sum + item.quantity, 0)
    this.cart.updatedAt = new Date()
  }
}

// ============================================================================
// MOCK WISHLIST SERVICE
// ============================================================================

export class MockWishlistService {
  private wishlist: Wishlist = mockWishlist

  async getWishlist(userId: string): Promise<Wishlist> {
    return this.wishlist
  }

  async addToWishlist(userId: string, productId: string): Promise<Wishlist> {
    const product = getMockProduct(productId)
    if (!product) {
      throw new Error('Product not found')
    }

    const existingItem = this.wishlist.items.find(item => item.productId === productId)
    if (!existingItem) {
      this.wishlist.items.push({
        productId,
        product,
        addedAt: new Date()
      })
      this.wishlist.updatedAt = new Date()
    }

    return this.wishlist
  }

  async removeFromWishlist(userId: string, productId: string): Promise<Wishlist> {
    this.wishlist.items = this.wishlist.items.filter(item => item.productId !== productId)
    this.wishlist.updatedAt = new Date()
    return this.wishlist
  }

  async clearWishlist(userId: string): Promise<Wishlist> {
    this.wishlist.items = []
    this.wishlist.updatedAt = new Date()
    return this.wishlist
  }
}

// ============================================================================
// SERVICE INSTANCES
// ============================================================================

export const mockAuthService = new MockAuthService()
export const mockProductService = new MockProductService()
export const mockCategoryService = new MockCategoryService()
export const mockOrderService = new MockOrderService()
export const mockReviewService = new MockReviewService()
export const mockCartService = new MockCartService()
export const mockWishlistService = new MockWishlistService() 
