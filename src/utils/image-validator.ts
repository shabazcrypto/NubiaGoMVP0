/**
 * Image validation utility to help debug image loading issues
 */

export class ImageValidator {
  /**
   * Check if an image URL is accessible
   */
  static async validateImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      return response.ok
    } catch (error) {
      console.warn(`Image validation failed for ${url}:`, error)
      return false
    }
  }

  /**
   * Preload an image and return a promise
   */
  static preloadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        console.log(`✅ Image loaded successfully: ${src}`)
        resolve(img)
      }
      
      img.onerror = (error) => {
        console.error(`❌ Image failed to load: ${src}`, error)
        reject(new Error(`Failed to load image: ${src}`))
      }
      
      img.src = src
    })
  }

  /**
   * Test multiple image formats for the same base name
   */
  static async testImageFormats(basePath: string, formats: string[] = ['svg', 'png', 'jpg', 'webp']): Promise<string | null> {
    for (const format of formats) {
      const testUrl = `${basePath}.${format}`
      try {
        await this.preloadImage(testUrl)
        return testUrl
      } catch (error) {
        // Continue to next format
      }
    }
    return null
  }

  /**
   * Validate all images used in the app
   */
  static async validateAppImages(): Promise<{ valid: string[], invalid: string[] }> {
    const imagesToTest = [
      '/product-tech-1.svg',
      '/product-headphones-1.svg',
      '/product-cosmetics-1.svg',
      '/product-watch-1.svg',
      '/product-fashion-1.svg',
      '/product-bag-1.svg',
      '/product-shoes-1.svg',
      '/product-accessories-1.svg',
      '/product-home-1.svg',
      '/category-electronics.svg',
      '/category-men.svg',
      '/category-cosmetics.svg',
      '/category-home-living.svg',
      '/ui-hero-banner.svg',
      '/hero-image.webp',
      '/fallbacks/product.svg',
      '/fallbacks/category.svg',
      '/fallbacks/avatar.svg',
      '/fallbacks/banner.svg'
    ]

    const valid: string[] = []
    const invalid: string[] = []

    for (const imagePath of imagesToTest) {
      try {
        await this.preloadImage(imagePath)
        valid.push(imagePath)
      } catch (error) {
        invalid.push(imagePath)
      }
    }

    console.log('Image validation results:', { valid: valid.length, invalid: invalid.length })
    if (invalid.length > 0) {
      console.warn('Invalid images:', invalid)
    }

    return { valid, invalid }
  }

  /**
   * Get optimal image format for the browser
   */
  static getOptimalFormat(): 'avif' | 'webp' | 'png' | 'jpg' {
    if (typeof window === 'undefined') return 'jpg'

    // Test AVIF support
    const avifCanvas = document.createElement('canvas')
    avifCanvas.width = 1
    avifCanvas.height = 1
    if (avifCanvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
      return 'avif'
    }

    // Test WebP support
    const webpCanvas = document.createElement('canvas')
    webpCanvas.width = 1
    webpCanvas.height = 1
    if (webpCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
      return 'webp'
    }

    // Fallback to PNG for transparency support
    return 'png'
  }
}

/**
 * Development helper to diagnose image issues
 */
export const debugImages = async () => {
  if (process.env.NODE_ENV !== 'development') return

  console.log('🔍 Running image diagnostics...')
  
  const results = await ImageValidator.validateAppImages()
  const optimalFormat = ImageValidator.getOptimalFormat()
  
  console.log('📊 Image Diagnostics Report:')
  console.log(`✅ Valid images: ${results.valid.length}`)
  console.log(`❌ Invalid images: ${results.invalid.length}`)
  console.log(`🎯 Optimal format: ${optimalFormat}`)
  
  if (results.invalid.length > 0) {
    console.warn('⚠️ The following images failed to load:')
    results.invalid.forEach(img => console.warn(`  - ${img}`))
  }
}
