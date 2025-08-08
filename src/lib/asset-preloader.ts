// ============================================================================
// CRITICAL ASSET PRELOADING UTILITY
// ============================================================================

interface PreloadResource {
  href: string
  as: 'image' | 'style' | 'script' | 'font'
  type?: string
  crossOrigin?: 'anonymous' | 'use-credentials'
}

class AssetPreloader {
  private preloadedResources = new Set<string>()

  /**
   * Preload critical resources immediately
   */
  preloadCriticalAssets() {
    if (typeof window === 'undefined') return

    const criticalAssets: PreloadResource[] = [
      // Critical images
      { href: '/logo.svg', as: 'image' },
      { href: '/hero-image.webp', as: 'image' },
      { href: '/fallback-product.jpg', as: 'image' },
      
      // Critical fonts
      { 
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', 
        as: 'style' 
      },
      
      // Critical API endpoints
      { href: '/api/products', as: 'script' },
      { href: '/api/categories', as: 'script' },
    ]

    criticalAssets.forEach(resource => {
      this.preloadResource(resource)
    })
  }

  /**
   * Preload resource with performance optimization
   */
  private preloadResource({ href, as, type, crossOrigin }: PreloadResource) {
    if (this.preloadedResources.has(href)) return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as
    
    if (type) link.type = type
    if (crossOrigin) link.crossOrigin = crossOrigin

    // Add to head
    document.head.appendChild(link)
    this.preloadedResources.add(href)
  }

  /**
   * Preload images with intersection observer
   */
  preloadImagesOnScroll(imageUrls: string[]) {
    if (typeof window === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            const src = img.dataset.src
            if (src && !this.preloadedResources.has(src)) {
              this.preloadResource({ href: src, as: 'image' })
            }
          }
        })
      },
      { rootMargin: '100px' }
    )

    // Create placeholder elements for intersection observation
    imageUrls.forEach(url => {
      if (!this.preloadedResources.has(url)) {
        const placeholder = document.createElement('div')
        placeholder.dataset.src = url
        placeholder.style.position = 'absolute'
        placeholder.style.top = '-1px'
        placeholder.style.left = '-1px'
        placeholder.style.width = '1px'
        placeholder.style.height = '1px'
        placeholder.style.opacity = '0'
        
        document.body.appendChild(placeholder)
        observer.observe(placeholder)
      }
    })
  }

  /**
   * Prefetch next page resources
   */
  prefetchPageResources(pageUrls: string[]) {
    if (typeof window === 'undefined') return

    pageUrls.forEach(url => {
      if (!this.preloadedResources.has(url)) {
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = url
        document.head.appendChild(link)
        this.preloadedResources.add(url)
      }
    })
  }

  /**
   * DNS prefetch for external domains
   */
  prefetchDNS(domains: string[]) {
    if (typeof window === 'undefined') return

    domains.forEach(domain => {
      if (!this.preloadedResources.has(domain)) {
        const link = document.createElement('link')
        link.rel = 'dns-prefetch'
        link.href = domain
        document.head.appendChild(link)
        this.preloadedResources.add(domain)
      }
    })
  }

  /**
   * Preconnect to critical origins
   */
  preconnectOrigins(origins: string[]) {
    if (typeof window === 'undefined') return

    origins.forEach(origin => {
      if (!this.preloadedResources.has(origin)) {
        const link = document.createElement('link')
        link.rel = 'preconnect'
        link.href = origin
        link.crossOrigin = 'anonymous'
        document.head.appendChild(link)
        this.preloadedResources.add(origin)
      }
    })
  }

  /**
   * Clear preloaded resources cache
   */
  clearCache() {
    this.preloadedResources.clear()
  }
}

// Singleton instance
export const assetPreloader = new AssetPreloader()

// Initialize critical assets on load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      assetPreloader.preloadCriticalAssets()
    })
  } else {
    assetPreloader.preloadCriticalAssets()
  }
}

export default assetPreloader
