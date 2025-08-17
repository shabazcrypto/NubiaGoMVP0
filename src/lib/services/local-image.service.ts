export class LocalImageService {
  // Product images mapping
  private productImages = {
    electronics: [
      '/product-tech-1.svg',
      '/product-headphones-1.svg',
      '/product-headphones-2.svg',
      '/product-watch-1.svg',
      '/product-watch-2.svg',
      '/product-watch-3.svg'
    ],
    fashion: [
      '/product-fashion-1.svg',
      '/product-clothing-1.svg',
      '/product-bag-1.svg',
      '/product-bag-2.svg',
      '/product-shoes-1.svg'
    ],
    accessories: [
      '/product-accessories-1.svg',
      '/product-watch-1.svg',
      '/product-watch-2.svg',
      '/product-watch-3.svg'
    ],
    home: [
      '/product-home-1.svg',
      '/product-tech-1.svg',
      '/product-accessories-1.svg'
    ],
    cosmetics: [
      '/product-cosmetics-1.svg'
    ],
    tech: [
      '/product-tech-1.svg',
      '/product-headphones-1.svg',
      '/product-headphones-2.svg',
      '/product-watch-1.svg',
      '/product-watch-2.svg',
      '/product-watch-3.svg'
    ],
    headphones: [
      '/product-headphones-1.svg',
      '/product-headphones-2.svg'
    ],
    watch: [
      '/product-watch-1.svg',
      '/product-watch-2.svg',
      '/product-watch-3.svg'
    ],
    bag: [
      '/product-bag-1.svg',
      '/product-bag-2.svg'
    ],
    shoes: [
      '/product-shoes-1.svg'
    ],
    default: [
      '/product-brand-1.svg',
      '/product-logo-1.svg',
      '/product-tech-1.svg'
    ]
  }

  // Category images mapping
  private categoryImages = {
    electronics: [
      '/category-electronics.svg',
      '/category-electronics-2.svg'
    ],
    fashion: [
      '/category-men.svg',
      '/category-cosmetics.svg'
    ],
    home: [
      '/category-home-living.svg'
    ],
    'home-living': [
      '/category-home-living.svg'
    ],
    lifestyle: [
      '/category-mother-child.svg'
    ],
    'mother-child': [
      '/category-mother-child.svg'
    ],
    accessories: [
      '/category-shoes-bags.svg'
    ],
    'shoes-bags': [
      '/category-shoes-bags.svg'
    ],
    men: [
      '/category-men.svg'
    ],
    cosmetics: [
      '/category-cosmetics.svg'
    ],
    default: [
      '/category-electronics.svg',
      '/category-home-living.svg'
    ]
  }

  // Avatar images
  private avatarImages = [
    '/avatar-user-1.svg',
    '/avatar-user-2.svg',
    '/avatar-user-3.svg',
    '/avatar-user-5.svg'
  ]

  // Hero images
  private heroImages = [
    '/ui-hero-banner.svg',
    '/hero-image.webp'
  ]

  // Get a random image from an array
  private getRandomImage(images: string[]): string {
    const randomIndex = Math.floor(Math.random() * images.length)
    return images[randomIndex]
  }

  // Get product image based on category and variant
  getProductImage(category: string = 'default', variant: number = 0): string {
    const categoryImages = this.productImages[category as keyof typeof this.productImages] || this.productImages.default
    
    if (variant >= 0 && variant < categoryImages.length) {
      return categoryImages[variant]
    }
    
    return this.getRandomImage(categoryImages)
  }

  // Get category image based on category name and variant
  getCategoryImage(categoryName: string = 'default', variant: number = 0): string {
    const categoryImages = this.categoryImages[categoryName as keyof typeof this.categoryImages] || this.categoryImages.default
    
    if (variant >= 0 && variant < categoryImages.length) {
      return categoryImages[variant]
    }
    
    return this.getRandomImage(categoryImages)
  }

  // Get hero image
  getHeroImage(variant: number = 0): string {
    if (variant >= 0 && variant < this.heroImages.length) {
      return this.heroImages[variant]
    }
    return this.getRandomImage(this.heroImages)
  }

  // Get avatar image based on seed
  getAvatarImage(seed: string = 'user', size: number = 120): string {
    // Use seed to determine avatar
    const hash = this.hashCode(seed)
    const index = Math.abs(hash) % this.avatarImages.length
    return this.avatarImages[index]
  }

  // Simple hash function for consistent avatar selection
  private hashCode(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash
  }

  // Get fallback image by type
  getFallbackImage(type: 'product' | 'category' | 'avatar' | 'banner'): string {
    const fallbacks = {
      product: '/fallbacks/product.svg',
      category: '/fallbacks/category.svg',
      avatar: '/fallbacks/avatar.svg',
      banner: '/fallbacks/banner.svg'
    }
    return fallbacks[type]
  }

  // ============================================================================
  // UTILITY FUNCTIONS (MERGED FROM OLD IMAGE-UTILS)
  // ============================================================================
  
  // Format file size for display
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get image dimensions from file
  getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.width, height: img.height })
      img.src = URL.createObjectURL(file)
    })
  }

  // Preload image
  preloadImage(src: string): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve()
      img.src = src
    })
  }

  // Validate image path
  validateImagePath(path: string): string {
    if (!path) return this.getFallbackImage('product')
    
    // If it's already a full URL, return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }
    
    // If it's already a public path, return as is
    if (path.startsWith('/')) {
      return path
    }
    
    // For local development, assume it's in public folder
    return `/${path}`
  }

  // Handle image errors
  handleImageError(event: React.SyntheticEvent<HTMLImageElement, Event>, fallbackType: 'product' | 'category' | 'avatar' | 'banner' = 'product'): void {
    const target = event.target as HTMLImageElement
    target.src = this.getFallbackImage(fallbackType)
    target.alt = 'Image not available'
  }

  // ============================================================================
  // IMAGE CONFIGURATION (MERGED FROM OLD CONFIG)
  // ============================================================================
  
  static readonly CONFIG = {
    // File size limits
    maxFileSize: 5 * 1024 * 1024, // 5MB
    minFileSize: 100, // 100 bytes minimum
    
    // Allowed file types
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
    
    // Image dimensions
    maxWidth: 4096,
    maxHeight: 4096,
    
    // Quality settings
    quality: 85,
    thumbnailWidth: 300,
    thumbnailHeight: 300,
    
    // Responsive breakpoints
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1280
    },
    
    // Default sizes
    sizes: {
      product: {
        thumbnail: { width: 300, height: 300 },
        medium: { width: 600, height: 600 },
        large: { width: 800, height: 800 }
      },
      category: {
        thumbnail: { width: 200, height: 200 },
        medium: { width: 400, height: 400 }
      },
      avatar: {
        small: { width: 40, height: 40 },
        medium: { width: 80, height: 80 },
        large: { width: 200, height: 200 }
      }
    }
  }
}

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ImageCategory = 'products' | 'categories' | 'avatars' | 'banners' | 'fallbacks'

export interface ImageMetadata {
  id: string
  originalName: string
  urls: {
    original: string
    thumbnail: string
  }
  size: number
  type: string
  width?: number
  height?: number
  uploadedAt: Date
  isActive: boolean
  tags?: string[]
  category?: string
  description?: string
}

// Export singleton instance
export const localImageService = new LocalImageService()
