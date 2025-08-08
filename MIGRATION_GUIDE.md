# 🚀 Migration Guide: From Mock Data to Production Firebase

## 📋 Overview

This guide provides step-by-step instructions to migrate your NubiaGo e-commerce platform from mock data to real Firebase integration for production use.

## 🎯 Migration Checklist

### Phase 1: Firebase Setup & Configuration
- [ ] **Firebase Project Configuration**
- [ ] **Firestore Database Setup**
- [ ] **Authentication Configuration**
- [ ] **Storage Configuration**
- [ ] **Security Rules Implementation**

### Phase 2: Data Migration
- [ ] **Product Data Migration**
- [ ] **User Data Migration**
- [ ] **Category Data Migration**
- [ ] **Review Data Migration**

### Phase 3: Service Layer Implementation
- [ ] **Product Services**
- [ ] **User Services**
- [ ] **Order Services**
- [ ] **Cart Services**
- [ ] **Analytics Services**

### Phase 4: Component Updates
- [ ] **Product Components**
- [ ] **User Components**
- [ ] **Cart Components**
- [ ] **Order Components**
- [ ] **Admin Components**

---

## 🔥 Phase 1: Firebase Setup & Configuration

### 1.1 Firebase Project Configuration

#### Update Environment Variables
```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_production_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_production_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_production_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_production_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_production_app_id
```

#### Firebase Configuration Files
```typescript
// src/lib/firebase/config.ts
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
```

### 1.2 Firestore Database Setup

#### Create Collections Structure
```typescript
// Database collections structure
interface DatabaseSchema {
  users: User[]
  products: Product[]
  categories: Category[]
  orders: Order[]
  carts: Cart[]
  reviews: Review[]
  suppliers: Supplier[]
  analytics: Analytics[]
}
```

