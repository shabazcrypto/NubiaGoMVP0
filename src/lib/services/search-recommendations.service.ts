import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  addDoc,
  writeBatch,
  onSnapshot,
  limit,
  startAfter
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { auditService } from './audit.service'

export interface SearchQuery {
  id: string
  userId?: string
  query: string
  filters: SearchFilters
  results: SearchResult[]
  resultCount: number
  searchTime: number
  timestamp: Date
  sessionId?: string
}

export interface SearchFilters {
  categories?: string[]
  priceRange?: { min: number; max: number }
  brands?: string[]
  ratings?: number
  inStock?: boolean
  onSale?: boolean
  tags?: string[]
  attributes?: Record<string, any>
  sortBy?: SortOption
  sortOrder?: 'asc' | 'desc'
}

export type SortOption = 
  | 'relevance'
  | 'price'
  | 'rating'
  | 'popularity'
  | 'newest'
  | 'name'
  | 'discount'

export interface SearchResult {
  productId: string
  title: string
  description: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  imageUrl: string
  category: string
  brand: string
  inStock: boolean
  relevanceScore: number
  tags: string[]
}

export interface UserBehavior {
  userId: string
  sessionId: string
  action: BehaviorAction
  productId?: string
  categoryId?: string
  searchQuery?: string
  timestamp: Date
  metadata?: Record<string, any>
}

export type BehaviorAction = 
  | 'view_product'
  | 'add_to_cart'
  | 'add_to_wishlist'
  | 'purchase'
  | 'search'
  | 'filter'
  | 'sort'
  | 'click_recommendation'

export interface UserProfile {
  userId: string
  preferences: UserPreferences
  categories: CategoryAffinity[]
  brands: BrandAffinity[]
  priceRange: { min: number; max: number }
  searchHistory: string[]
  viewHistory: string[]
  purchaseHistory: string[]
  lastUpdated: Date
}

export interface UserPreferences {
  preferredCategories: string[]
  preferredBrands: string[]
  priceRange: { min: number; max: number }
  preferredAttributes: Record<string, any>
  excludedCategories: string[]
  excludedBrands: string[]
}

export interface CategoryAffinity {
  categoryId: string
  score: number
  interactions: number
  lastInteraction: Date
}

export interface BrandAffinity {
  brandId: string
  score: number
  interactions: number
  purchases: number
  lastInteraction: Date
}

export interface Recommendation {
  id: string
  userId: string
  type: RecommendationType
  products: RecommendedProduct[]
  algorithm: string
  confidence: number
  context?: string
  createdAt: Date
  expiresAt: Date
}

export type RecommendationType = 
  | 'personalized'
  | 'trending'
  | 'similar_products'
  | 'frequently_bought_together'
  | 'recently_viewed'
  | 'category_based'
  | 'brand_based'
  | 'seasonal'

export interface RecommendedProduct {
  productId: string
  score: number
  reason: string
  metadata?: Record<string, any>
}

export interface SearchSuggestion {
  query: string
  frequency: number
  category?: string
  trending: boolean
  lastUsed: Date
}

export interface TrendingProduct {
  productId: string
  score: number
  category: string
  timeframe: 'hourly' | 'daily' | 'weekly' | 'monthly'
  metrics: {
    views: number
    searches: number
    purchases: number
    addToCarts: number
  }
  updatedAt: Date
}

export class SearchRecommendationsService {
  private readonly SEARCH_QUERIES_COLLECTION = 'search_queries'
  private readonly USER_BEHAVIORS_COLLECTION = 'user_behaviors'
  private readonly USER_PROFILES_COLLECTION = 'user_profiles'
  private readonly RECOMMENDATIONS_COLLECTION = 'recommendations'
  private readonly SEARCH_SUGGESTIONS_COLLECTION = 'search_suggestions'
  private readonly TRENDING_PRODUCTS_COLLECTION = 'trending_products'

