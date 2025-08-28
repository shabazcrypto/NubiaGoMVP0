import { Product } from '@/types'

export const MOCK_PRODUCTS: Product[] = [
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
  }
]

export const MOCK_CATEGORIES = [
  { id: 'cat-1', name: 'Electronics', isActive: true, order: 1 },
  { id: 'cat-2', name: 'Fashion', isActive: true, order: 2 },
  { id: 'cat-3', name: 'Sports', isActive: true, order: 3 },
  { id: 'cat-4', name: 'Home & Garden', isActive: true, order: 4 }
]

