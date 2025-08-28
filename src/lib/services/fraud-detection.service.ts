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
  limit
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { auditService } from './audit.service'
import { emailService } from './email.service'

export interface FraudAlert {
  id: string
  userId: string
  orderId?: string
  type: FraudAlertType
  severity: 'low' | 'medium' | 'high' | 'critical'
  score: number
  factors: FraudFactor[]
  status: 'pending' | 'investigating' | 'resolved' | 'false_positive'
  description: string
  metadata: Record<string, any>
  reviewedBy?: string
  reviewedAt?: Date
  resolution?: string
  createdAt: Date
  updatedAt: Date
}

export type FraudAlertType = 
  | 'velocity_check'
  | 'payment_anomaly'
  | 'shipping_mismatch'
  | 'device_fingerprint'
  | 'behavioral_analysis'
  | 'blacklist_match'
  | 'high_risk_location'
  | 'suspicious_pattern'
  | 'card_testing'
  | 'account_takeover'

export interface FraudFactor {
  type: string
  description: string
  weight: number
  value: any
}

export interface RiskProfile {
  userId: string
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  factors: {
    velocityScore: number
    locationScore: number
    deviceScore: number
    behaviorScore: number
    paymentScore: number
  }
  lastUpdated: Date
  orderCount: number
  totalSpent: number
  averageOrderValue: number
  suspiciousActivityCount: number
}

export interface DeviceFingerprint {
  id: string
  userId: string
  fingerprint: string
  userAgent: string
  ipAddress: string
  screenResolution: string
  timezone: string
  language: string
  platform: string
  cookiesEnabled: boolean
  javaEnabled: boolean
  flashEnabled: boolean
  firstSeen: Date
  lastSeen: Date
  trustScore: number
  isBlacklisted: boolean
}

export interface BlacklistEntry {
  id: string
  type: 'email' | 'ip' | 'device' | 'card' | 'phone'
  value: string
  reason: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  addedBy: string
  addedAt: Date
  expiresAt?: Date
  isActive: boolean
}

export class FraudDetectionService {
  private readonly ALERTS_COLLECTION = 'fraud_alerts'
  private readonly PROFILES_COLLECTION = 'risk_profiles'
  private readonly DEVICES_COLLECTION = 'device_fingerprints'
  private readonly BLACKLIST_COLLECTION = 'blacklist_entries'

  // Risk scoring thresholds
  private readonly RISK_THRESHOLDS = {
    low: 30,
    medium: 60,
    high: 80,
    critical: 95
  }