  // Perform search with recommendations
  async performSearch(
    query: string,
    filters: SearchFilters = {},
    userId?: string,
    sessionId?: string
  ): Promise<{
    results: SearchResult[]
    suggestions: string[]
    totalCount: number
    searchTime: number
  }> {
    try {
      const startTime = Date.now()

      // Get user profile for personalization
      let userProfile: UserProfile | null = null
      if (userId) {
        userProfile = await this.getUserProfile(userId)
      }

      // Perform the actual search
      const searchResults = await this.executeSearch(query, filters, userProfile)

      // Get search suggestions
      const suggestions = await this.getSearchSuggestions(query)

      const searchTime = Date.now() - startTime

      // Record search query
      await this.recordSearchQuery({
        query,
        filters,
        results: searchResults,
        resultCount: searchResults.length,
        searchTime,
        userId,
        sessionId
      })

      // Record user behavior
      if (userId && sessionId) {
        await this.recordUserBehavior({
          userId,
          sessionId,
          action: 'search',
          searchQuery: query,
          timestamp: new Date(),
          metadata: { filters, resultCount: searchResults.length }
        })
      }

      // Update search suggestions
      await this.updateSearchSuggestions(query)

      return {
        results: searchResults,
        suggestions,
        totalCount: searchResults.length,
        searchTime
      }
    } catch (error) {
      throw new Error(`Search failed: ${(error as Error).message}`)
    }
  }

  // Get personalized recommendations
  async getPersonalizedRecommendations(
    userId: string,
    type: RecommendationType = 'personalized',
    limit: number = 10,
    context?: string
  ): Promise<Recommendation> {
    try {
      const userProfile = await this.getUserProfile(userId)
      if (!userProfile) {
        // Return trending products for new users
        return await this.getTrendingRecommendations(limit)
      }

      let recommendedProducts: RecommendedProduct[] = []
      let algorithm = ''
      let confidence = 0

      switch (type) {
        case 'personalized':
          const result = await this.generatePersonalizedRecommendations(userProfile, limit)
          recommendedProducts = result.products
          algorithm = result.algorithm
          confidence = result.confidence
          break

        case 'similar_products':
          if (context) {
            recommendedProducts = await this.getSimilarProducts(context, limit)
            algorithm = 'content_similarity'
            confidence = 0.8
          }
          break

        case 'frequently_bought_together':
          if (context) {
            recommendedProducts = await this.getFrequentlyBoughtTogether(context, limit)
            algorithm = 'market_basket_analysis'
            confidence = 0.7
          }
          break

        case 'category_based':
          recommendedProducts = await this.getCategoryBasedRecommendations(userProfile, limit)
          algorithm = 'category_affinity'
          confidence = 0.6
          break

        case 'brand_based':
          recommendedProducts = await this.getBrandBasedRecommendations(userProfile, limit)
          algorithm = 'brand_affinity'
          confidence = 0.6
          break

        default:
          recommendedProducts = await this.getTrendingProducts(limit)
          algorithm = 'trending'
          confidence = 0.5
      }

      const recommendation: Omit<Recommendation, 'id'> = {
        userId,
        type,
        products: recommendedProducts,
        algorithm,
        confidence,
        context,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }

      const docRef = await addDoc(collection(db, this.RECOMMENDATIONS_COLLECTION), recommendation)

      const createdRecommendation = {
        id: docRef.id,
        ...recommendation
      }

      // Log recommendation generation
      await auditService.logSystemEvent(
        'recommendations_generated',
        {
          userId,
          type,
          algorithm,
          confidence,
          productCount: recommendedProducts.length
        },
        true
      )

      return createdRecommendation
    } catch (error) {
      throw new Error(`Failed to generate recommendations: ${(error as Error).message}`)
    }
  }

  // Record user behavior
  async recordUserBehavior(behavior: Omit<UserBehavior, 'timestamp'>): Promise<void> {
    try {
      const behaviorData: UserBehavior = {
        ...behavior,
        timestamp: new Date()
      }

      await addDoc(collection(db, this.USER_BEHAVIORS_COLLECTION), behaviorData)

      // Update user profile based on behavior
      await this.updateUserProfile(behavior.userId, behavior)

      // Update trending products
      if (behavior.productId) {
        await this.updateTrendingProducts(behavior.productId, behavior.action)
      }
    } catch (error) {
      // Log error but don't throw
      await auditService.logSystemEvent(
        'user_behavior_recording_failed',
        {
          userId: behavior.userId,
          action: behavior.action,
          error: (error as Error).message
        },
        false
      )
    }
  }

