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

export interface LoyaltyProgram {
  id: string
  name: string
  description: string
  type: ProgramType
  pointsPerDollar: number
  redemptionRate: number // points per dollar value
  tiers: LoyaltyTier[]
  bonusEvents: BonusEvent[]
  rewards: LoyaltyReward[]
  rules: ProgramRule[]
  isActive: boolean
  startDate: Date
  endDate?: Date
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export type ProgramType = 'points' | 'cashback' | 'tiered' | 'hybrid'

export interface LoyaltyTier {
  id: string
  name: string
  minimumPoints: number
  minimumSpent?: number
  benefits: TierBenefit[]
  pointsMultiplier: number
  color: string
  icon?: string
  description: string
}

export interface TierBenefit {
  type: 'discount' | 'free_shipping' | 'early_access' | 'exclusive_products' | 'birthday_bonus' | 'custom'
  value: number
  description: string
  isActive: boolean
}

export interface BonusEvent {
  id: string
  name: string
  description: string
  multiplier: number
  categories?: string[]
  products?: string[]
  startDate: Date
  endDate: Date
  isActive: boolean
  conditions?: EventCondition[]
}

export interface EventCondition {
  type: 'minimum_purchase' | 'first_time_buyer' | 'specific_day' | 'payment_method'
  value: any
  description: string
}

export interface LoyaltyReward {
  id: string
  name: string
  description: string
  type: RewardType
  pointsCost: number
  value: number
  category: string
  isActive: boolean
  stockQuantity?: number
  usedQuantity: number
  expirationDate?: Date
  conditions?: RewardCondition[]
  imageUrl?: string
}

export type RewardType = 
  | 'discount_percentage'
  | 'discount_fixed'
  | 'free_product'
  | 'free_shipping'
  | 'cashback'
  | 'gift_card'
  | 'experience'

export interface RewardCondition {
  type: 'minimum_tier' | 'minimum_purchase' | 'category_restriction' | 'one_time_use'
  value: any
  description: string
}

export interface ProgramRule {
  id: string
  name: string
  description: string
  type: 'earning' | 'redemption' | 'expiration' | 'transfer'
  condition: string
  action: string
  isActive: boolean
}

export interface CustomerLoyalty {
  userId: string
  programId: string
  totalPoints: number
  availablePoints: number
  lifetimePoints: number
  currentTier: string
  nextTier?: string
  pointsToNextTier: number
  totalSpent: number
  totalSaved: number
  joinDate: Date
  lastActivity: Date
  lastTierUpdate: Date
  isActive: boolean
  preferences: LoyaltyPreferences
}

export interface LoyaltyPreferences {
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  preferredRewardTypes: RewardType[]
  autoRedeem: boolean
  autoRedeemThreshold?: number
}

export interface PointsTransaction {
  id: string
  userId: string
  programId: string
  type: TransactionType
  points: number
  description: string
  reference?: string
  orderId?: string
  rewardId?: string
  expirationDate?: Date
  createdAt: Date
}

export type TransactionType = 
  | 'earned_purchase'
  | 'earned_bonus'
  | 'earned_referral'
  | 'earned_review'
  | 'earned_birthday'
  | 'redeemed_reward'
  | 'expired'
  | 'adjusted'
  | 'transferred'

export interface RewardRedemption {
  id: string
  userId: string
  rewardId: string
  pointsUsed: number
  status: RedemptionStatus
  orderId?: string
  redemptionCode?: string
  expirationDate?: Date
  usedAt?: Date
  createdAt: Date
}

export type RedemptionStatus = 'pending' | 'active' | 'used' | 'expired' | 'cancelled'

export interface ReferralProgram {
  id: string
  name: string
  description: string
  referrerReward: number
  refereeReward: number
  isActive: boolean
  conditions: ReferralCondition[]
  createdAt: Date
}

export interface ReferralCondition {
  type: 'minimum_purchase' | 'time_limit' | 'first_purchase_only'
  value: any
  description: string
}

export interface Referral {
  id: string
  referrerId: string
  refereeId: string
  refereeEmail: string
  status: 'pending' | 'completed' | 'expired'
  referrerRewardGiven: boolean
  refereeRewardGiven: boolean
  completedAt?: Date
  createdAt: Date
}

export class LoyaltyProgramsService {
  private readonly PROGRAMS_COLLECTION = 'loyalty_programs'
  private readonly CUSTOMER_LOYALTY_COLLECTION = 'customer_loyalty'
  private readonly POINTS_TRANSACTIONS_COLLECTION = 'points_transactions'
  private readonly REWARD_REDEMPTIONS_COLLECTION = 'reward_redemptions'
  private readonly REFERRALS_COLLECTION = 'referrals'
  private readonly REFERRAL_PROGRAMS_COLLECTION = 'referral_programs'

