import { User, Product, Cart, Order, Wishlist, Address } from '@/types'

// ============================================================================
// MOCK USERS
// ============================================================================

export const mockUsers: User[] = [
  {
    id: 'user-1',
    uid: 'user-1',
    email: 'john.doe@example.com',
    displayName: 'John Doe',
    avatar: '/avatar-user-1.jpg',
    phoneNumber: '+1234567890',
    role: 'customer',
    status: 'active',
    emailVerified: true,
    isVerified: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'user-2',
    uid: 'user-2',
    email: 'jane.smith@example.com',
    displayName: 'Jane Smith',
    avatar: '/avatar-user-2.jpg',
    phoneNumber: '+1234567891',
    role: 'customer',
    status: 'active',
    emailVerified: true,
    isVerified: true,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'supplier-1',
    uid: 'supplier-1',
    email: 'techstore@example.com',
    displayName: 'Tech Store',
    avatar: '/ui-supplier-logo-1.jpg',
    phoneNumber: '+1234567892',
    role: 'supplier',
    status: 'active',
    emailVerified: true,
    isVerified: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: 'admin-1',
    uid: 'admin-1',
    email: 'admin@homebase.com',
    displayName: 'Admin User',
    avatar: '/avatar-user-3.jpg',
    phoneNumber: '+1234567893',
    role: 'admin',
    status: 'active',
    emailVerified: true,
    isVerified: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
]

// ============================================================================
// MOCK CATEGORIES - Removed as Category type is not exported from @/types
// ============================================================================

// ============================================================================
// MOCK PRODUCTS
// ============================================================================

export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 89.99,
    originalPrice: 129.99,
    imageUrl: '/product-headphones-1.jpg',
    images: [
      '/product-headphones-1.jpg',
      '/product-headphones-2.jpg'
    ],
    thumbnailUrl: '/product-headphones-1.jpg',
    category: 'Electronics',
    subcategory: 'Audio',
    brand: 'TechAudio',
    sku: 'TECH-001',
    stock: 50,
    rating: 4.5,
    reviewCount: 128,
    tags: ['wireless', 'bluetooth', 'noise-cancellation'],
    specifications: {
      'Battery Life': '20 hours',
      'Connectivity': 'Bluetooth 5.0',
      'Weight': '250g'
    },
    isActive: true,
    isFeatured: true,
    currency: 'USD',
    inventory: 50,
    supplierId: 'supplier-1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'prod-2',
    name: 'Smart Watch Series 5',
    description: 'Advanced smartwatch with health monitoring features',
    price: 299.99,
    originalPrice: 399.99,
    imageUrl: '/product-watch-1.jpg',
    images: [
      '/product-watch-1.jpg',
      '/product-watch-2.jpg',
      '/product-watch-3.jpg'
    ],
    thumbnailUrl: '/product-watch-1.jpg',
    category: 'Electronics',
    subcategory: 'Wearables',
    brand: 'SmartTech',
    sku: 'TECH-002',
    stock: 25,
    rating: 4.8,
    reviewCount: 89,
    tags: ['smartwatch', 'health', 'fitness'],
    specifications: {
      'Display': '1.4" AMOLED',
      'Battery Life': '7 days',
      'Water Resistance': '5ATM'
    },
    isActive: true,
    isFeatured: true,
    currency: 'USD',
    inventory: 25,
    supplierId: 'supplier-1',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: 'prod-3',
    name: 'Premium Leather Bag',
    description: 'Handcrafted leather bag with multiple compartments',
    price: 149.99,
    originalPrice: 199.99,
    imageUrl: '/product-bag-1.jpg',
    images: [
      '/product-bag-1.jpg',
      '/product-bag-2.jpg'
    ],
    thumbnailUrl: '/product-bag-1.jpg',
    category: 'Shoes & Bags',
    subcategory: 'Bags',
    brand: 'LeatherCraft',
    sku: 'BAG-001',
    stock: 30,
    rating: 4.6,
    reviewCount: 67,
    tags: ['leather', 'premium', 'handcrafted'],
    specifications: {
      'Material': 'Genuine Leather',
      'Dimensions': '30x20x10 cm',
      'Weight': '800g'
    },
    isActive: true,
    isFeatured: false,
    currency: 'USD',
    inventory: 30,
    supplierId: 'supplier-1',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: 'prod-4',
    name: 'Running Shoes Pro',
    description: 'Professional running shoes with advanced cushioning',
    price: 129.99,
    originalPrice: 159.99,
    imageUrl: '/product-shoes-1.jpg',
    images: [
      '/product-shoes-1.jpg',
      '/product-shoes-2.jpg',
      '/product-shoes-3.jpg'
    ],
    thumbnailUrl: '/product-shoes-1.jpg',
    category: 'Shoes & Bags',
    subcategory: 'Shoes',
    brand: 'RunFast',
    sku: 'SHOES-001',
    stock: 75,
    rating: 4.7,
    reviewCount: 156,
    tags: ['running', 'sports', 'cushioning'],
    specifications: {
      'Weight': '280g',
      'Drop': '8mm',
      'Terrain': 'Road'
    },
    isActive: true,
    isFeatured: true,
    currency: 'USD',
    inventory: 75,
    supplierId: 'supplier-1',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08')
  },
  {
    id: 'prod-5',
    name: 'Organic Face Cream',
    description: 'Natural organic face cream for all skin types',
    price: 34.99,
    originalPrice: 44.99,
    imageUrl: '/product-cosmetics-1.jpg',
    images: [
      '/product-cosmetics-1.jpg'
    ],
    thumbnailUrl: '/product-cosmetics-1.jpg',
    category: 'Beauty & Cosmetics',
    subcategory: 'Skincare',
    brand: 'NaturalBeauty',
    sku: 'BEAUTY-001',
    stock: 100,
    rating: 4.4,
    reviewCount: 234,
    tags: ['organic', 'natural', 'skincare'],
    specifications: {
      'Volume': '50ml',
      'Skin Type': 'All types',
      'Ingredients': 'Organic'
    },
    isActive: true,
    isFeatured: false,
    currency: 'USD',
    inventory: 100,
    supplierId: 'supplier-1',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05')
  },
  {
    id: 'prod-6',
    name: 'Modern Coffee Table',
    description: 'Elegant modern coffee table for your living room',
    price: 299.99,
    originalPrice: 399.99,
    imageUrl: '/product-home-1.jpg',
    images: [
      '/product-home-1.jpg'
    ],
    thumbnailUrl: '/product-home-1.jpg',
    category: 'Home & Living',
    subcategory: 'Furniture',
    brand: 'ModernHome',
    sku: 'HOME-001',
    stock: 15,
    rating: 4.6,
    reviewCount: 45,
    tags: ['modern', 'furniture', 'coffee-table'],
    specifications: {
      'Material': 'Solid Wood',
      'Dimensions': '120x60x45 cm',
      'Weight': '25kg'
    },
    isActive: true,
    isFeatured: true,
    currency: 'USD',
    inventory: 15,
    supplierId: 'supplier-1',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  }
]

