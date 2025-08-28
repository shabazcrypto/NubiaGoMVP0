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
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { orderService } from './order.service'
import { productService } from './product.service'
import { emailService } from './email.service'
import { auditService } from './audit.service'

export interface ReturnRequest {
  id: string
  orderId: string
  userId: string
  items: ReturnItem[]
  reason: ReturnReason
  description?: string
  status: ReturnStatus
  type: 'return' | 'exchange'
  requestedAt: Date
  processedAt?: Date
  completedAt?: Date
  refundAmount?: number
  exchangeOrderId?: string
  trackingNumber?: string
  returnShippingLabel?: string
  photos?: string[]
  adminNotes?: string
  processedBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface ReturnItem {
  productId: string
  quantity: number
  reason: string
  condition: 'new' | 'used' | 'damaged' | 'defective'
  originalPrice: number
  refundAmount: number
  exchangeProductId?: string
}

export type ReturnReason = 
  | 'defective'
  | 'wrong_item'
  | 'not_as_described'
  | 'damaged_in_shipping'
  | 'changed_mind'
  | 'size_issue'
  | 'quality_issue'
  | 'late_delivery'
  | 'other'

export type ReturnStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'shipped'
  | 'received'
  | 'inspected'
  | 'completed'
  | 'cancelled'

export interface ReturnPolicy {
  returnWindowDays: number
  exchangeWindowDays: number
  allowedReasons: ReturnReason[]
  requiresApproval: boolean
  autoApproveReasons: ReturnReason[]
  restockingFee: number
  shippingCostResponsibility: 'customer' | 'merchant' | 'shared'
  conditionRequirements: string[]
}

export class ReturnExchangeService {
  private readonly COLLECTION_NAME = 'return_requests'
  private readonly POLICY_COLLECTION = 'return_policies'

  // Default return policy
  private defaultPolicy: ReturnPolicy = {
    returnWindowDays: 30,
    exchangeWindowDays: 30,
    allowedReasons: ['defective', 'wrong_item', 'not_as_described', 'damaged_in_shipping', 'changed_mind', 'size_issue'],
    requiresApproval: true,
    autoApproveReasons: ['defective', 'wrong_item', 'damaged_in_shipping'],
    restockingFee: 0.15, // 15%
    shippingCostResponsibility: 'customer',
    conditionRequirements: ['Original packaging', 'Unused condition', 'All accessories included']
  }

  // Create return request
  async createReturnRequest(
    orderId: string,
    userId: string,
    items: Omit<ReturnItem, 'refundAmount'>[],
    reason: ReturnReason,
    type: 'return' | 'exchange',
    description?: string,
    photos?: string[]
  ): Promise<ReturnRequest> {
    try {
      // Validate order exists and belongs to user
      const order = await orderService.getOrder(orderId)
      if (!order) {
        throw new Error('Order not found')
      }
      if (order.userId !== userId) {
        throw new Error('Unauthorized access to order')
      }

      // Check if return window is still valid
      const policy = await this.getReturnPolicy()
      const orderDate = new Date(order.createdAt)
      const windowDays = type === 'return' ? policy.returnWindowDays : policy.exchangeWindowDays
      const windowExpiry = new Date(orderDate.getTime() + (windowDays * 24 * 60 * 60 * 1000))
      
      if (new Date() > windowExpiry) {
        throw new Error(`${type === 'return' ? 'Return' : 'Exchange'} window has expired`)
      }

      // Validate items exist in order
      const orderItemIds = order.items.map(item => item.productId)
      for (const item of items) {
        if (!orderItemIds.includes(item.productId)) {
          throw new Error(`Product ${item.productId} not found in order`)
        }
      }

      // Calculate refund amounts
      const itemsWithRefund = await Promise.all(
        items.map(async (item) => {
          const orderItem = order.items.find(oi => oi.productId === item.productId)
          if (!orderItem) throw new Error('Order item not found')

          let refundAmount = orderItem.price * item.quantity
          
          // Apply restocking fee if applicable
          if (reason === 'changed_mind' && policy.restockingFee > 0) {
            refundAmount *= (1 - policy.restockingFee)
          }

          return {
            ...item,
            originalPrice: orderItem.price,
            refundAmount
          }
        })
      )

      // Determine initial status
      const shouldAutoApprove = policy.autoApproveReasons.includes(reason) && !policy.requiresApproval
      const initialStatus: ReturnStatus = shouldAutoApprove ? 'approved' : 'pending'

      // Create return request
      const returnRequest: Omit<ReturnRequest, 'id'> = {
        orderId,
        userId,
        items: itemsWithRefund,
        reason,
        description,
        status: initialStatus,
        type,
        requestedAt: new Date(),
        photos: photos || [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), returnRequest)
      const newRequest = { id: docRef.id, ...returnRequest }

      // Send confirmation email
      await emailService.sendReturnRequestConfirmation(userId, newRequest)

      // Log the event
      await auditService.logSystemEvent(
        'return_request_created',
        {
          returnId: docRef.id,
          orderId,
          userId,
          type,
          reason,
          itemCount: items.length
        },
        true
      )

      return newRequest
    } catch (error) {
      throw new Error(`Failed to create return request: ${(error as Error).message}`)
    }
  }

