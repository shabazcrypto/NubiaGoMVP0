import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Wishlist, WishlistItem, Product } from '@/types'
import { productService } from './product.service'

export class WishlistService {
  private readonly COLLECTION_NAME = 'wishlists'

  // Get user's wishlist
  async getWishlist(userId: string): Promise<Wishlist> {
    try {
      const wishlistRef = doc(db, this.COLLECTION_NAME, userId)
      const wishlistDoc = await getDoc(wishlistRef)

      if (!wishlistDoc.exists()) {
        // Create empty wishlist if it doesn't exist
        const emptyWishlist: Wishlist = {
          id: userId,
          userId,
          items: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
        await setDoc(wishlistRef, emptyWishlist)
        return emptyWishlist
      }

      const wishlistData = wishlistDoc.data() as Wishlist
      
      // Fetch product details for each wishlist item
      const itemsWithProducts = await Promise.all(
        wishlistData.items.map(async (item) => {
          const product = await productService.getProduct(item.productId)
          return {
            ...item,
            product: product || {
              id: item.productId,
              name: 'Product not found',
              description: 'Product not available',
              price: 0,
              imageUrl: '',
              images: [],
              thumbnailUrl: '',
              category: '',
              sku: '',
              stock: 0,
              rating: 0,
              reviewCount: 0,
              tags: [],
              isActive: false,
              isFeatured: false,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          }
        })
      )

      return {
        ...wishlistData,
        items: itemsWithProducts as any
      }
    } catch (error) {
      // // // console.error('Error getting wishlist:', error)
      throw new Error('Failed to fetch wishlist')
    }
  }

  // Add item to wishlist
  async addToWishlist(userId: string, productId: string): Promise<Wishlist> {
    try {
      const product = await productService.getProduct(productId)
      if (!product) {
        throw new Error('Product not found')
      }

      const wishlist = await this.getWishlist(userId)
      const existingItem = wishlist.items.find(item => item.productId === productId)

      if (!existingItem) {
        // Add new item
        const newItem: WishlistItem = {
          productId,
          product,
          addedAt: new Date()
        }
        wishlist.items.push(newItem)
        wishlist.updatedAt = new Date()

        // Save to Firestore
        const wishlistRef = doc(db, this.COLLECTION_NAME, userId)
        await setDoc(wishlistRef, wishlist)
      }

      return wishlist
    } catch (error) {
      // // // console.error('Error adding to wishlist:', error)
      throw new Error('Failed to add item to wishlist')
    }
  }

  // Remove item from wishlist
  async removeFromWishlist(userId: string, productId: string): Promise<Wishlist> {
    try {
      const wishlist = await this.getWishlist(userId)
      wishlist.items = wishlist.items.filter(item => item.productId !== productId)
      wishlist.updatedAt = new Date()

      // Save to Firestore
      const wishlistRef = doc(db, this.COLLECTION_NAME, userId)
      await setDoc(wishlistRef, wishlist)

      return wishlist
    } catch (error) {
      // // // console.error('Error removing from wishlist:', error)
      throw new Error('Failed to remove item from wishlist')
    }
  }

  // Clear wishlist
  async clearWishlist(userId: string): Promise<Wishlist> {
    try {
      const wishlistRef = doc(db, this.COLLECTION_NAME, userId)
      const emptyWishlist: Wishlist = {
        id: userId,
        userId,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      await setDoc(wishlistRef, emptyWishlist)
      return emptyWishlist
    } catch (error) {
      // // // console.error('Error clearing wishlist:', error)
      throw new Error('Failed to clear wishlist')
    }
  }

  // Check if item is in wishlist
  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const wishlist = await this.getWishlist(userId)
      return wishlist.items.some(item => item.productId === productId)
    } catch (error) {
      // // // console.error('Error checking wishlist status:', error)
      return false
    }
  }

  // Get wishlist count
  async getWishlistCount(userId: string): Promise<number> {
    try {
      const wishlist = await this.getWishlist(userId)
      return wishlist.items.length
    } catch (error) {
      // // // console.error('Error getting wishlist count:', error)
      return 0
    }
  }

  // Move item from wishlist to cart
  async moveToCart(userId: string, productId: string, quantity: number = 1): Promise<{
    wishlist: Wishlist
    cartUpdated: boolean
  }> {
    try {
      // Import cart service dynamically to avoid circular dependency
      const { cartService } = await import('./cart.service')
      
      // Add to cart
      await cartService.addToCart(userId, productId, quantity)
      
      // Remove from wishlist
      const wishlist = await this.removeFromWishlist(userId, productId)
      
      return {
        wishlist,
        cartUpdated: true
      }
    } catch (error) {
      // // // console.error('Error moving item from wishlist to cart:', error)
      throw new Error('Failed to move item from wishlist to cart')
    }
  }

  // Get wishlist recommendations
  async getWishlistRecommendations(userId: string, limit: number = 5): Promise<Product[]> {
    try {
      const wishlist = await this.getWishlist(userId)
      
      if (wishlist.items.length === 0) {
        // Return featured products if wishlist is empty
        return await productService.getFeaturedProducts(limit)
      }

      // Get categories from wishlist items
      const categories = [...new Set(wishlist.items.map(item => item.product.category))]
      
      // Get products from same categories
      const recommendations: Product[] = []
      
      for (const category of categories) {
        if (recommendations.length >= limit) break
        
        const categoryProducts = await productService.getProductsByCategory(category, 1, limit)
        const filteredProducts = categoryProducts.products.filter(product => 
          !wishlist.items.some(item => item.productId === product.id)
        )
        
        recommendations.push(...filteredProducts.slice(0, limit - recommendations.length))
      }

      return recommendations
    } catch (error) {
      // // // console.error('Error getting wishlist recommendations:', error)
      return []
    }
  }

  // Share wishlist
  async shareWishlist(userId: string): Promise<{
    shareUrl: string
    shareCode: string
  }> {
    try {
      const wishlist = await this.getWishlist(userId)
      const shareCode = Math.random().toString(36).substr(2, 8).toUpperCase()
      
      // TODO: Store share code in database for public access
      // await setDoc(doc(db, 'shared_wishlists', shareCode), {
      //   userId,
      //   wishlist,
      //   createdAt: new Date()
      // })

      return {
        shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/wishlist/shared/${shareCode}`,
        shareCode
      }
    } catch (error) {
      // // // console.error('Error sharing wishlist:', error)
      throw new Error('Failed to share wishlist')
    }
  }

  // Get shared wishlist
  async getSharedWishlist(shareCode: string): Promise<Wishlist | null> {
    try {
      // TODO: Retrieve shared wishlist from database
      // const sharedDoc = await getDoc(doc(db, 'shared_wishlists', shareCode))
      // if (!sharedDoc.exists()) return null
      // return sharedDoc.data().wishlist as Wishlist
      
      return null
    } catch (error) {
      // // // console.error('Error getting shared wishlist:', error)
      return null
    }
  }

  // Get wishlist statistics
  async getWishlistStatistics(userId: string): Promise<{
    totalItems: number
    totalValue: number
    averagePrice: number
    categories: string[]
  }> {
    try {
      const wishlist = await this.getWishlist(userId)
      
      const totalItems = wishlist.items.length
      const totalValue = wishlist.items.reduce((sum, item) => sum + item.product.price, 0)
      const averagePrice = totalItems > 0 ? totalValue / totalItems : 0
      const categories = [...new Set(wishlist.items.map(item => item.product.category))]

      return {
        totalItems,
        totalValue,
        averagePrice,
        categories
      }
    } catch (error) {
      // // // console.error('Error getting wishlist statistics:', error)
      throw new Error('Failed to fetch wishlist statistics')
    }
  }
}

export const wishlistService = new WishlistService() 