  // Analyze order for fraud risk
  async analyzeOrder(orderData: {
    userId: string
    orderId: string
    amount: number
    paymentMethod: string
    shippingAddress: any
    billingAddress: any
    deviceFingerprint?: any
    ipAddress?: string
    userAgent?: string
  }): Promise<{
    riskScore: number
    riskLevel: string
    alerts: FraudAlert[]
    shouldBlock: boolean
    recommendations: string[]
  }> {
    try {
      const alerts: FraudAlert[] = []
      const factors: FraudFactor[] = []
      let totalRiskScore = 0

      // 1. Velocity Check
      const velocityResult = await this.checkVelocity(orderData.userId, orderData.amount)
      if (velocityResult.isRisky) {
        factors.push(...velocityResult.factors)
        totalRiskScore += velocityResult.score
        
        if (velocityResult.score > 70) {
          alerts.push(await this.createAlert(
            orderData.userId,
            orderData.orderId,
            'velocity_check',
            'high',
            velocityResult.score,
            velocityResult.factors,
            'Suspicious order velocity detected'
          ))
        }
      }

      // 2. Payment Anomaly Detection
      const paymentResult = await this.checkPaymentAnomalies(orderData)
      if (paymentResult.isRisky) {
        factors.push(...paymentResult.factors)
        totalRiskScore += paymentResult.score
        
        if (paymentResult.score > 60) {
          alerts.push(await this.createAlert(
            orderData.userId,
            orderData.orderId,
            'payment_anomaly',
            'medium',
            paymentResult.score,
            paymentResult.factors,
            'Payment anomaly detected'
          ))
        }
      }

      // 3. Address Verification
      const addressResult = await this.checkAddressMismatch(orderData.shippingAddress, orderData.billingAddress)
      if (addressResult.isRisky) {
        factors.push(...addressResult.factors)
        totalRiskScore += addressResult.score
        
        if (addressResult.score > 50) {
          alerts.push(await this.createAlert(
            orderData.userId,
            orderData.orderId,
            'shipping_mismatch',
            'medium',
            addressResult.score,
            addressResult.factors,
            'Shipping and billing address mismatch'
          ))
        }
      }

      // 4. Device Fingerprinting
      if (orderData.deviceFingerprint) {
        const deviceResult = await this.analyzeDeviceFingerprint(orderData.userId, orderData.deviceFingerprint)
        if (deviceResult.isRisky) {
          factors.push(...deviceResult.factors)
          totalRiskScore += deviceResult.score
          
          if (deviceResult.score > 80) {
            alerts.push(await this.createAlert(
              orderData.userId,
              orderData.orderId,
              'device_fingerprint',
              'high',
              deviceResult.score,
              deviceResult.factors,
              'Suspicious device fingerprint detected'
            ))
          }
        }
      }

      // 5. Blacklist Check
      const blacklistResult = await this.checkBlacklist(orderData)
      if (blacklistResult.isRisky) {
        factors.push(...blacklistResult.factors)
        totalRiskScore += blacklistResult.score
        
        alerts.push(await this.createAlert(
          orderData.userId,
          orderData.orderId,
          'blacklist_match',
          'critical',
          blacklistResult.score,
          blacklistResult.factors,
          'Blacklist match detected'
        ))
      }

      // 6. Behavioral Analysis
      const behaviorResult = await this.analyzeBehavior(orderData.userId)
      if (behaviorResult.isRisky) {
        factors.push(...behaviorResult.factors)
        totalRiskScore += behaviorResult.score
      }

      // Calculate final risk score (weighted average)
      const finalRiskScore = Math.min(100, totalRiskScore / factors.length || 0)
      
      // Determine risk level
      let riskLevel = 'low'
      if (finalRiskScore >= this.RISK_THRESHOLDS.critical) riskLevel = 'critical'
      else if (finalRiskScore >= this.RISK_THRESHOLDS.high) riskLevel = 'high'
      else if (finalRiskScore >= this.RISK_THRESHOLDS.medium) riskLevel = 'medium'

      // Update user risk profile
      await this.updateRiskProfile(orderData.userId, finalRiskScore, factors)

      // Generate recommendations
      const recommendations = this.generateRecommendations(finalRiskScore, factors)
      
      // Determine if order should be blocked
      const shouldBlock = finalRiskScore >= this.RISK_THRESHOLDS.critical || 
                         alerts.some(alert => alert.severity === 'critical')

      // Log fraud analysis
      await auditService.logSystemEvent(
        'fraud_analysis_completed',
        {
          userId: orderData.userId,
          orderId: orderData.orderId,
          riskScore: finalRiskScore,
          riskLevel,
          alertCount: alerts.length,
          shouldBlock
        },
        true
      )

      return {
        riskScore: finalRiskScore,
        riskLevel,
        alerts,
        shouldBlock,
        recommendations
      }
    } catch (error) {
      throw new Error(`Fraud analysis failed: ${(error as Error).message}`)
    }
  }

  // Check velocity (frequency and amount patterns)
  private async checkVelocity(userId: string, amount: number): Promise<{
    isRisky: boolean
    score: number
    factors: FraudFactor[]
  }> {
    try {
      const factors: FraudFactor[] = []
      let score = 0

      // Check orders in last 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const { orderService } = await import('./order.service')
      
      // Get recent orders (mock implementation)
      const recentOrders = [] // Would fetch from orderService
      
      // Check order frequency
      if (recentOrders.length > 5) {
        factors.push({
          type: 'high_frequency',
          description: `${recentOrders.length} orders in 24 hours`,
          weight: 30,
          value: recentOrders.length
        })
        score += 30
      }

      // Check amount patterns
      const totalAmount = recentOrders.reduce((sum: number, order: any) => sum + order.total, 0)
      if (totalAmount > 5000) {
        factors.push({
          type: 'high_amount_velocity',
          description: `$${totalAmount} spent in 24 hours`,
          weight: 40,
          value: totalAmount
        })
        score += 40
      }

      // Check for round number amounts (common in fraud)
      if (amount % 100 === 0 && amount > 500) {
        factors.push({
          type: 'round_amount',
          description: 'Round number amount pattern',
          weight: 15,
          value: amount
        })
        score += 15
      }

      return {
        isRisky: score > 20,
        score,
        factors
      }
    } catch (error) {
      return { isRisky: false, score: 0, factors: [] }
    }
  }