  // Get search suggestions
  async getSearchSuggestions(query: string, limit: number = 10): Promise<string[]> {
    try {
      if (query.length < 2) return []

      const q = query(
        collection(db, this.SEARCH_SUGGESTIONS_COLLECTION),
        where('query', '>=', query.toLowerCase()),
        where('query', '<=', query.toLowerCase() + '\uf8ff'),
        orderBy('frequency', 'desc'),
        limit(limit)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => doc.data().query)
    } catch (error) {
      return []
    }
  }

  // Get trending products
  async getTrendingProducts(
    limit: number = 10,
    timeframe: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'daily',
    category?: string
  ): Promise<RecommendedProduct[]> {
    try {
      let q = query(
        collection(db, this.TRENDING_PRODUCTS_COLLECTION),
        where('timeframe', '==', timeframe),
        orderBy('score', 'desc'),
        limit(limit)
      )

      if (category) {
        q = query(q, where('category', '==', category))
      }

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => {
        const data = doc.data() as TrendingProduct
        return {
          productId: data.productId,
          score: data.score,
          reason: `Trending in ${timeframe} timeframe`,
          metadata: { metrics: data.metrics }
        }
      })
    } catch (error) {
      return []
    }
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const profileDoc = await getDoc(doc(db, this.USER_PROFILES_COLLECTION, userId))
      
      if (!profileDoc.exists()) {
        return null
      }

