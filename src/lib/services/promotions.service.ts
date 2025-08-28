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
  limit
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { auditService } from './audit.service'
import { emailService } from './email.service'

export interface Promotion {
  id: string
  name: string
  description: string
  type: PromotionType
  discountType: DiscountType
  discountValue: number
  code?: string
  isCodeRequired: boolean
  conditions: PromotionConditions
  applicableProducts: string[]
  applicableCategories: string[]
  excludedProducts: string[]
  excludedCategories: string[]
  customerSegments: string[]
  usageLimit: number
  usageCount: number
  userUsageLimit: number
  startDate: Date
  endDate: Date
  isActive: boolean
  isAutoApply: boolean
  priority: number
  stackable: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export type PromotionType = 
  | 'discount'
  | 'bogo'
  | 'free_shipping'
  | 'gift_with_purchase'
  | 'bundle'
  | 'cashback'
  | 'loyalty_points'

export type DiscountType = 
  | 'percentage'
  | 'fixed_amount'
  | 'buy_x_get_y'
  | 'tiered'

export interface PromotionConditions {
  minimumOrderValue?: number
  maximumOrderValue?: number
  minimumQuantity?: number
  maximumQuantity?: number
  firstTimeCustomer?: boolean
  customerTier?: string[]
  paymentMethods?: string[]
  shippingMethods?: string[]
  dayOfWeek?: number[]
  timeOfDay?: { start: string; end: string }
}

export interface PromotionUsage {
  id: string
  promotionId: string
  userId: string
  orderId: string
  discountAmount: number
  usedAt: Date
}

export interface CouponCode {
  id: string
  code: string
  promotionId: string
  isActive: boolean
  usageLimit: number
  usageCount: number
  expirationDate?: Date
  createdAt: Date
}

export interface PromotionRule {
  id: string
  name: string
  condition: string
  action: string
  priority: number
  isActive: boolean
  createdAt: Date
}

export interface FlashSale {
  id: string
  name: string
  description: string
  products: FlashSaleProduct[]
  startDate: Date
  endDate: Date
  isActive: boolean
  notificationSent: boolean
  createdAt: Date
}

export interface FlashSaleProduct {
  productId: string
  originalPrice: number
  salePrice: number
  discountPercentage: number
  quantity: number
  soldQuantity: number
}

export interface LoyaltyProgram {
  id: string
  name: string
  description: string
  pointsPerDollar: number
  redemptionRate: number // points per dollar
  tiers: LoyaltyTier[]
  bonusEvents: BonusEvent[]
  isActive: boolean
  createdAt: Date
}

export interface LoyaltyTier {
  name: string
  minimumPoints: number
  benefits: string[]
  multiplier: number
}

export interface BonusEvent {
  name: string
  multiplier: number
  startDate: Date
  endDate: Date
  conditions?: string[]
}

export interface CustomerLoyalty {
  userId: string
  totalPoints: number
  availablePoints: number
  currentTier: string
  totalSpent: number
  joinDate: Date
  lastActivity: Date
}

export class PromotionsService {
  private readonly PROMOTIONS_COLLECTION = 'promotions'
  private readonly USAGE_COLLECTION = 'promotion_usage'
  private readonly COUPONS_COLLECTION = 'coupon_codes'
  private readonly FLASH_SALES_COLLECTION = 'flash_sales'
  private readonly LOYALTY_PROGRAMS_COLLECTION = 'loyalty_programs'
  private readonly CUSTOMER_LOYALTY_COLLECTION = 'customer_loyalty'