  // Get return request by ID
  async getReturnRequest(returnId: string): Promise<ReturnRequest | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, returnId)
      const docSnap = await getDoc(docRef)
      
      if (!docSnap.exists()) {
        return null
      }

      return { id: docSnap.id, ...docSnap.data() } as ReturnRequest
    } catch (error) {
      throw new Error('Failed to fetch return request')
    }
  }

  // Get user's return requests
  async getUserReturnRequests(userId: string): Promise<ReturnRequest[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ReturnRequest[]
    } catch (error) {
      throw new Error('Failed to fetch user return requests')
    }
  }

  // Update return request status (Admin)
  async updateReturnStatus(
    returnId: string,
    status: ReturnStatus,
    adminNotes?: string,
    processedBy?: string
  ): Promise<ReturnRequest> {
    try {
      const returnRequest = await this.getReturnRequest(returnId)
      if (!returnRequest) {
        throw new Error('Return request not found')
      }

      const updates: Partial<ReturnRequest> = {
        status,
        updatedAt: new Date()
      }

      if (adminNotes) updates.adminNotes = adminNotes
      if (processedBy) updates.processedBy = processedBy

      if (status === 'approved' || status === 'rejected') {
        updates.processedAt = new Date()
      }
      if (status === 'completed') {
        updates.completedAt = new Date()
      }

      await updateDoc(doc(db, this.COLLECTION_NAME, returnId), updates)

      const updatedRequest = { ...returnRequest, ...updates }

      // Handle status-specific actions
      await this.handleStatusChange(updatedRequest, status)

      return updatedRequest
    } catch (error) {
      throw new Error(`Failed to update return status: ${(error as Error).message}`)
    }
  }

  // Process return completion
  async processReturnCompletion(returnId: string, processedBy: string): Promise<void> {
    try {
      const returnRequest = await this.getReturnRequest(returnId)
      if (!returnRequest) {
        throw new Error('Return request not found')
      }

      if (returnRequest.status !== 'inspected') {
        throw new Error('Return must be inspected before completion')
      }

      // Process refund if it's a return
      if (returnRequest.type === 'return') {
        const totalRefund = returnRequest.items.reduce((sum, item) => sum + item.refundAmount, 0)
        
        // Process refund through payment service
        try {
          const { paymentService } = await import('./payment.service')
          await paymentService.processRefund(returnRequest.orderId, totalRefund, 'Return processed')
        } catch (error) {
          // Log refund failure but continue with return completion
          await auditService.logSystemEvent(
            'refund_failed',
            {
              returnId,
              orderId: returnRequest.orderId,
              amount: totalRefund,
              error: (error as Error).message
            },
            false
          )
        }

        // Update return request with refund amount
        await updateDoc(doc(db, this.COLLECTION_NAME, returnId), {
          refundAmount: totalRefund,
          status: 'completed',
          completedAt: new Date(),
          processedBy,
          updatedAt: new Date()
        })
      }

      // Restore inventory
      await this.restoreInventory(returnRequest.items)

      // Send completion email
      await emailService.sendReturnProcessedNotification(returnRequest.userId, returnRequest)

      // Log completion
      await auditService.logSystemEvent(
        'return_completed',
        {
          returnId,
          orderId: returnRequest.orderId,
          userId: returnRequest.userId,
          type: returnRequest.type,
          processedBy
        },
        true
      )
    } catch (error) {
      throw new Error(`Failed to process return completion: ${(error as Error).message}`)
    }
  }

  // Generate return shipping label
  async generateReturnShippingLabel(returnId: string): Promise<string> {
    try {
      const returnRequest = await this.getReturnRequest(returnId)
      if (!returnRequest) {
        throw new Error('Return request not found')
      }

      // Get order for shipping addresses
      const order = await orderService.getOrder(returnRequest.orderId)
      if (!order) {
        throw new Error('Original order not found')
      }

      // Generate return shipping label using logistics service
      const { logisticsService } = await import('./logistics.service')
      
      // Mock return address (should be configured in settings)
      const returnAddress = {
        name: 'NubiaGo Returns',
        address1: '123 Return Center St',
        city: 'Return City',
        state: 'RC',
        postalCode: '12345',
        country: 'US'
      }

      // Use customer's original shipping address as return origin
      const fromAddress = order.shippingAddress

      // Calculate package dimensions (mock for now)
      const packages = [{
        weight: 2,
        length: 12,
        width: 8,
        height: 6,
        weightUnit: 'lb' as const,
        dimensionUnit: 'in' as const
      }]

      // Get shipping rates and select cheapest
      const rates = await logisticsService.getShippingRates(fromAddress, returnAddress, packages)
      if (rates.length === 0) {
        throw new Error('No shipping rates available for return')
      }

      const selectedRate = rates[0] // Use cheapest rate
      
      // Generate mock label URL (in real implementation, this would call the actual shipping API)
      const labelUrl = `https://storage.googleapis.com/return-labels/${returnId}.pdf`

      // Update return request with tracking info
      await updateDoc(doc(db, this.COLLECTION_NAME, returnId), {
        returnShippingLabel: labelUrl,
        trackingNumber: `RET${Date.now()}`,
        updatedAt: new Date()
      })

      return labelUrl
    } catch (error) {
      throw new Error(`Failed to generate return shipping label: ${(error as Error).message}`)
    }
  }

  // Get return policy
  async getReturnPolicy(): Promise<ReturnPolicy> {
    try {
      const docRef = doc(db, this.POLICY_COLLECTION, 'default')
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return docSnap.data() as ReturnPolicy
      }
      
      return this.defaultPolicy
    } catch (error) {
      return this.defaultPolicy
    }
  }

  // Update return policy (Admin)
  async updateReturnPolicy(policy: Partial<ReturnPolicy>): Promise<ReturnPolicy> {
    try {
      const currentPolicy = await this.getReturnPolicy()
      const updatedPolicy = { ...currentPolicy, ...policy }
      
      await setDoc(doc(db, this.POLICY_COLLECTION, 'default'), updatedPolicy)
      
      return updatedPolicy
    } catch (error) {
      throw new Error('Failed to update return policy')
    }
  }

  // Get return analytics
  async getReturnAnalytics(startDate: Date, endDate: Date): Promise<{
    totalReturns: number
    totalRefunded: number
    returnRate: number
    topReasons: { reason: ReturnReason; count: number }[]
    avgProcessingTime: number
  }> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('createdAt', '>=', startDate),
        where('createdAt', '<=', endDate)
      )
      
      const snapshot = await getDocs(q)
      const returns = snapshot.docs.map(doc => doc.data()) as ReturnRequest[]
      
      const totalReturns = returns.length
      const totalRefunded = returns
        .filter(r => r.refundAmount)
        .reduce((sum, r) => sum + (r.refundAmount || 0), 0)
      
      // Calculate return rate (would need total orders in same period)
      const returnRate = 0 // Placeholder - needs order count
      
      // Top reasons
      const reasonCounts = returns.reduce((acc, r) => {
        acc[r.reason] = (acc[r.reason] || 0) + 1
        return acc
      }, {} as Record<ReturnReason, number>)
      
      const topReasons = Object.entries(reasonCounts)
        .map(([reason, count]) => ({ reason: reason as ReturnReason, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
      
      // Average processing time
      const completedReturns = returns.filter(r => r.completedAt && r.requestedAt)
      const avgProcessingTime = completedReturns.length > 0
        ? completedReturns.reduce((sum, r) => {
            const processingTime = new Date(r.completedAt!).getTime() - new Date(r.requestedAt).getTime()
            return sum + processingTime
          }, 0) / completedReturns.length / (1000 * 60 * 60 * 24) // Convert to days
        : 0
      
      return {
        totalReturns,
        totalRefunded,
        returnRate,
        topReasons,
        avgProcessingTime
      }
    } catch (error) {
      throw new Error('Failed to get return analytics')
    }
  }

  // Private helper methods
  private async handleStatusChange(returnRequest: ReturnRequest, newStatus: ReturnStatus): Promise<void> {
    try {
      switch (newStatus) {
        case 'approved':
          await emailService.sendReturnApprovalNotification(returnRequest.userId, returnRequest)
          break
        case 'rejected':
          await emailService.sendReturnRejectionNotification(returnRequest.userId, returnRequest)
          break
        case 'shipped':
          // Customer has shipped the return
          await emailService.sendReturnShippedNotification(returnRequest.userId, returnRequest)
          break
        case 'received':
          // Return received at warehouse
          await emailService.sendReturnReceivedNotification(returnRequest.userId, returnRequest)
          break
        case 'completed':
          await emailService.sendReturnCompletedNotification(returnRequest.userId, returnRequest)
          break
      }

      // Log status change
      await auditService.logSystemEvent(
        'return_status_changed',
        {
          returnId: returnRequest.id,
          orderId: returnRequest.orderId,
          userId: returnRequest.userId,
          oldStatus: returnRequest.status,
          newStatus,
          processedBy: returnRequest.processedBy
        },
        true
      )
    } catch (error) {
      // Log error but don't throw to avoid breaking the main flow
      await auditService.logSystemEvent(
        'return_status_change_notification_failed',
        {
          returnId: returnRequest.id,
          status: newStatus,
          error: (error as Error).message
        },
        false
      )
    }
  }

  private async restoreInventory(items: ReturnItem[]): Promise<void> {
    try {
      for (const item of items) {
        // Only restore inventory for items in good condition
        if (item.condition === 'new' || item.condition === 'used') {
          // This would integrate with inventory management system
          // For now, we'll just log the inventory restoration
          await auditService.logSystemEvent(
            'inventory_restored',
            {
              productId: item.productId,
              quantity: item.quantity,
              condition: item.condition
            },
            true
          )
        }
      }
    } catch (error) {
      // Log error but don't throw
      await auditService.logSystemEvent(
        'inventory_restoration_failed',
        {
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
          error: (error as Error).message
        },
        false
      )
    }
  }
}

export const returnExchangeService = new ReturnExchangeService()
