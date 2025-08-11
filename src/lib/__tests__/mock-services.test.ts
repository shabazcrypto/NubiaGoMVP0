import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockAuthService, mockProductService, mockOrderService } from '@/lib/mock-services'

describe('MockAuthService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  it('should sign in with valid credentials', async () => {
    const result = await mockAuthService.signIn('test@example.com', 'password123')
    expect(result.success).toBe(true)
    expect(result.user).toBeDefined()
    expect(result.user.email).toBe('test@example.com')
  })

  it('should fail sign in with invalid credentials', async () => {
    const result = await mockAuthService.signIn('invalid@example.com', 'wrongpassword')
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('should sign up new user', async () => {
    const result = await mockAuthService.signUp('newuser@example.com', 'password123', 'New User')
    expect(result.success).toBe(true)
    expect(result.user).toBeDefined()
    expect(result.user.email).toBe('newuser@example.com')
  })

  it('should get current user', () => {
    const user = mockAuthService.getCurrentUser()
    expect(user).toBeDefined()
  })

  it('should sign out user', () => {
    mockAuthService.signOut()
    const user = mockAuthService.getCurrentUser()
    expect(user).toBeNull()
  })
})

describe('MockProductService', () => {
  it('should get all products', async () => {
    const products = await mockProductService.getAllProducts()
    expect(Array.isArray(products)).toBe(true)
    expect(products.length).toBeGreaterThan(0)
  })

  it('should get products by category', async () => {
    const products = await mockProductService.getProductsByCategory('Electronics')
    expect(Array.isArray(products)).toBe(true)
    expect(products.every(p => p.category === 'Electronics')).toBe(true)
  })

  it('should get product by id', async () => {
    const product = await mockProductService.getProductById('1')
    expect(product).toBeDefined()
    expect(product.id).toBe('1')
  })

  it('should search products', async () => {
    const products = await mockProductService.searchProducts('headphones')
    expect(Array.isArray(products)).toBe(true)
  })
})

describe('MockOrderService', () => {
  it('should create order', async () => {
    const orderData = {
      userId: 'user-1',
      items: [
        { productId: '1', quantity: 2, price: 100 }
      ],
      total: 200,
      shippingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Main St',
        city: 'Lagos',
        state: 'Lagos',
        postalCode: '100001',
        country: 'Nigeria',
        phone: '+2341234567890'
      }
    }

    const order = await mockOrderService.createOrder(orderData)
    expect(order).toBeDefined()
    expect(order.id).toBeDefined()
    expect(order.status).toBe('pending')
  })

  it('should get user orders', async () => {
    const orders = await mockOrderService.getUserOrders('user-1')
    expect(Array.isArray(orders)).toBe(true)
  })
}) 