  // Create promotion
  async createPromotion(promotionData: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt'>): Promise<Promotion> {
    try {
      const promotion: Omit<Promotion, 'id'> = {
        ...promotionData,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const docRef = await addDoc(collection(db, this.PROMOTIONS_COLLECTION), promotion)
      
      const createdPromotion = {
        id: docRef.id,
        ...promotion
      }

      // Create coupon code if required
      if (promotion.isCodeRequired && promotion.code) {
        await this.createCouponCode({
          code: promotion.code,
          promotionId: docRef.id,
          isActive: true,
          usageLimit: promotion.usageLimit,
          usageCount: 0,
          expirationDate: promotion.endDate
        })
      }

      // Log promotion creation
      await auditService.logSystemEvent(
        'promotion_created',
        {
          promotionId: docRef.id,
          name: promotion.name,
          type: promotion.type,
          discountValue: promotion.discountValue,
          createdBy: promotion.createdBy
        },
        true
      )

      return createdPromotion
    } catch (error) {
      throw new Error(`Failed to create promotion: ${(error as Error).message}`)
    }
  }

  // Update promotion
  async updatePromotion(promotionId: string, updates: Partial<Promotion>): Promise<Promotion> {
    try {
      const promotionRef = doc(db, this.PROMOTIONS_COLLECTION, promotionId)
      const promotionDoc = await getDoc(promotionRef)
      
      if (!promotionDoc.exists()) {
        throw new Error('Promotion not found')
      }

      const updatedData = {
        ...updates,
        updatedAt: new Date()
      }

      await updateDoc(promotionRef, updatedData)

      const updatedPromotion = {
        id: promotionId,
        ...promotionDoc.data(),
        ...updatedData
      } as Promotion

      // Log promotion update
      await auditService.logSystemEvent(
        'promotion_updated',
        {
          promotionId,
          updates: Object.keys(updates)
        },
        true
      )

      return updatedPromotion
    } catch (error) {
      throw new Error(`Failed to update promotion: ${(error as Error).message}`)
    }
  }

  // Get active promotions
  async getActivePromotions(
    productIds?: string[],
    categoryIds?: string[],
    customerSegment?: string
  ): Promise<Promotion[]> {
    try {
      const now = new Date()
      let q = query(
        collection(db, this.PROMOTIONS_COLLECTION),
        where('isActive', '==', true),
        where('startDate', '<=', now),
        where('endDate', '>=', now),
        orderBy('priority', 'desc')
      )

      const snapshot = await getDocs(q)
      let promotions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Promotion[]

      // Filter by applicable products/categories
      if (productIds || categoryIds) {
        promotions = promotions.filter(promo => {
          // Check if promotion applies to any of the products
          if (productIds && promo.applicableProducts.length > 0) {
            return productIds.some(id => promo.applicableProducts.includes(id))
          }
          
          // Check if promotion applies to any of the categories
          if (categoryIds && promo.applicableCategories.length > 0) {
            return categoryIds.some(id => promo.applicableCategories.includes(id))
          }
          
          // If no specific products/categories, promotion applies to all
          return promo.applicableProducts.length === 0 && promo.applicableCategories.length === 0
        })
      }

      // Filter by customer segment
      if (customerSegment) {
        promotions = promotions.filter(promo => 
          promo.customerSegments.length === 0 || 
          promo.customerSegments.includes(customerSegment)
        )
      }

      return promotions
    } catch (error) {
      throw new Error('Failed to fetch active promotions')
    }
  }

  // Apply promotion to order
  async applyPromotion(
    promotionId: string,
    userId: string,
    orderData: {
      items: { productId: string; categoryId: string; price: number; quantity: number }[]
      subtotal: number
      shippingMethod?: string
      paymentMethod?: string
    },
    couponCode?: string
  ): Promise<{
    applicable: boolean
    discountAmount: number
    reason?: string
  }> {
    try {
      const promotion = await this.getPromotion(promotionId)
      if (!promotion) {
        return { applicable: false, reason: 'Promotion not found' }
      }

      // Check if promotion is active and within date range
      const now = new Date()
      if (!promotion.isActive || promotion.startDate > now || promotion.endDate < now) {
        return { applicable: false, reason: 'Promotion is not active' }
      }

      // Check usage limits
      if (promotion.usageCount >= promotion.usageLimit) {
        return { applicable: false, reason: 'Promotion usage limit exceeded' }
      }

      // Check user usage limit
      const userUsage = await this.getUserPromotionUsage(userId, promotionId)
      if (userUsage >= promotion.userUsageLimit) {
        return { applicable: false, reason: 'User usage limit exceeded' }
      }

      // Validate coupon code if required
      if (promotion.isCodeRequired) {
        if (!couponCode) {
          return { applicable: false, reason: 'Coupon code required' }
        }
        
        const isValidCode = await this.validateCouponCode(couponCode, promotionId)
        if (!isValidCode) {
          return { applicable: false, reason: 'Invalid coupon code' }
        }
      }

      // Check conditions
      const conditionsValid = await this.checkPromotionConditions(promotion, orderData, userId)
      if (!conditionsValid.valid) {
        return { applicable: false, reason: conditionsValid.reason }
      }

      // Calculate discount
      const discountAmount = this.calculateDiscount(promotion, orderData)
      
      return {
        applicable: true,
        discountAmount
      }
    } catch (error) {
      throw new Error(`Failed to apply promotion: ${(error as Error).message}`)
    }
  }

  // Record promotion usage
  async recordPromotionUsage(
    promotionId: string,
    userId: string,
    orderId: string,
    discountAmount: number
  ): Promise<void> {
    try {
      const batch = writeBatch(db)

      // Create usage record
      const usageRef = doc(collection(db, this.USAGE_COLLECTION))
      const usage: Omit<PromotionUsage, 'id'> = {
        promotionId,
        userId,
        orderId,
        discountAmount,
        usedAt: new Date()
      }
      batch.set(usageRef, usage)

      // Update promotion usage count
      const promotionRef = doc(db, this.PROMOTIONS_COLLECTION, promotionId)
      const promotionDoc = await getDoc(promotionRef)
      
      if (promotionDoc.exists()) {
        const promotion = promotionDoc.data() as Promotion
        batch.update(promotionRef, {
          usageCount: promotion.usageCount + 1
        })
      }

      await batch.commit()

      // Log usage
      await auditService.logSystemEvent(
        'promotion_used',
        {
          promotionId,
          userId,
          orderId,
          discountAmount
        },
        true
      )
    } catch (error) {
      throw new Error(`Failed to record promotion usage: ${(error as Error).message}`)
    }
  }

  // Create flash sale
  async createFlashSale(flashSaleData: Omit<FlashSale, 'id' | 'createdAt'>): Promise<FlashSale> {
    try {
      const flashSale: Omit<FlashSale, 'id'> = {
        ...flashSaleData,
        createdAt: new Date()
      }

      const docRef = await addDoc(collection(db, this.FLASH_SALES_COLLECTION), flashSale)
      
      const createdFlashSale = {
        id: docRef.id,
        ...flashSale
      }

      // Schedule notifications
      if (flashSale.isActive && !flashSale.notificationSent) {
        await this.scheduleFlashSaleNotifications(docRef.id)
      }

      // Log flash sale creation
      await auditService.logSystemEvent(
        'flash_sale_created',
        {
          flashSaleId: docRef.id,
          name: flashSale.name,
          productCount: flashSale.products.length
        },
        true
      )

      return createdFlashSale
    } catch (error) {
      throw new Error(`Failed to create flash sale: ${(error as Error).message}`)
    }
  }

  // Get active flash sales
  async getActiveFlashSales(): Promise<FlashSale[]> {
    try {
      const now = new Date()
      const q = query(
        collection(db, this.FLASH_SALES_COLLECTION),
        where('isActive', '==', true),
        where('startDate', '<=', now),
        where('endDate', '>=', now)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FlashSale[]
    } catch (error) {
      throw new Error('Failed to fetch active flash sales')
    }
  }

  // Create loyalty program
  async createLoyaltyProgram(programData: Omit<LoyaltyProgram, 'id' | 'createdAt'>): Promise<LoyaltyProgram> {
    try {
      const program: Omit<LoyaltyProgram, 'id'> = {
        ...programData,
        createdAt: new Date()
      }

      const docRef = await addDoc(collection(db, this.LOYALTY_PROGRAMS_COLLECTION), program)
      
      const createdProgram = {
        id: docRef.id,
        ...program
      }

      // Log loyalty program creation
      await auditService.logSystemEvent(
        'loyalty_program_created',
        {
          programId: docRef.id,
          name: program.name,
          pointsPerDollar: program.pointsPerDollar
        },
        true
      )

      return createdProgram
    } catch (error) {
      throw new Error(`Failed to create loyalty program: ${(error as Error).message}`)
    }
  }

  // Award loyalty points
  async awardLoyaltyPoints(
    userId: string,
    points: number,
    reason: string,
    orderId?: string
  ): Promise<void> {
    try {
      const loyaltyRef = doc(db, this.CUSTOMER_LOYALTY_COLLECTION, userId)
      const loyaltyDoc = await getDoc(loyaltyRef)
      
      let customerLoyalty: CustomerLoyalty
      
      if (loyaltyDoc.exists()) {
        customerLoyalty = loyaltyDoc.data() as CustomerLoyalty
      } else {
        customerLoyalty = {
          userId,
          totalPoints: 0,
          availablePoints: 0,
          currentTier: 'bronze',
          totalSpent: 0,
          joinDate: new Date(),
          lastActivity: new Date()
        }
      }

      // Update points
      customerLoyalty.totalPoints += points
      customerLoyalty.availablePoints += points
      customerLoyalty.lastActivity = new Date()

      // Check for tier upgrade
      const newTier = await this.calculateLoyaltyTier(customerLoyalty.totalPoints)
      customerLoyalty.currentTier = newTier

      await setDoc(loyaltyRef, customerLoyalty)

      // Log points award
      await auditService.logSystemEvent(
        'loyalty_points_awarded',
        {
          userId,
          points,
          reason,
          orderId,
          newTotal: customerLoyalty.totalPoints
        },
        true
      )
    } catch (error) {
      throw new Error(`Failed to award loyalty points: ${(error as Error).message}`)
    }
  }

  // Redeem loyalty points
  async redeemLoyaltyPoints(
    userId: string,
    points: number,
    reason: string
  ): Promise<boolean> {
    try {
      const loyaltyRef = doc(db, this.CUSTOMER_LOYALTY_COLLECTION, userId)
      const loyaltyDoc = await getDoc(loyaltyRef)
      
      if (!loyaltyDoc.exists()) {
        return false
      }

      const customerLoyalty = loyaltyDoc.data() as CustomerLoyalty
      
      if (customerLoyalty.availablePoints < points) {
        return false
      }

      // Deduct points
      customerLoyalty.availablePoints -= points
      customerLoyalty.lastActivity = new Date()

      await setDoc(loyaltyRef, customerLoyalty)

      // Log points redemption
      await auditService.logSystemEvent(
        'loyalty_points_redeemed',
        {
          userId,
          points,
          reason,
          remainingPoints: customerLoyalty.availablePoints
        },
        true
      )

      return true
    } catch (error) {
      throw new Error(`Failed to redeem loyalty points: ${(error as Error).message}`)
    }
  }

  // Get promotion analytics
  async getPromotionAnalytics(startDate?: Date, endDate?: Date): Promise<{
    totalPromotions: number
    activePromotions: number
    totalUsage: number
    totalDiscountGiven: number
    topPromotions: { id: string; name: string; usage: number; discount: number }[]
    conversionRate: number
  }> {
    try {
      // Get promotions
      let promotionsQuery = query(collection(db, this.PROMOTIONS_COLLECTION))
      const promotionsSnapshot = await getDocs(promotionsQuery)
      const promotions = promotionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Promotion[]

      const totalPromotions = promotions.length
      const activePromotions = promotions.filter(p => p.isActive).length

      // Get usage data
      let usageQuery = query(collection(db, this.USAGE_COLLECTION))
      
      if (startDate) {
        usageQuery = query(usageQuery, where('usedAt', '>=', startDate))
      }
      
      if (endDate) {
        usageQuery = query(usageQuery, where('usedAt', '<=', endDate))
      }

      const usageSnapshot = await getDocs(usageQuery)
      const usageData = usageSnapshot.docs.map(doc => doc.data()) as PromotionUsage[]

      const totalUsage = usageData.length
      const totalDiscountGiven = usageData.reduce((sum, usage) => sum + usage.discountAmount, 0)

      // Calculate top promotions
      const promotionStats: Record<string, { usage: number; discount: number }> = {}
      usageData.forEach(usage => {
        if (!promotionStats[usage.promotionId]) {
          promotionStats[usage.promotionId] = { usage: 0, discount: 0 }
        }
        promotionStats[usage.promotionId].usage++
        promotionStats[usage.promotionId].discount += usage.discountAmount
      })

      const topPromotions = Object.entries(promotionStats)
        .map(([id, stats]) => {
          const promotion = promotions.find(p => p.id === id)
          return {
            id,
            name: promotion?.name || 'Unknown',
            usage: stats.usage,
            discount: stats.discount
          }
        })
        .sort((a, b) => b.usage - a.usage)
        .slice(0, 10)

      // Simple conversion rate calculation
      const conversionRate = totalPromotions > 0 ? (totalUsage / totalPromotions) * 100 : 0

      return {
        totalPromotions,
        activePromotions,
        totalUsage,
        totalDiscountGiven,
        topPromotions,
        conversionRate
      }
    } catch (error) {
      throw new Error('Failed to get promotion analytics')
    }
  }

  // Private helper methods
  private async getPromotion(promotionId: string): Promise<Promotion | null> {
    try {
      const promotionDoc = await getDoc(doc(db, this.PROMOTIONS_COLLECTION, promotionId))
      
      if (!promotionDoc.exists()) {
        return null
      }

      return {
        id: promotionDoc.id,
        ...promotionDoc.data()
      } as Promotion
    } catch (error) {
      return null
    }
  }

  private async getUserPromotionUsage(userId: string, promotionId: string): Promise<number> {
    try {
      const q = query(
        collection(db, this.USAGE_COLLECTION),
        where('userId', '==', userId),
        where('promotionId', '==', promotionId)
      )
      
      const snapshot = await getDocs(q)
      return snapshot.size
    } catch (error) {
      return 0
    }
  }

  private async createCouponCode(codeData: Omit<CouponCode, 'id' | 'createdAt'>): Promise<CouponCode> {
    const code: Omit<CouponCode, 'id'> = {
      ...codeData,
      createdAt: new Date()
    }

    const docRef = await addDoc(collection(db, this.COUPONS_COLLECTION), code)
    
    return {
      id: docRef.id,
      ...code
    }
  }

  private async validateCouponCode(code: string, promotionId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, this.COUPONS_COLLECTION),
        where('code', '==', code),
        where('promotionId', '==', promotionId),
        where('isActive', '==', true)
      )
      
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) {
        return false
      }