  // Check payment anomalies
  private async checkPaymentAnomalies(orderData: any): Promise<{
    isRisky: boolean
    score: number
    factors: FraudFactor[]
  }> {
    const factors: FraudFactor[] = []
    let score = 0

    // Check for multiple payment attempts
    // This would integrate with payment service to check failed attempts
    
    // Check payment method risk
    if (orderData.paymentMethod === 'credit_card') {
      // Higher risk for credit cards
      score += 10
    }

    // Check for BIN (Bank Identification Number) patterns
    // This would require integration with BIN database
    
    // Check for prepaid cards (higher risk)
    // This would require card type detection

    return {
      isRisky: score > 30,
      score,
      factors
    }
  }

  // Check address mismatch
  private async checkAddressMismatch(shippingAddress: any, billingAddress: any): Promise<{
    isRisky: boolean
    score: number
    factors: FraudFactor[]
  }> {
    const factors: FraudFactor[] = []
    let score = 0

    if (!shippingAddress || !billingAddress) {
      return { isRisky: false, score: 0, factors: [] }
    }

    // Check country mismatch
    if (shippingAddress.country !== billingAddress.country) {
      factors.push({
        type: 'country_mismatch',
        description: 'Shipping and billing countries differ',
        weight: 40,
        value: { shipping: shippingAddress.country, billing: billingAddress.country }
      })
      score += 40
    }

    // Check state/province mismatch
    if (shippingAddress.state !== billingAddress.state) {
      factors.push({
        type: 'state_mismatch',
        description: 'Shipping and billing states differ',
        weight: 20,
        value: { shipping: shippingAddress.state, billing: billingAddress.state }
      })
      score += 20
    }

    // Check for high-risk shipping locations
    const highRiskCountries = ['XX', 'YY'] // Configure based on business needs
    if (highRiskCountries.includes(shippingAddress.country)) {
      factors.push({
        type: 'high_risk_location',
        description: 'Shipping to high-risk location',
        weight: 50,
        value: shippingAddress.country
      })
      score += 50
    }

    return {
      isRisky: score > 30,
      score,
      factors
    }
  }

  // Analyze device fingerprint
  private async analyzeDeviceFingerprint(userId: string, fingerprint: any): Promise<{
    isRisky: boolean
    score: number
    factors: FraudFactor[]
  }> {
    try {
      const factors: FraudFactor[] = []
      let score = 0

      // Check if device is known
      const existingDevice = await this.getDeviceFingerprint(fingerprint.id)
      
      if (!existingDevice) {
        // New device
        await this.saveDeviceFingerprint(userId, fingerprint)
        factors.push({
          type: 'new_device',
          description: 'First time using this device',
          weight: 20,
          value: true
        })
        score += 20
      } else {
        // Check if device is associated with multiple users
        if (existingDevice.userId !== userId) {
          factors.push({
            type: 'device_sharing',
            description: 'Device used by multiple users',
            weight: 60,
            value: { currentUser: userId, deviceUser: existingDevice.userId }
          })
          score += 60
        }

        // Check device trust score
        if (existingDevice.trustScore < 50) {
          factors.push({
            type: 'low_trust_device',
            description: 'Device has low trust score',
            weight: 40,
            value: existingDevice.trustScore
          })
          score += 40
        }

        // Update device last seen
        await this.updateDeviceFingerprint(fingerprint.id, { lastSeen: new Date() })
      }

      return {
        isRisky: score > 40,
        score,
        factors
      }
    } catch (error) {
      return { isRisky: false, score: 0, factors: [] }
    }
  }

  // Check blacklist
  private async checkBlacklist(orderData: any): Promise<{
    isRisky: boolean
    score: number
    factors: FraudFactor[]
  }> {
    try {
      const factors: FraudFactor[] = []
      let score = 0

      // Check email blacklist
      const emailBlacklist = await this.checkBlacklistEntry('email', orderData.userId)
      if (emailBlacklist) {
        factors.push({
          type: 'blacklisted_email',
          description: 'Email address is blacklisted',
          weight: 100,
          value: emailBlacklist.reason
        })
        score = 100 // Critical
      }

      // Check IP blacklist
      if (orderData.ipAddress) {
        const ipBlacklist = await this.checkBlacklistEntry('ip', orderData.ipAddress)
        if (ipBlacklist) {
          factors.push({
            type: 'blacklisted_ip',
            description: 'IP address is blacklisted',
            weight: 80,
            value: ipBlacklist.reason
          })
          score = Math.max(score, 80)
        }
      }

      return {
        isRisky: score > 0,
        score,
        factors
      }
    } catch (error) {
      return { isRisky: false, score: 0, factors: [] }
    }
  }