// ============================================================================
// MOCK ADDRESSES
// ============================================================================

export const mockAddresses: Address[] = [
  {
    id: 'addr-1',
    type: 'shipping',
    firstName: 'John',
    lastName: 'Doe',
    company: 'Tech Corp',
    address1: '123 Main Street',
    address2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'USA',
    phone: '+1234567890',
    isDefault: true
  },
  {
    id: 'addr-2',
    type: 'billing',
    firstName: 'Jane',
    lastName: 'Smith',
    address1: '456 Oak Avenue',
    city: 'Los Angeles',
    state: 'CA',
    postalCode: '90210',
    country: 'USA',
    phone: '+1234567891',
    isDefault: false
  }
]

// ============================================================================
// MOCK ORDERS
// ============================================================================

export const mockOrders: Order[] = [
  {
    id: 'order-1',
    userId: 'user-1',
    items: [
      {
        id: 'oi-1',
        productId: 'prod-1',
        quantity: 1,
        price: 89.99,
        total: 89.99,
        product: mockProducts[0]
      },
      {
        id: 'oi-2',
        productId: 'prod-2',
        quantity: 1,
        price: 299.99,
        total: 299.99,
        product: mockProducts[1]
      }
    ],
    total: 389.98,
    subtotal: 389.98,
    tax: 38.99,
    shipping: 15.00,
    status: 'delivered',
    paymentStatus: 'paid',
    shippingAddress: mockAddresses[0],
    billingAddress: mockAddresses[0],
    paymentMethod: 'Credit Card',
    trackingNumber: 'TRK123456789',
    notes: 'Please deliver during business hours',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-25')
  },
  {
    id: 'order-2',
    userId: 'user-2',
    items: [
      {
        id: 'oi-3',
        productId: 'prod-3',
        quantity: 1,
        price: 149.99,
        total: 149.99,
        product: mockProducts[2]
      }
    ],
    total: 164.99,
    subtotal: 149.99,
    tax: 15.00,
    shipping: 0.00,
    status: 'shipped',
    paymentStatus: 'paid',
    shippingAddress: mockAddresses[1],
    billingAddress: mockAddresses[1],
    paymentMethod: 'PayPal',
    trackingNumber: 'TRK987654321',
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-24')
  }
]

// ============================================================================
// MOCK REVIEWS - Removed as Review type is not exported from @/types
// ============================================================================

// ============================================================================
// MOCK CART
// ============================================================================

export const mockCart: Cart = {
  id: 'cart-1',
  userId: 'user-1',
  items: [
    {
      productId: 'prod-4',
      quantity: 1,
      price: 129.99,
      product: mockProducts[3]
    },
    {
      productId: 'prod-5',
      quantity: 2,
      price: 34.99,
      product: mockProducts[4]
    }
  ],
  total: 199.97,
  itemCount: 3,
  updatedAt: new Date('2024-01-25')
}

// ============================================================================
// MOCK WISHLIST
// ============================================================================

export const mockWishlist: Wishlist = {
  id: 'wishlist-1',
  userId: 'user-1',
  items: [
    {
      productId: 'prod-6',
      product: mockProducts[5],
      addedAt: new Date('2024-01-20')
    }
  ],
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-20')
}

// ============================================================================
// MOCK DATA HELPERS
// ============================================================================

export const getMockUser = (uid: string): User | undefined => {
  return mockUsers.find(user => user.uid === uid)
}

export const getMockProduct = (id: string): Product | undefined => {
  return mockProducts.find(product => product.id === id)
}

export const getMockProductsByCategory = (category: string): Product[] => {
  return mockProducts.filter(product => product.category === category)
}

export const getMockProductsBySubcategory = (subcategory: string): Product[] => {
  return mockProducts.filter(product => product.subcategory === subcategory)
}

export const getMockFeaturedProducts = (): Product[] => {
  return mockProducts.filter(product => product.isFeatured)
}

export const getMockUserOrders = (userId: string): Order[] => {
  return mockOrders.filter(order => order.userId === userId)
} 