      const coupon = snapshot.docs[0].data() as CouponCode
      
      // Check expiration
      if (coupon.expirationDate && coupon.expirationDate < new Date()) {
        return false
      }

      // Check usage limit
      if (coupon.usageCount >= coupon.usageLimit) {
        return false
      }

      return true
    } catch (error) {
      return false
    }
  }

  private async checkPromotionConditions(
    promotion: Promotion,
    orderData: any,
    userId: string
  ): Promise<{ valid: boolean; reason?: string }> {
    const conditions = promotion.conditions

    // Check minimum order value
    if (conditions.minimumOrderValue && orderData.subtotal < conditions.minimumOrderValue) {
      return { valid: false, reason: `Minimum order value of $${conditions.minimumOrderValue} required` }
    }

    // Check maximum order value
    if (conditions.maximumOrderValue && orderData.subtotal > conditions.maximumOrderValue) {
      return { valid: false, reason: `Order value exceeds maximum of $${conditions.maximumOrderValue}` }
    }

    // Check minimum quantity
    if (conditions.minimumQuantity) {
      const totalQuantity = orderData.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
      if (totalQuantity < conditions.minimumQuantity) {
        return { valid: false, reason: `Minimum quantity of ${conditions.minimumQuantity} required` }
      }
    }

    // Additional condition checks would go here...

    return { valid: true }
  }

  private calculateDiscount(promotion: Promotion, orderData: any): number {
    switch (promotion.discountType) {
      case 'percentage':
        return (orderData.subtotal * promotion.discountValue) / 100
      
      case 'fixed_amount':
        return Math.min(promotion.discountValue, orderData.subtotal)
      
      case 'buy_x_get_y':
        // Simplified BOGO calculation
        return 0 // Would implement specific BOGO logic
      
      default:
        return 0
    }
  }

  private async calculateLoyaltyTier(totalPoints: number): Promise<string> {
    // Simple tier calculation - would be more sophisticated in practice
    if (totalPoints >= 10000) return 'platinum'
    if (totalPoints >= 5000) return 'gold'
    if (totalPoints >= 1000) return 'silver'
    return 'bronze'
  }

  private async scheduleFlashSaleNotifications(flashSaleId: string): Promise<void> {
    try {
      // Would implement notification scheduling logic
      await emailService.sendFlashSaleNotification(flashSaleId)
    } catch (error) {
      // Log error but don't throw
      await auditService.logSystemEvent(
        'flash_sale_notification_failed',
        {
          flashSaleId,
          error: (error as Error).message
        },
        false
      )
    }
  }
}

export const promotionsService = new PromotionsService()