  // Analyze user behavior patterns
  private async analyzeBehavior(userId: string): Promise<{
    isRisky: boolean
    score: number
    factors: FraudFactor[]
  }> {
    try {
      const factors: FraudFactor[] = []
      let score = 0

      // Get user's historical behavior
      const riskProfile = await this.getRiskProfile(userId)
      
      if (riskProfile) {
        // Check if user has history of suspicious activity
        if (riskProfile.suspiciousActivityCount > 3) {
          factors.push({
            type: 'suspicious_history',
            description: 'User has history of suspicious activity',
            weight: 50,
            value: riskProfile.suspiciousActivityCount
          })
          score += 50
        }

        // Check for unusual order patterns
        // This would analyze order timing, amounts, products, etc.
      }

      return {
        isRisky: score > 30,
        score,
        factors
      }
    } catch (error) {
      return { isRisky: false, score: 0, factors: [] }
    }
  }

  // Create fraud alert
  private async createAlert(
    userId: string,
    orderId: string | undefined,
    type: FraudAlertType,
    severity: 'low' | 'medium' | 'high' | 'critical',
    score: number,
    factors: FraudFactor[],
    description: string
  ): Promise<FraudAlert> {
    const alert: Omit<FraudAlert, 'id'> = {
      userId,
      orderId,
      type,
      severity,
      score,
      factors,
      status: 'pending',
      description,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const docRef = await addDoc(collection(db, this.ALERTS_COLLECTION), alert)
    const newAlert = { id: docRef.id, ...alert }

    // Send notification for high/critical alerts
    if (severity === 'high' || severity === 'critical') {
      await this.notifyFraudTeam(newAlert)
    }

    return newAlert
  }

  // Get risk profile
  async getRiskProfile(userId: string): Promise<RiskProfile | null> {
    try {
      const docRef = doc(db, this.PROFILES_COLLECTION, userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return docSnap.data() as RiskProfile
      }
      
      return null
    } catch (error) {
      return null
    }
  }

  // Update risk profile
  private async updateRiskProfile(userId: string, riskScore: number, factors: FraudFactor[]): Promise<void> {
    try {
      const existing = await this.getRiskProfile(userId)
      
      const profile: RiskProfile = {
        userId,
        riskScore,
        riskLevel: this.calculateRiskLevel(riskScore),
        factors: {
          velocityScore: factors.find(f => f.type.includes('velocity'))?.weight || 0,
          locationScore: factors.find(f => f.type.includes('location'))?.weight || 0,
          deviceScore: factors.find(f => f.type.includes('device'))?.weight || 0,
          behaviorScore: factors.find(f => f.type.includes('behavior'))?.weight || 0,
          paymentScore: factors.find(f => f.type.includes('payment'))?.weight || 0
        },
        lastUpdated: new Date(),
        orderCount: (existing?.orderCount || 0) + 1,
        totalSpent: existing?.totalSpent || 0,
        averageOrderValue: existing?.averageOrderValue || 0,
        suspiciousActivityCount: existing?.suspiciousActivityCount || 0
      }

      await setDoc(doc(db, this.PROFILES_COLLECTION, userId), profile)
    } catch (error) {
      // Log error but don't throw
    }
  }

  // Add to blacklist
  async addToBlacklist(
    type: 'email' | 'ip' | 'device' | 'card' | 'phone',
    value: string,
    reason: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    addedBy: string,
    expiresAt?: Date
  ): Promise<void> {
    try {
      const entry: Omit<BlacklistEntry, 'id'> = {
        type,
        value,
        reason,
        severity,
        addedBy,
        addedAt: new Date(),
        expiresAt,
        isActive: true
      }

      await addDoc(collection(db, this.BLACKLIST_COLLECTION), entry)

      // Log blacklist addition
      await auditService.logSystemEvent(
        'blacklist_entry_added',
        { type, value, reason, severity, addedBy },
        true
      )
    } catch (error) {
      throw new Error(`Failed to add blacklist entry: ${(error as Error).message}`)
    }
  }

  // Check blacklist entry
  private async checkBlacklistEntry(type: string, value: string): Promise<BlacklistEntry | null> {
    try {
      const q = query(
        collection(db, this.BLACKLIST_COLLECTION),
        where('type', '==', type),
        where('value', '==', value),
        where('isActive', '==', true)
      )
      
      const snapshot = await getDocs(q)
      if (!snapshot.empty) {
        const entry = snapshot.docs[0].data() as BlacklistEntry
        
        // Check if entry has expired
        if (entry.expiresAt && new Date() > entry.expiresAt) {
          // Deactivate expired entry
          await updateDoc(snapshot.docs[0].ref, { isActive: false })
          return null
        }
        
        return entry
      }
      
      return null
    } catch (error) {
      return null
    }
  }

  // Device fingerprint methods
  private async getDeviceFingerprint(fingerprintId: string): Promise<DeviceFingerprint | null> {
    try {
      const docRef = doc(db, this.DEVICES_COLLECTION, fingerprintId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return docSnap.data() as DeviceFingerprint
      }
      
      return null
    } catch (error) {
      return null
    }
  }

  private async saveDeviceFingerprint(userId: string, fingerprint: any): Promise<void> {
    try {
      const device: DeviceFingerprint = {
        id: fingerprint.id,
        userId,
        fingerprint: fingerprint.hash,
        userAgent: fingerprint.userAgent || '',
        ipAddress: fingerprint.ipAddress || '',
        screenResolution: fingerprint.screenResolution || '',
        timezone: fingerprint.timezone || '',
        language: fingerprint.language || '',
        platform: fingerprint.platform || '',
        cookiesEnabled: fingerprint.cookiesEnabled || false,
        javaEnabled: fingerprint.javaEnabled || false,
        flashEnabled: fingerprint.flashEnabled || false,
        firstSeen: new Date(),
        lastSeen: new Date(),
        trustScore: 50, // Start with neutral trust
        isBlacklisted: false
      }

      await setDoc(doc(db, this.DEVICES_COLLECTION, fingerprint.id), device)
    } catch (error) {
      // Log error but don't throw
    }
  }

  private async updateDeviceFingerprint(fingerprintId: string, updates: Partial<DeviceFingerprint>): Promise<void> {
    try {
      await updateDoc(doc(db, this.DEVICES_COLLECTION, fingerprintId), updates)
    } catch (error) {
      // Log error but don't throw
    }
  }

  // Helper methods
  private calculateRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= this.RISK_THRESHOLDS.critical) return 'critical'
    if (score >= this.RISK_THRESHOLDS.high) return 'high'
    if (score >= this.RISK_THRESHOLDS.medium) return 'medium'
    return 'low'
  }

  private generateRecommendations(riskScore: number, factors: FraudFactor[]): string[] {
    const recommendations: string[] = []

    if (riskScore >= this.RISK_THRESHOLDS.critical) {
      recommendations.push('Block transaction immediately')
      recommendations.push('Manual review required')
    } else if (riskScore >= this.RISK_THRESHOLDS.high) {
      recommendations.push('Hold for manual review')
      recommendations.push('Request additional verification')
    } else if (riskScore >= this.RISK_THRESHOLDS.medium) {
      recommendations.push('Monitor closely')
      recommendations.push('Consider additional authentication')
    }

    // Factor-specific recommendations
    if (factors.some(f => f.type.includes('velocity'))) {
      recommendations.push('Implement velocity limits')
    }
    if (factors.some(f => f.type.includes('device'))) {
      recommendations.push('Verify device ownership')
    }
    if (factors.some(f => f.type.includes('location'))) {
      recommendations.push('Verify shipping address')
    }

    return recommendations
  }

  private async notifyFraudTeam(alert: FraudAlert): Promise<void> {
    try {
      // Send email notification to fraud team
      await emailService.sendFraudAlert(alert)
      
      // Log notification
      await auditService.logSystemEvent(
        'fraud_team_notified',
        {
          alertId: alert.id,
          severity: alert.severity,
          type: alert.type
        },
        true
      )
    } catch (error) {
      // Log error but don't throw
      await auditService.logSystemEvent(
        'fraud_notification_failed',
        {
          alertId: alert.id,
          error: (error as Error).message
        },
        false
      )
    }
  }

  // Get fraud alerts for admin dashboard
  async getFraudAlerts(status?: string, severity?: string): Promise<FraudAlert[]> {
    try {
      let q = query(
        collection(db, this.ALERTS_COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(100)
      )

      if (status) {
        q = query(q, where('status', '==', status))
      }
      if (severity) {
        q = query(q, where('severity', '==', severity))
      }

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FraudAlert[]
    } catch (error) {
      throw new Error('Failed to fetch fraud alerts')
    }
  }

  // Update alert status
  async updateAlertStatus(
    alertId: string,
    status: 'pending' | 'investigating' | 'resolved' | 'false_positive',
    reviewedBy: string,
    resolution?: string
  ): Promise<void> {
    try {
      await updateDoc(doc(db, this.ALERTS_COLLECTION, alertId), {
        status,
        reviewedBy,
        reviewedAt: new Date(),
        resolution,
        updatedAt: new Date()
      })

      await auditService.logSystemEvent(
        'fraud_alert_updated',
        { alertId, status, reviewedBy, resolution },
        true
      )
    } catch (error) {
      throw new Error('Failed to update alert status')
    }
  }
}

export const fraudDetectionService = new FraudDetectionService()