#### Firestore Security Rules
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Products are publicly readable, suppliers and admins can write
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && (
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'supplier']
      );
    }
    
    // Orders are user-specific
    match /orders/{orderId} {
      allow read, write: if request.auth != null && (
        request.auth.uid == resource.data.userId ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
    }
    
    // Carts are user-specific
    match /carts/{cartId} {
      allow read, write: if request.auth != null && request.auth.uid == cartId;
    }
    
    // Reviews are publicly readable, authenticated users can write
    match /reviews/{reviewId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 📊 Phase 2: Data Migration

### 2.1 Product Data Migration

#### Create Product Service
```typescript
// src/lib/services/product.service.ts
import { db } from '@/lib/firebase/config'
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
  startAfter 
} from 'firebase/firestore'
import { Product } from '@/types'

export class ProductService {
  private collection = collection(db, 'products')

  // Get all products with pagination
  async getAllProducts(page: number = 1, limit: number = 12): Promise<Product[]> {
    const q = query(
      this.collection,
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limit)
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[]
  }

  // Get product by ID
  async getProductById(id: string): Promise<Product | null> {
    const docRef = doc(this.collection, id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product
    }
    return null
  }

  // Get products by category
  async getProductsByCategory(category: string, page: number = 1, limit: number = 12): Promise<Product[]> {
    const q = query(
      this.collection,
      where('category', '==', category),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limit)
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[]
  }

  // Search products
  async searchProducts(searchTerm: string): Promise<Product[]> {
    const q = query(
      this.collection,
      where('isActive', '==', true),
      where('searchTerms', 'array-contains', searchTerm.toLowerCase())
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[]
  }

  // Create product (for suppliers/admins)
  async createProduct(productData: Omit<Product, 'id'>): Promise<string> {
    const docRef = await addDoc(this.collection, {
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date(),
      searchTerms: this.generateSearchTerms(productData.name, productData.description)
    })
    return docRef.id
  }

  // Update product
  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const docRef = doc(this.collection, id)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    })
  }

  // Delete product
  async deleteProduct(id: string): Promise<void> {
    const docRef = doc(this.collection, id)
    await deleteDoc(docRef)
  }

  private generateSearchTerms(name: string, description: string): string[] {
    const terms = [
      name.toLowerCase(),
      description.toLowerCase(),
      ...name.toLowerCase().split(' '),
      ...description.toLowerCase().split(' ')
    ]
    return [...new Set(terms)].filter(term => term.length > 2)
  }
}

export const productService = new ProductService()
```

#### Migrate Mock Products to Firestore
```typescript
// scripts/migrate-products.ts
import { productService } from '@/lib/services/product.service'
import { mockProducts } from '@/lib/mock-data'

export async function migrateProducts() {
  console.log('Starting product migration...')
  
  for (const mockProduct of mockProducts) {
    try {
      const productData = {
        name: mockProduct.name,
        description: mockProduct.description,
        price: mockProduct.price,
        originalPrice: mockProduct.originalPrice,
        category: mockProduct.category,
        subcategory: mockProduct.subcategory,
        images: mockProduct.images,
        stock: mockProduct.stock,
        sku: mockProduct.sku,
        rating: mockProduct.rating,
        reviewCount: mockProduct.reviewCount,
        specifications: mockProduct.specifications,
        isActive: true,
        isFeatured: false,
        supplierId: 'default-supplier', // Replace with real supplier ID
        approvalStatus: 'approved',
        tags: mockProduct.tags || []
      }
      
      const productId = await productService.createProduct(productData)
      console.log(`Migrated product: ${mockProduct.name} -> ${productId}`)
    } catch (error) {
      console.error(`Failed to migrate product ${mockProduct.name}:`, error)
    }
  }
  
  console.log('Product migration completed!')
}
```

### 2.2 User Management Migration

#### Create User Service
```typescript
// src/lib/services/user.service.ts
import { db, auth } from '@/lib/firebase/config'
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore'
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth'
import { User, UserRole } from '@/types'

export class UserService {
  private collection = collection(db, 'users')

  // Create new user
  async createUser(userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    role?: UserRole
  }): Promise<string> {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    )

    // Create user profile in Firestore
    const userProfile = {
      uid: userCredential.user.uid,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      displayName: `${userData.firstName} ${userData.lastName}`,
      role: userData.role || 'customer',
      status: 'active',
      emailVerified: false,
      phone: '',
      addresses: [],
      preferences: {
        notifications: true,
        marketing: false,
        language: 'en',
        currency: 'USD'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date()
    }

    const docRef = await addDoc(this.collection, userProfile)
    
    // Update Firebase Auth profile
    await updateProfile(userCredential.user, {
      displayName: userProfile.displayName
    })

    return docRef.id
  }

  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    const docRef = doc(this.collection, id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User
    }
    return null
  }

  // Get user by Firebase UID
  async getUserByUid(uid: string): Promise<User | null> {
    const q = query(this.collection, where('uid', '==', uid))
    const snapshot = await getDocs(q)
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0]
      return { id: doc.id, ...doc.data() } as User
    }
    return null
  }

  // Update user profile
  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    const docRef = doc(this.collection, id)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    })
  }

  // Get all users (admin only)
  async getAllUsers(): Promise<User[]> {
    const snapshot = await getDocs(this.collection)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[]
  }

  // Update user role (admin only)
  async updateUserRole(id: string, role: UserRole): Promise<void> {
    const docRef = doc(this.collection, id)
    await updateDoc(docRef, {
      role,
      updatedAt: new Date()
    })
  }
}

export const userService = new UserService()
```

### 2.3 E-commerce Features Migration

#### Cart Service
```typescript
// src/lib/services/cart.service.ts
import { db } from '@/lib/firebase/config'
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore'
import { Cart, CartItem } from '@/types'

export class CartService {
  private collection = collection(db, 'carts')

  // Get user's cart
  async getUserCart(userId: string): Promise<Cart | null> {
    const docRef = doc(this.collection, userId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Cart
    }
    return null
  }

  // Create or update cart
  async updateCart(userId: string, items: CartItem[]): Promise<void> {
    const docRef = doc(this.collection, userId)
    const cartData = {
      userId,
      items,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      updatedAt: new Date()
    }
    
    await setDoc(docRef, cartData, { merge: true })
  }

  // Add item to cart
  async addToCart(userId: string, item: CartItem): Promise<void> {
    const cart = await this.getUserCart(userId)
    const existingItems = cart?.items || []
    
    const existingItemIndex = existingItems.findIndex(i => i.productId === item.productId)
    
    if (existingItemIndex >= 0) {
      existingItems[existingItemIndex].quantity += item.quantity
    } else {
      existingItems.push(item)
    }
    
    await this.updateCart(userId, existingItems)
  }

  // Remove item from cart
  async removeFromCart(userId: string, productId: string): Promise<void> {
    const cart = await this.getUserCart(userId)
    if (!cart) return
    
    const updatedItems = cart.items.filter(item => item.productId !== productId)
    await this.updateCart(userId, updatedItems)
  }

  // Clear cart
  async clearCart(userId: string): Promise<void> {
    const docRef = doc(this.collection, userId)
    await deleteDoc(docRef)
  }
}

export const cartService = new CartService()
```

#### Order Service
```typescript
// src/lib/services/order.service.ts
import { db } from '@/lib/firebase/config'
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore'
import { Order, OrderStatus } from '@/types'

export class OrderService {
  private collection = collection(db, 'orders')

  // Create new order
  async createOrder(orderData: Omit<Order, 'id'>): Promise<string> {
    const docRef = await addDoc(this.collection, {
      ...orderData,
      status: 'pending' as OrderStatus,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    return docRef.id
  }

  // Get order by ID
  async getOrderById(id: string): Promise<Order | null> {
    const docRef = doc(this.collection, id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Order
    }
    return null
  }

  // Get user's orders
  async getUserOrders(userId: string): Promise<Order[]> {
    const q = query(
      this.collection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[]
  }

  // Update order status
  async updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
    const docRef = doc(this.collection, id)
    await updateDoc(docRef, {
      status,
      updatedAt: new Date()
    })
  }

  // Get all orders (admin/supplier)
  async getAllOrders(): Promise<Order[]> {
    const q = query(this.collection, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[]
  }
}

export const orderService = new OrderService()
```

---

## 🔧 Phase 3: Component Updates

### 3.1 Update Product Components

#### Product Search Component
```typescript
// src/components/product/product-search.tsx
'use client'

import { useState, useEffect } from 'react'
import { productService } from '@/lib/services/product.service'
import { Product } from '@/types'

interface ProductSearchProps {
  initialProducts?: Product[]
  category?: string
  subcategory?: string
}

export default function ProductSearch({ 
  initialProducts = [], 
  category, 
  subcategory 
}: ProductSearchProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [loading, setLoading] = useState(!initialProducts.length)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
  }, [category, subcategory])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let products: Product[]
      
      if (subcategory) {
        products = await productService.getProductsBySubcategory(subcategory)
      } else if (category) {
        products = await productService.getProductsByCategory(category)
      } else {
        products = await productService.getAllProducts()
      }
      
      setProducts(products)
    } catch (err) {
      setError('Failed to load products')
      console.error('Error loading products:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      await loadProducts()
      return
    }

    try {
      setLoading(true)
      const searchResults = await productService.searchProducts(searchTerm)
      setProducts(searchResults)
    } catch (err) {
      setError('Search failed')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading products...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### 3.2 Update Cart Components

#### Cart Context
```typescript
// src/contexts/cart-context.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { cartService } from '@/lib/services/cart.service'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { Cart, CartItem } from '@/types'

interface CartContextType {
  cart: Cart | null
  loading: boolean
  addToCart: (item: CartItem) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useFirebaseAuth()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadCart()
    } else {
      setCart(null)
      setLoading(false)
    }
  }, [user])

  const loadCart = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const userCart = await cartService.getUserCart(user.uid)
      setCart(userCart)
    } catch (error) {
      console.error('Error loading cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (item: CartItem) => {
    if (!user) return
    
    try {
      await cartService.addToCart(user.uid, item)
      await loadCart() // Reload cart
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  const removeFromCart = async (productId: string) => {
    if (!user) return
    
    try {
      await cartService.removeFromCart(user.uid, productId)
      await loadCart() // Reload cart
    } catch (error) {
      console.error('Error removing from cart:', error)
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user || !cart) return
    
    try {
      const updatedItems = cart.items.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
      await cartService.updateCart(user.uid, updatedItems)
      await loadCart() // Reload cart
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  }

  const clearCart = async () => {
    if (!user) return
    
    try {
      await cartService.clearCart(user.uid)
      setCart(null)
    } catch (error) {
      console.error('Error clearing cart:', error)
    }
  }

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
```

---

## 🚀 Phase 4: Deployment & Testing

### 4.1 Update App Layout
```typescript
// src/app/layout.tsx
import { CartProvider } from '@/contexts/cart-context'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <FirebaseAuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </FirebaseAuthProvider>
      </body>
    </html>
  )
}
```

### 4.2 Migration Script
```typescript
// scripts/migrate-to-production.ts
import { migrateProducts } from './migrate-products'
import { migrateUsers } from './migrate-users'
import { migrateCategories } from './migrate-categories'

export async function migrateToProduction() {
  console.log('🚀 Starting production migration...')
  
  try {
    // 1. Migrate categories first
    console.log('📂 Migrating categories...')
    await migrateCategories()
    
    // 2. Migrate products
    console.log('📦 Migrating products...')
    await migrateProducts()
    
    // 3. Migrate users (if any)
    console.log('👥 Migrating users...')
    await migrateUsers()
    
    console.log('✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

// Run migration
if (require.main === module) {
  migrateToProduction()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}
```

### 4.3 Testing Checklist
- [ ] **Product Loading** - Verify products load from Firestore
- [ ] **User Authentication** - Test login/register with Firebase Auth
- [ ] **Cart Functionality** - Test cart operations with real data
- [ ] **Order Creation** - Test order creation and management
- [ ] **Search & Filtering** - Test product search functionality
- [ ] **Admin Features** - Test admin dashboard and user management
- [ ] **Supplier Features** - Test supplier product submission
- [ ] **Performance** - Verify loading times and responsiveness

---

## 🔒 Security Considerations

### 1. **Environment Variables**
- Use production Firebase project credentials
- Never commit `.env.local` to version control
- Use different Firebase projects for dev/staging/production

### 2. **Security Rules**
- Implement proper Firestore security rules
- Test security rules thoroughly
- Use role-based access control

### 3. **Data Validation**
- Validate all user inputs
- Sanitize data before storing
- Implement proper error handling

### 4. **Authentication**
- Enable proper authentication providers
- Implement email verification
- Set up password reset functionality

---

## 📊 Monitoring & Analytics

### 1. **Firebase Analytics**
```typescript
// Enable Firebase Analytics
import { getAnalytics, logEvent } from 'firebase/analytics'

const analytics = getAnalytics(app)

// Track events
logEvent(analytics, 'purchase', {
  currency: 'USD',
  value: 99.99,
  items: [{ item_id: 'product_1', item_name: 'Product Name' }]
})
```

### 2. **Error Tracking**
```typescript
// Implement error tracking
import { getPerformance } from 'firebase/performance'

const perf = getPerformance(app)

// Track custom events
const trace = perf.trace('custom_trace')
trace.start()
// ... your code ...
trace.stop()
```

---

## 🎯 Next Steps After Migration

1. **Payment Integration** - Implement real payment gateway
2. **Email Notifications** - Set up email service for order confirmations
3. **Inventory Management** - Implement real-time stock tracking
4. **Shipping Integration** - Connect with shipping providers
5. **Analytics Dashboard** - Build comprehensive analytics
6. **Mobile App** - Develop native mobile applications

---

**Remember:** Test thoroughly in a staging environment before deploying to production! 🚀
