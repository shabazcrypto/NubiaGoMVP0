import { productService } from './product.service'
import { Product } from '@/types'

export class SearchService {
  // Simple search implementation (can be replaced with Algolia)
  async searchProducts(query: string, filters?: {
    category?: string
    priceRange?: { min: number; max: number }
    rating?: number
    brand?: string[]
    availability?: 'in-stock' | 'out-of-stock'
    sortBy?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'rating' | 'newest'
  }): Promise<{
    products: Product[]
    total: number
    facets: {
      categories: { [key: string]: number }
      brands: { [key: string]: number }
      priceRanges: { [key: string]: number }
    }
  }> {
    try {
      // Get all products for search
      const allProducts = await productService.getAllProducts(1, 1000)
      let products = allProducts.products

      // Apply search query
      if (query) {
        const lowercaseQuery = query.toLowerCase()
        products = products.filter(product => 
          product.name.toLowerCase().includes(lowercaseQuery) ||
          product.description.toLowerCase().includes(lowercaseQuery) ||
          product.category.toLowerCase().includes(lowercaseQuery) ||
          product.brand?.toLowerCase().includes(lowercaseQuery) ||
          product.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
        )
      }

      // Apply filters
      if (filters?.category) {
        products = products.filter(product => product.category === filters.category)
      }

      if (filters?.priceRange) {
        products = products.filter(product => 
          product.price >= filters.priceRange!.min && product.price <= filters.priceRange!.max
        )
      }

      if (filters?.rating) {
        products = products.filter(product => product.rating >= filters.rating!)
      }

      if (filters?.brand && filters.brand.length > 0) {
        products = products.filter(product => 
          product.brand && filters.brand!.includes(product.brand)
        )
      }

      if (filters?.availability) {
        if (filters.availability === 'in-stock') {
          products = products.filter(product => (product.stock ?? 0) > 0)
        } else if (filters.availability === 'out-of-stock') {
          products = products.filter(product => (product.stock ?? 0) === 0)
        }
      }

      // Apply sorting
      if (filters?.sortBy) {
        switch (filters.sortBy) {
          case 'price-asc':
            products.sort((a, b) => a.price - b.price)
            break
          case 'price-desc':
            products.sort((a, b) => b.price - a.price)
            break
          case 'name-asc':
            products.sort((a, b) => a.name.localeCompare(b.name))
            break
          case 'name-desc':
            products.sort((a, b) => b.name.localeCompare(a.name))
            break
          case 'rating':
            products.sort((a, b) => b.rating - a.rating)
            break
          case 'newest':
            products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            break
        }
      }

      // Calculate facets
      const facets = this.calculateFacets(allProducts.products)

      return {
        products,
        total: products.length,
        facets
      }
    } catch (error) {
      console.error('Error searching products:', error)
      throw new Error('Failed to search products')
    }
  }

  // Calculate search facets
  private calculateFacets(products: Product[]): {
    categories: { [key: string]: number }
    brands: { [key: string]: number }
    priceRanges: { [key: string]: number }
  } {
    const categories: { [key: string]: number } = {}
    const brands: { [key: string]: number } = {}
    const priceRanges: { [key: string]: number } = {
      '0-50': 0,
      '50-100': 0,
      '100-200': 0,
      '200-500': 0,
      '500+': 0
    }

    products.forEach(product => {
      // Categories
      categories[product.category] = (categories[product.category] || 0) + 1

      // Brands
      if (product.brand) {
        brands[product.brand] = (brands[product.brand] || 0) + 1
      }

      // Price ranges
      if (product.price <= 50) {
        priceRanges['0-50']++
      } else if (product.price <= 100) {
        priceRanges['50-100']++
      } else if (product.price <= 200) {
        priceRanges['100-200']++
      } else if (product.price <= 500) {
        priceRanges['200-500']++
      } else {
        priceRanges['500+']++
      }
    })

    return { categories, brands, priceRanges }
  }

  // Get search suggestions
  async getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
    try {
      const allProducts = await productService.getAllProducts(1, 1000)
      const suggestions = new Set<string>()

      const lowercaseQuery = query.toLowerCase()

      allProducts.products.forEach(product => {
        // Product names
        if (product.name.toLowerCase().includes(lowercaseQuery)) {
          suggestions.add(product.name)
        }

        // Categories
        if (product.category.toLowerCase().includes(lowercaseQuery)) {
          suggestions.add(product.category)
        }

        // Brands
        if (product.brand && product.brand.toLowerCase().includes(lowercaseQuery)) {
          suggestions.add(product.brand)
        }

        // Tags
        product.tags.forEach(tag => {
          if (tag.toLowerCase().includes(lowercaseQuery)) {
            suggestions.add(tag)
          }
        })
      })

      return Array.from(suggestions).slice(0, limit)
    } catch (error) {
      console.error('Error getting search suggestions:', error)
      return []
    }
  }

  // Get trending searches
  async getTrendingSearches(): Promise<string[]> {
    try {
      // TODO: Implement trending searches based on user behavior
      // For now, return popular categories
      const categories = await productService.getCategories()
      return categories.slice(0, 5).map(cat => cat.name)
    } catch (error) {
      console.error('Error getting trending searches:', error)
      return []
    }
  }

  // Get search analytics
  async trackSearch(query: string, results: number, filters?: any): Promise<void> {
    try {
      // TODO: Track search analytics
      console.log('Search tracked:', { query, results, filters })
    } catch (error) {
      console.error('Error tracking search:', error)
    }
  }

  // Get personalized recommendations
  async getPersonalizedRecommendations(userId: string, limit: number = 10): Promise<Product[]> {
    try {
      // TODO: Implement personalized recommendations based on user behavior
      // For now, return featured products
      return await productService.getFeaturedProducts(limit)
    } catch (error) {
      console.error('Error getting personalized recommendations:', error)
      return []
    }
  }

  // Search with autocomplete
  async autocompleteSearch(query: string, limit: number = 5): Promise<{
    products: Product[]
    categories: string[]
    brands: string[]
  }> {
    try {
      const allProducts = await productService.getAllProducts(1, 1000)
      const lowercaseQuery = query.toLowerCase()

      const products = allProducts.products
        .filter(product => 
          product.name.toLowerCase().includes(lowercaseQuery) ||
          product.category.toLowerCase().includes(lowercaseQuery) ||
          (product.brand && product.brand.toLowerCase().includes(lowercaseQuery))
        )
        .slice(0, limit)

      const categories = [...new Set(
        allProducts.products
          .filter(product => product.category.toLowerCase().includes(lowercaseQuery))
          .map(product => product.category)
      )].slice(0, 3)

      const brands = [...new Set(
        allProducts.products
          .filter(product => product.brand && product.brand.toLowerCase().includes(lowercaseQuery))
          .map(product => product.brand!)
      )].slice(0, 3)

      return { products, categories, brands }
    } catch (error) {
      console.error('Error with autocomplete search:', error)
      return { products: [], categories: [], brands: [] }
    }
  }
}

export const searchService = new SearchService() 