  // Create loyalty program
  async createLoyaltyProgram(programData: Omit<LoyaltyProgram, 'id' | 'createdAt' | 'updatedAt'>): Promise<LoyaltyProgram> {
    try {
      const program: Omit<LoyaltyProgram, 'id'> = {
        ...programData,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const docRef = await addDoc(collection(db, this.PROGRAMS_COLLECTION), program)
      
      const createdProgram = {
        id: docRef.id,
        ...program
      }

      // Log program creation
      await auditService.logSystemEvent(
        'loyalty_program_created',
        {
          programId: docRef.id,
          name: program.name,
          type: program.type,
          createdBy: program.createdBy
        },
        true
      )

      return createdProgram
    } catch (error) {
      throw new Error(`Failed to create loyalty program: ${(error as Error).message}`)
    }
  }

  // Enroll customer in loyalty program
  async enrollCustomer(
    userId: string,
    programId: string,
    preferences?: Partial<LoyaltyPreferences>
  ): Promise<CustomerLoyalty> {
    try {
      const program = await this.getLoyaltyProgram(programId)
      if (!program || !program.isActive) {
        throw new Error('Loyalty program not found or inactive')
      }

      const defaultPreferences: LoyaltyPreferences = {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        preferredRewardTypes: ['discount_percentage', 'free_shipping'],
        autoRedeem: false,
        ...preferences
      }

      const customerLoyalty: CustomerLoyalty = {
        userId,
        programId,
        totalPoints: 0,
        availablePoints: 0,
        lifetimePoints: 0,
        currentTier: program.tiers[0]?.name || 'bronze',
        pointsToNextTier: program.tiers[1]?.minimumPoints || 1000,
        totalSpent: 0,
        totalSaved: 0,
        joinDate: new Date(),
        lastActivity: new Date(),
        lastTierUpdate: new Date(),
        isActive: true,
        preferences: defaultPreferences
      }

      await setDoc(doc(db, this.CUSTOMER_LOYALTY_COLLECTION, `${userId}_${programId}`), customerLoyalty)

      // Award welcome bonus if applicable
      await this.awardWelcomeBonus(userId, programId)

      // Log enrollment
      await auditService.logSystemEvent(
        'customer_enrolled_loyalty',
        {
          userId,
          programId,
          tier: customerLoyalty.currentTier
        },
        true
      )

      // Send welcome email
      await this.sendWelcomeEmail(userId, program)

      return customerLoyalty
    } catch (error) {
      throw new Error(`Failed to enroll customer: ${(error as Error).message}`)
    }
  }

  // Award points for purchase
  async awardPointsForPurchase(
    userId: string,
    programId: string,
    orderValue: number,
    orderId: string,
    categoryMultipliers?: Record<string, number>
  ): Promise<number> {
    try {
      const program = await this.getLoyaltyProgram(programId)
      if (!program) {
        throw new Error('Loyalty program not found')
      }

      const customerLoyalty = await this.getCustomerLoyalty(userId, programId)
      if (!customerLoyalty) {
        throw new Error('Customer not enrolled in loyalty program')
      }

      // Calculate base points
      let basePoints = Math.floor(orderValue * program.pointsPerDollar)

      // Apply tier multiplier
      const currentTier = program.tiers.find(tier => tier.name === customerLoyalty.currentTier)
      if (currentTier) {
        basePoints = Math.floor(basePoints * currentTier.pointsMultiplier)
      }

      // Apply bonus event multipliers
      const activeEvents = await this.getActiveBonusEvents(programId)
      let eventMultiplier = 1
      for (const event of activeEvents) {
        if (await this.checkEventConditions(event, { orderValue, userId })) {
          eventMultiplier = Math.max(eventMultiplier, event.multiplier)
        }
      }
      
      const totalPoints = Math.floor(basePoints * eventMultiplier)

      // Award points
      await this.awardPoints(
        userId,
        programId,
        totalPoints,
        'earned_purchase',
        `Points earned from order #${orderId}`,
        orderId
      )

      return totalPoints
    } catch (error) {
      throw new Error(`Failed to award points for purchase: ${(error as Error).message}`)
    }
  }

  // Award points
  async awardPoints(
    userId: string,
    programId: string,
    points: number,
    type: TransactionType,
    description: string,
    reference?: string,
    expirationDate?: Date
  ): Promise<void> {
    try {
      const batch = writeBatch(db)

      // Create points transaction
      const transactionRef = doc(collection(db, this.POINTS_TRANSACTIONS_COLLECTION))
      const transaction: Omit<PointsTransaction, 'id'> = {
        userId,
        programId,
        type,
        points,
        description,
        reference,
        expirationDate,
        createdAt: new Date()
      }
      batch.set(transactionRef, transaction)

      // Update customer loyalty
      const loyaltyRef = doc(db, this.CUSTOMER_LOYALTY_COLLECTION, `${userId}_${programId}`)
      const loyaltyDoc = await getDoc(loyaltyRef)
      
      if (loyaltyDoc.exists()) {
        const customerLoyalty = loyaltyDoc.data() as CustomerLoyalty
        const updatedLoyalty = {
          ...customerLoyalty,
          totalPoints: customerLoyalty.totalPoints + points,
          availablePoints: customerLoyalty.availablePoints + points,
          lifetimePoints: customerLoyalty.lifetimePoints + points,
          lastActivity: new Date()
        }

        // Check for tier upgrade
        const newTier = await this.checkTierUpgrade(userId, programId, updatedLoyalty.totalPoints)
        if (newTier && newTier !== customerLoyalty.currentTier) {
          updatedLoyalty.currentTier = newTier
          updatedLoyalty.lastTierUpdate = new Date()
          
          // Calculate points to next tier
          const program = await this.getLoyaltyProgram(programId)
          if (program) {
            const nextTierIndex = program.tiers.findIndex(t => t.name === newTier) + 1
            if (nextTierIndex < program.tiers.length) {
              updatedLoyalty.nextTier = program.tiers[nextTierIndex].name
              updatedLoyalty.pointsToNextTier = program.tiers[nextTierIndex].minimumPoints - updatedLoyalty.totalPoints
            }
          }

          // Send tier upgrade notification
          await this.sendTierUpgradeNotification(userId, newTier)
        }

        batch.update(loyaltyRef, updatedLoyalty)
      }

      await batch.commit()

      // Log points award
      await auditService.logSystemEvent(
        'loyalty_points_awarded',
        {
          userId,
          programId,
          points,
          type,
          reference,
          newTotal: (loyaltyDoc.data() as CustomerLoyalty)?.totalPoints + points
        },
        true
      )
    } catch (error) {
      throw new Error(`Failed to award points: ${(error as Error).message}`)
    }
  }

  // Redeem reward
  async redeemReward(
    userId: string,
    rewardId: string,
    orderId?: string
  ): Promise<RewardRedemption> {
    try {
      const reward = await this.getLoyaltyReward(rewardId)
      if (!reward) {
        throw new Error('Reward not found')
      }

      if (!reward.isActive) {
        throw new Error('Reward is not active')
      }

      // Check stock if applicable
      if (reward.stockQuantity !== undefined && reward.usedQuantity >= reward.stockQuantity) {
        throw new Error('Reward is out of stock')
      }

      // Get customer loyalty
      const customerLoyalty = await this.getCustomerLoyalty(userId, reward.id) // Assuming reward has programId
      if (!customerLoyalty) {
        throw new Error('Customer not enrolled in loyalty program')
      }

      // Check if customer has enough points
      if (customerLoyalty.availablePoints < reward.pointsCost) {
        throw new Error('Insufficient points for redemption')
      }

      // Check reward conditions
      const conditionsValid = await this.checkRewardConditions(reward, customerLoyalty)
      if (!conditionsValid.valid) {
        throw new Error(conditionsValid.reason || 'Reward conditions not met')
      }

      const batch = writeBatch(db)

      // Create redemption record
      const redemptionRef = doc(collection(db, this.REWARD_REDEMPTIONS_COLLECTION))
      const redemption: Omit<RewardRedemption, 'id'> = {
        userId,
        rewardId,
        pointsUsed: reward.pointsCost,
        status: 'active',
        orderId,
        redemptionCode: this.generateRedemptionCode(),
        expirationDate: reward.expirationDate,
        createdAt: new Date()
      }
      batch.set(redemptionRef, redemption)

      // Deduct points
      const loyaltyRef = doc(db, this.CUSTOMER_LOYALTY_COLLECTION, `${userId}_${customerLoyalty.programId}`)
      batch.update(loyaltyRef, {
        availablePoints: customerLoyalty.availablePoints - reward.pointsCost,
        totalSaved: customerLoyalty.totalSaved + reward.value,
        lastActivity: new Date()
      })

      // Create points transaction
      const transactionRef = doc(collection(db, this.POINTS_TRANSACTIONS_COLLECTION))
      const transaction: Omit<PointsTransaction, 'id'> = {
        userId,
        programId: customerLoyalty.programId,
        type: 'redeemed_reward',
        points: -reward.pointsCost,
        description: `Redeemed: ${reward.name}`,
        rewardId,
        createdAt: new Date()
      }
      batch.set(transactionRef, transaction)

      // Update reward usage
      const rewardRef = doc(db, 'loyalty_rewards', rewardId) // Assuming rewards collection
      batch.update(rewardRef, {
        usedQuantity: reward.usedQuantity + 1
      })

      await batch.commit()

      const createdRedemption = {
        id: redemptionRef.id,
        ...redemption
      }

      // Log redemption
      await auditService.logSystemEvent(
        'reward_redeemed',
        {
          userId,
          rewardId,
          pointsUsed: reward.pointsCost,
          redemptionId: redemptionRef.id
        },
        true
      )

      // Send redemption confirmation
      await this.sendRedemptionConfirmation(userId, reward, createdRedemption)

      return createdRedemption
    } catch (error) {
      throw new Error(`Failed to redeem reward: ${(error as Error).message}`)
    }
  }

  // Create referral
  async createReferral(
    referrerId: string,
    refereeEmail: string,
    programId?: string
  ): Promise<Referral> {
    try {
      const referral: Omit<Referral, 'id'> = {
        referrerId,
        refereeId: '', // Will be set when referee signs up
        refereeEmail,
        status: 'pending',
        referrerRewardGiven: false,
        refereeRewardGiven: false,
        createdAt: new Date()
      }

      const docRef = await addDoc(collection(db, this.REFERRALS_COLLECTION), referral)
      
      const createdReferral = {
        id: docRef.id,
        ...referral
      }

      // Send referral invitation email
      await this.sendReferralInvitation(referrerId, refereeEmail, docRef.id)

      // Log referral creation
      await auditService.logSystemEvent(
        'referral_created',
        {
          referralId: docRef.id,
          referrerId,
          refereeEmail
        },
        true
      )

      return createdReferral
    } catch (error) {
      throw new Error(`Failed to create referral: ${(error as Error).message}`)
    }
  }

  // Process referral completion
  async processReferralCompletion(referralId: string, refereeId: string): Promise<void> {
    try {
      const referralRef = doc(db, this.REFERRALS_COLLECTION, referralId)
      const referralDoc = await getDoc(referralRef)
      
      if (!referralDoc.exists()) {
        throw new Error('Referral not found')
      }

      const referral = referralDoc.data() as Referral
      
      if (referral.status !== 'pending') {
        throw new Error('Referral already processed')
      }

      const batch = writeBatch(db)

      // Update referral status
      batch.update(referralRef, {
        refereeId,
        status: 'completed',
        completedAt: new Date()
      })

      // Get active referral program
      const referralPrograms = await this.getActiveReferralPrograms()
      if (referralPrograms.length > 0) {
        const program = referralPrograms[0]

        // Award points to referrer
        await this.awardPoints(
          referral.referrerId,
          'default', // Assuming default program
          program.referrerReward,
          'earned_referral',
          `Referral bonus for inviting ${referral.refereeEmail}`,
          referralId
        )

        // Award points to referee
        await this.awardPoints(
          refereeId,
          'default',
          program.refereeReward,
          'earned_referral',
          'Welcome referral bonus',
          referralId
        )

        // Update referral rewards status
        batch.update(referralRef, {
          referrerRewardGiven: true,
          refereeRewardGiven: true
        })
      }

      await batch.commit()

      // Log referral completion
      await auditService.logSystemEvent(
        'referral_completed',
        {
          referralId,
          referrerId: referral.referrerId,
          refereeId
        },
        true
      )
    } catch (error) {
      throw new Error(`Failed to process referral completion: ${(error as Error).message}`)
    }
  }

  // Get customer loyalty status
  async getCustomerLoyalty(userId: string, programId: string): Promise<CustomerLoyalty | null> {
    try {
      const loyaltyDoc = await getDoc(doc(db, this.CUSTOMER_LOYALTY_COLLECTION, `${userId}_${programId}`))
      
      if (!loyaltyDoc.exists()) {
        return null
      }

      return loyaltyDoc.data() as CustomerLoyalty
    } catch (error) {
      throw new Error('Failed to fetch customer loyalty')
    }
  }

  // Get loyalty program
  async getLoyaltyProgram(programId: string): Promise<LoyaltyProgram | null> {
    try {
      const programDoc = await getDoc(doc(db, this.PROGRAMS_COLLECTION, programId))
      
      if (!programDoc.exists()) {
        return null
      }

      return {
        id: programDoc.id,
        ...programDoc.data()
      } as LoyaltyProgram
    } catch (error) {
      throw new Error('Failed to fetch loyalty program')
    }
  }

  // Get points history
  async getPointsHistory(
    userId: string,
    programId: string,
    limitCount: number = 50
  ): Promise<PointsTransaction[]> {
    try {
      const q = query(
        collection(db, this.POINTS_TRANSACTIONS_COLLECTION),
        where('userId', '==', userId),
        where('programId', '==', programId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PointsTransaction[]
    } catch (error) {
      throw new Error('Failed to fetch points history')
    }
  }

  // Get loyalty analytics
  async getLoyaltyAnalytics(programId?: string): Promise<{
    totalMembers: number
    activeMembers: number
    totalPointsIssued: number
    totalPointsRedeemed: number
    averagePointsPerMember: number
    tierDistribution: { tier: string; count: number }[]
    topRewards: { rewardId: string; name: string; redemptions: number }[]
    membershipGrowth: { month: string; newMembers: number }[]
  }> {
    try {
      let loyaltyQuery = query(collection(db, this.CUSTOMER_LOYALTY_COLLECTION))
      if (programId) {
        loyaltyQuery = query(loyaltyQuery, where('programId', '==', programId))
      }

      const loyaltySnapshot = await getDocs(loyaltyQuery)
      const members = loyaltySnapshot.docs.map(doc => doc.data()) as CustomerLoyalty[]

      const totalMembers = members.length
      const activeMembers = members.filter(m => m.isActive).length
      const totalPointsIssued = members.reduce((sum, m) => sum + m.lifetimePoints, 0)
      const totalPointsRedeemed = totalPointsIssued - members.reduce((sum, m) => sum + m.availablePoints, 0)
      const averagePointsPerMember = totalMembers > 0 ? totalPointsIssued / totalMembers : 0

      // Tier distribution
      const tierCount: Record<string, number> = {}
      members.forEach(member => {
        tierCount[member.currentTier] = (tierCount[member.currentTier] || 0) + 1
      })
      const tierDistribution = Object.entries(tierCount)
        .map(([tier, count]) => ({ tier, count }))

      // Top rewards (simplified)
      const topRewards = [
        { rewardId: '1', name: '10% Discount', redemptions: 150 },
        { rewardId: '2', name: 'Free Shipping', redemptions: 120 },
        { rewardId: '3', name: '$5 Off', redemptions: 100 }
      ]

      // Membership growth (simplified)
      const membershipGrowth = [
        { month: '2024-01', newMembers: 45 },
        { month: '2024-02', newMembers: 52 },
        { month: '2024-03', newMembers: 38 }
      ]

      return {
        totalMembers,
        activeMembers,
        totalPointsIssued,
        totalPointsRedeemed,
        averagePointsPerMember,
        tierDistribution,
        topRewards,
        membershipGrowth
      }
    } catch (error) {
      throw new Error('Failed to get loyalty analytics')
    }
  }

  // Private helper methods
  private async getLoyaltyReward(rewardId: string): Promise<LoyaltyReward | null> {
    // Implementation would fetch from rewards collection
    return null // Placeholder
  }

  private async getActiveBonusEvents(programId: string): Promise<BonusEvent[]> {
    const now = new Date()
    // Implementation would fetch active bonus events
    return [] // Placeholder
  }

  private async getActiveReferralPrograms(): Promise<ReferralProgram[]> {
    try {
      const q = query(
        collection(db, this.REFERRAL_PROGRAMS_COLLECTION),
        where('isActive', '==', true)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ReferralProgram[]
    } catch (error) {
      return []
    }
  }

  private async checkEventConditions(event: BonusEvent, context: any): Promise<boolean> {
    // Implementation would check event conditions
    return true // Placeholder
  }

  private async checkTierUpgrade(userId: string, programId: string, totalPoints: number): Promise<string | null> {
    const program = await this.getLoyaltyProgram(programId)
    if (!program) return null

    // Find the highest tier the customer qualifies for
    const qualifyingTiers = program.tiers
      .filter(tier => totalPoints >= tier.minimumPoints)
      .sort((a, b) => b.minimumPoints - a.minimumPoints)

    return qualifyingTiers.length > 0 ? qualifyingTiers[0].name : null
  }

  private async checkRewardConditions(reward: LoyaltyReward, customerLoyalty: CustomerLoyalty): Promise<{ valid: boolean; reason?: string }> {
    // Implementation would check reward conditions
    return { valid: true }
  }

  private generateRedemptionCode(): string {
    return `RDM-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  }

  private async awardWelcomeBonus(userId: string, programId: string): Promise<void> {
    // Implementation would award welcome bonus points
    await this.awardPoints(
      userId,
      programId,
      100,
      'earned_bonus',
      'Welcome bonus for joining loyalty program'
    )
  }

  private async sendWelcomeEmail(userId: string, program: LoyaltyProgram): Promise<void> {
    try {
      await emailService.sendLoyaltyWelcome(userId, program)
    } catch (error) {
      // Log error but don't throw
      await auditService.logSystemEvent(
        'loyalty_welcome_email_failed',
        {
          userId,
          programId: program.id,
          error: (error as Error).message
        },
        false
      )
    }
  }

  private async sendTierUpgradeNotification(userId: string, newTier: string): Promise<void> {
    try {
      await emailService.sendTierUpgradeNotification(userId, newTier)
    } catch (error) {
      // Log error but don't throw
      await auditService.logSystemEvent(
        'tier_upgrade_notification_failed',
        {
          userId,
          newTier,
          error: (error as Error).message
        },
        false
      )
    }
  }

  private async sendRedemptionConfirmation(userId: string, reward: LoyaltyReward, redemption: RewardRedemption): Promise<void> {
    try {
      await emailService.sendRedemptionConfirmation(userId, reward, redemption)
    } catch (error) {
      // Log error but don't throw
      await auditService.logSystemEvent(
        'redemption_confirmation_failed',
        {
          userId,
          rewardId: reward.id,
          redemptionId: redemption.id,
          error: (error as Error).message
        },
        false
      )
    }
  }

  private async sendReferralInvitation(referrerId: string, refereeEmail: string, referralId: string): Promise<void> {
    try {
      await emailService.sendReferralInvitation(referrerId, refereeEmail, referralId)
    } catch (error) {
      // Log error but don't throw
      await auditService.logSystemEvent(
        'referral_invitation_failed',
        {
          referrerId,
          refereeEmail,
          referralId,
          error: (error as Error).message
        },
        false
      )
    }
  }
}

export const loyaltyProgramsService = new LoyaltyProgramsService()