      return profileDoc.data() as UserProfile
    } catch (error) {
      return null
    }
  }

  // Update user profile
  async updateUserProfile(userId: string, behavior: Omit<UserBehavior, 'timestamp'>): Promise<void> {
    try {
      const profileRef = doc(db, this.USER_PROFILES_COLLECTION, userId)
      const profileDoc = await getDoc(profileRef)
      
      let profile: UserProfile

      if (profileDoc.exists()) {
        profile = profileDoc.data() as UserProfile
      } else {
        profile = {
          userId,
          preferences: {
            preferredCategories: [],
            preferredBrands: [],
            priceRange: { min: 0, max: 10000 },
            preferredAttributes: {},
            excludedCategories: [],
            excludedBrands: []
          },
          categories: [],
          brands: [],
          priceRange: { min: 0, max: 10000 },
          searchHistory: [],
          viewHistory: [],
          purchaseHistory: [],
          lastUpdated: new Date()
        }
      }

      // Update profile based on behavior
      switch (behavior.action) {
        case 'search':
          if (behavior.searchQuery && !profile.searchHistory.includes(behavior.searchQuery)) {
            profile.searchHistory.unshift(behavior.searchQuery)
            profile.searchHistory = profile.searchHistory.slice(0, 50) // Keep last 50 searches
          }
          break

        case 'view_product':
          if (behavior.productId && !profile.viewHistory.includes(behavior.productId)) {
            profile.viewHistory.unshift(behavior.productId)
            profile.viewHistory = profile.viewHistory.slice(0, 100) // Keep last 100 views
          }
          break

        case 'purchase':
          if (behavior.productId && !profile.purchaseHistory.includes(behavior.productId)) {
            profile.purchaseHistory.unshift(behavior.productId)
          }
          break
      }

      // Update category affinity
      if (behavior.categoryId) {
        const categoryIndex = profile.categories.findIndex(c => c.categoryId === behavior.categoryId)
        if (categoryIndex >= 0) {
          profile.categories[categoryIndex].interactions++
          profile.categories[categoryIndex].lastInteraction = new Date()
          profile.categories[categoryIndex].score = this.calculateAffinityScore(
            profile.categories[categoryIndex].interactions,
            profile.categories[categoryIndex].lastInteraction
          )
        } else {
          profile.categories.push({
            categoryId: behavior.categoryId,
            score: 1,
            interactions: 1,
            lastInteraction: new Date()
          })
        }
      }

      profile.lastUpdated = new Date()

      await setDoc(profileRef, profile)
    } catch (error) {
      // Log error but don't throw
      await auditService.logSystemEvent(
        'user_profile_update_failed',
        {
          userId,
          error: (error as Error).message
        },
        false
      )
    }
  }

  // Get search analytics
  async getSearchAnalytics(startDate?: Date, endDate?: Date): Promise<{
    totalSearches: number
    uniqueUsers: number
    averageResultsPerSearch: number
    topQueries: { query: string; count: number }[]
    noResultQueries: { query: string; count: number }[]
    searchTrends: { date: string; searches: number }[]
  }> {
    try {
      let searchQuery = query(collection(db, this.SEARCH_QUERIES_COLLECTION))
      
      if (startDate) {
        searchQuery = query(searchQuery, where('timestamp', '>=', startDate))
      }
      
      if (endDate) {
        searchQuery = query(searchQuery, where('timestamp', '<=', endDate))
      }

      const snapshot = await getDocs(searchQuery)
      const searches = snapshot.docs.map(doc => doc.data()) as SearchQuery[]

      const totalSearches = searches.length
      const uniqueUsers = new Set(searches.map(s => s.userId).filter(Boolean)).size
      const averageResultsPerSearch = searches.reduce((sum, s) => sum + s.resultCount, 0) / totalSearches

      // Top queries
      const queryCount: Record<string, number> = {}
      searches.forEach(search => {
        queryCount[search.query] = (queryCount[search.query] || 0) + 1
      })
      const topQueries = Object.entries(queryCount)
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      // No result queries
      const noResultQueries = searches
        .filter(s => s.resultCount === 0)
        .reduce((acc, s) => {
          acc[s.query] = (acc[s.query] || 0) + 1
          return acc
        }, {} as Record<string, number>)

      const noResultQueriesArray = Object.entries(noResultQueries)
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      // Search trends (simplified)
      const searchTrends = [
        { date: '2024-01-01', searches: 150 },
        { date: '2024-01-02', searches: 180 },
        { date: '2024-01-03', searches: 165 }
      ]

      return {
        totalSearches,
        uniqueUsers,
        averageResultsPerSearch,
        topQueries,
        noResultQueries: noResultQueriesArray,
        searchTrends
      }
    } catch (error) {
      throw new Error('Failed to get search analytics')
    }
  }

  // Private helper methods
  private async executeSearch(
    query: string,
    filters: SearchFilters,
    userProfile?: UserProfile | null
  ): Promise<SearchResult[]> {
    // This would integrate with your product search implementation
    // For now, returning mock results
    return [
      {
        productId: '1',
        title: 'Sample Product',
        description: 'Sample description',
        price: 99.99,
        rating: 4.5,
        reviewCount: 100,
        imageUrl: '/images/sample.jpg',
        category: 'electronics',
        brand: 'SampleBrand',
        inStock: true,
        relevanceScore: 0.95,
        tags: ['popular', 'trending']
      }
    ]
  }

  private async recordSearchQuery(searchData: {
    query: string
    filters: SearchFilters
    results: SearchResult[]
    resultCount: number
    searchTime: number
    userId?: string
    sessionId?: string
  }): Promise<void> {
    try {
      const searchQuery: Omit<SearchQuery, 'id'> = {
        ...searchData,
        timestamp: new Date()
      }

      await addDoc(collection(db, this.SEARCH_QUERIES_COLLECTION), searchQuery)
    } catch (error) {
      // Log error but don't throw
      await auditService.logSystemEvent(
        'search_query_recording_failed',
        {
          query: searchData.query,
          error: (error as Error).message
        },
        false
      )
    }
  }

  private async updateSearchSuggestions(query: string): Promise<void> {
    try {
      const normalizedQuery = query.toLowerCase().trim()
      if (normalizedQuery.length < 2) return

      const suggestionRef = doc(db, this.SEARCH_SUGGESTIONS_COLLECTION, normalizedQuery)
      const suggestionDoc = await getDoc(suggestionRef)

      if (suggestionDoc.exists()) {
        const data = suggestionDoc.data() as SearchSuggestion
        await updateDoc(suggestionRef, {
          frequency: data.frequency + 1,
          lastUsed: new Date()
        })
      } else {
        const suggestion: SearchSuggestion = {
          query: normalizedQuery,
          frequency: 1,
          trending: false,
          lastUsed: new Date()
        }
        await setDoc(suggestionRef, suggestion)
      }
    } catch (error) {
      // Log error but don't throw
      await auditService.logSystemEvent(
        'search_suggestion_update_failed',
        {
          query,
          error: (error as Error).message
        },
        false
      )
    }
  }

  private async generatePersonalizedRecommendations(
    userProfile: UserProfile,
    limit: number
  ): Promise<{ products: RecommendedProduct[]; algorithm: string; confidence: number }> {
    // Simplified collaborative filtering approach
    const products: RecommendedProduct[] = []
    
    // Use category affinities to recommend products
    const topCategories = userProfile.categories
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)

    for (const category of topCategories) {
      // This would fetch actual products from the category
      products.push({
        productId: `product_${category.categoryId}_${Math.random()}`,
        score: category.score,
        reason: `Based on your interest in ${category.categoryId}`,
        metadata: { categoryId: category.categoryId }
      })
    }

    return {
      products: products.slice(0, limit),
      algorithm: 'collaborative_filtering',
      confidence: 0.8
    }
  }

  private async getSimilarProducts(productId: string, limit: number): Promise<RecommendedProduct[]> {
    // This would implement content-based similarity
    return []
  }

  private async getFrequentlyBoughtTogether(productId: string, limit: number): Promise<RecommendedProduct[]> {
    // This would implement market basket analysis
    return []
  }

  private async getCategoryBasedRecommendations(userProfile: UserProfile, limit: number): Promise<RecommendedProduct[]> {
    // This would recommend based on preferred categories
    return []
  }

  private async getBrandBasedRecommendations(userProfile: UserProfile, limit: number): Promise<RecommendedProduct[]> {
    // This would recommend based on preferred brands
    return []
  }

  private async getTrendingRecommendations(limit: number): Promise<Recommendation> {
    const trendingProducts = await this.getTrendingProducts(limit)
    
    return {
      id: `trending_${Date.now()}`,
      userId: 'anonymous',
      type: 'trending',
      products: trendingProducts,
      algorithm: 'trending',
      confidence: 0.5,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  }

  private async updateTrendingProducts(productId: string, action: BehaviorAction): Promise<void> {
    try {
      const trendingRef = doc(db, this.TRENDING_PRODUCTS_COLLECTION, `${productId}_daily`)
      const trendingDoc = await getDoc(trendingRef)

      let trending: TrendingProduct

      if (trendingDoc.exists()) {
        trending = trendingDoc.data() as TrendingProduct
      } else {
        trending = {
          productId,
          score: 0,
          category: 'unknown', // Would be fetched from product data
          timeframe: 'daily',
          metrics: {
            views: 0,
            searches: 0,
            purchases: 0,
            addToCarts: 0
          },
          updatedAt: new Date()
        }
      }

      // Update metrics based on action
      switch (action) {
        case 'view_product':
          trending.metrics.views++
          trending.score += 1
          break
        case 'add_to_cart':
          trending.metrics.addToCarts++
          trending.score += 3
          break
        case 'purchase':
          trending.metrics.purchases++
          trending.score += 5
          break
        case 'search':
          trending.metrics.searches++
          trending.score += 2
          break
      }

      trending.updatedAt = new Date()

      await setDoc(trendingRef, trending)
    } catch (error) {
      // Log error but don't throw
      await auditService.logSystemEvent(
        'trending_products_update_failed',
        {
          productId,
          action,
          error: (error as Error).message
        },
        false
      )
    }
  }

  private calculateAffinityScore(interactions: number, lastInteraction: Date): number {
    const daysSinceLastInteraction = (Date.now() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24)
    const recencyFactor = Math.max(0.1, 1 - (daysSinceLastInteraction / 30)) // Decay over 30 days
    return interactions * recencyFactor
  }
}

export const searchRecommendationsService = new SearchRecommendationsService()
