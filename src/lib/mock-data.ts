import { User, Product, Category, Cart, Order, Review, Wishlist, Address } from '@/types'

// ============================================================================
// MOCK USERS
// ============================================================================

export const mockUsers: User[] = [
  {
    uid: 'user-1',
    email: 'john.doe@example.com',
    displayName: 'John Doe',
    photoURL: '/avatar-user-1.jpg',
    phoneNumber: '+1234567890',
    role: 'customer',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    uid: 'user-2',
    email: 'jane.smith@example.com',
    displayName: 'Jane Smith',
    photoURL: '/avatar-user-2.jpg',
    phoneNumber: '+1234567891',
    role: 'customer',
    status: 'active',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    uid: 'supplier-1',
    email: 'techstore@example.com',
    displayName: 'Tech Store',
    photoURL: '/ui-supplier-logo-1.jpg',
    phoneNumber: '+1234567892',
    role: 'supplier',
    status: 'active',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    uid: 'admin-1',
    email: 'admin@homebase.com',
    displayName: 'Admin User',
    photoURL: '/avatar-user-3.jpg',
    phoneNumber: '+1234567893',
    role: 'admin',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
]

// ============================================================================
// MOCK CATEGORIES
// ============================================================================

export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Electronics',
    description: 'Latest gadgets and electronic devices',
    image: '/category-electronics.jpg',
    slug: 'electronics',
    isActive: true,
    order: 1
  },
  {
    id: 'cat-2',
    name: 'Clothing',
    description: 'Fashion and apparel for all ages',
    image: '/category-men.jpg',
    slug: 'clothing',
    isActive: true,
    order: 2
  },
  {
    id: 'cat-3',
    name: 'Home & Living',
    description: 'Furniture and home decor',
    image: '/category-home-living.jpg',
    slug: 'home-living',
    isActive: true,
    order: 3
  },
  {
    id: 'cat-4',
    name: 'Shoes & Bags',
    description: 'Footwear and accessories',
    image: '/category-shoes-bags.jpg',
    slug: 'shoes-bags',
    isActive: true,
    order: 4
  },
  {
    id: 'cat-5',
    name: 'Beauty & Cosmetics',
    description: 'Beauty products and cosmetics',
    image: '/category-cosmetics.jpg',
    slug: 'beauty-cosmetics',
    isActive: true,
    order: 5
  },
  {
    id: 'cat-6',
    name: 'Mother & Child',
    description: 'Products for mothers and children',
    image: '/category-mother-child.jpg',
    slug: 'mother-child',
    isActive: true,
    order: 6
  }
]

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
        productId: 'prod-1',
        quantity: 1,
        price: 89.99,
        product: mockProducts[0]
      },
      {
        productId: 'prod-2',
        quantity: 1,
        price: 299.99,
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
        productId: 'prod-3',
        quantity: 1,
        price: 149.99,
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
// MOCK REVIEWS
// ============================================================================

export const mockReviews: Review[] = [
  {
    id: 'review-1',
    productId: 'prod-1',
    userId: 'user-1',
    rating: 5,
    title: 'Excellent sound quality!',
    comment: 'These headphones are amazing. The sound quality is incredible and the battery life is impressive.',
    isVerified: true,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: 'review-2',
    productId: 'prod-1',
    userId: 'user-2',
    rating: 4,
    title: 'Great headphones',
    comment: 'Very good headphones for the price. Comfortable to wear for long periods.',
    isVerified: true,
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19')
  },
  {
    id: 'review-3',
    productId: 'prod-2',
    userId: 'user-1',
    rating: 5,
    title: 'Perfect smartwatch',
    comment: 'This smartwatch has exceeded my expectations. The health monitoring features are fantastic.',
    isVerified: true,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  }
]

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

export const getMockCategory = (id: string): Category | undefined => {
  return mockCategories.find(category => category.id === id)
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

export const getMockProductReviews = (productId: string): Review[] => {
  return mockReviews.filter(review => review.productId === productId)
} 