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
import { orderService } from './order.service'
import { inventoryManagementService } from './inventory-management.service'

export interface RecurringOrder {
  id: string
  userId: string
  name: string
  description?: string
  items: RecurringOrderItem[]
  frequency: OrderFrequency
  nextOrderDate: Date
  lastOrderDate?: Date
  status: RecurringOrderStatus
  paymentMethodId: string
  shippingAddressId: string
  billingAddressId: string
  subtotal: number
  tax: number
  shipping: number
  total: number
  currency: string
  discountCode?: string
  discountAmount: number
  notifications: NotificationSettings
  pausedUntil?: Date
  pauseReason?: string
  maxOrders?: number
  ordersCreated: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface RecurringOrderItem {
  productId: string
  variantId?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  isFlexible: boolean // Allow substitutions if out of stock
  substitutionRules?: SubstitutionRule[]
}

export interface SubstitutionRule {
  type: 'brand' | 'size' | 'flavor' | 'similar_product'
  allowedSubstitutes: string[]
  priceVarianceLimit: number // percentage
  requireApproval: boolean
}

export type OrderFrequency = 
  | 'weekly'
  | 'bi_weekly'
  | 'monthly'
  | 'bi_monthly'
  | 'quarterly'
  | 'custom'

export interface CustomFrequency {
  interval: number
  unit: 'days' | 'weeks' | 'months'
}

export type RecurringOrderStatus = 
  | 'active'
  | 'paused'
  | 'cancelled'
  | 'completed'
  | 'failed'

export interface NotificationSettings {
  orderReminder: boolean
  reminderDaysBefore: number
  orderConfirmation: boolean
  orderShipped: boolean
  orderDelivered: boolean
  paymentFailed: boolean
  stockIssues: boolean
  priceChanges: boolean
}

export interface RecurringOrderExecution {
  id: string
  recurringOrderId: string
  orderId?: string
  scheduledDate: Date
  executedDate?: Date
  status: ExecutionStatus
  issues: OrderIssue[]
  substitutions: ProductSubstitution[]
  totalAmount: number
  paymentStatus: PaymentStatus
  createdAt: Date
}

export type ExecutionStatus = 
  | 'scheduled'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'requires_approval'

export type PaymentStatus = 
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'refunded'

export interface OrderIssue {
  type: 'out_of_stock' | 'price_change' | 'payment_failed' | 'address_invalid' | 'product_discontinued'
  productId?: string
  description: string
  severity: 'low' | 'medium' | 'high'
  resolution?: string
  resolvedAt?: Date
}

export interface ProductSubstitution {
  originalProductId: string
  substituteProductId: string
  reason: string
  priceChange: number
  requiresApproval: boolean
  approved?: boolean
  approvedAt?: Date
}

export interface RecurringOrderTemplate {
  id: string
  name: string
  description: string
  category: string
  items: RecurringOrderItem[]
  frequency: OrderFrequency
  isPublic: boolean
  usageCount: number
  rating: number
  createdBy: string
  createdAt: Date
}

export interface SubscriptionBox {
  id: string
  name: string
  description: string
  category: string
  price: number
  frequency: OrderFrequency
  items: SubscriptionBoxItem[]
  customizationOptions: CustomizationOption[]
  isActive: boolean
  subscriberCount: number
  createdAt: Date
}

export interface SubscriptionBoxItem {
  type: 'fixed' | 'variable' | 'choice'
  productId?: string
  category?: string
  quantity: number
  description: string
}

export interface CustomizationOption {
  id: string
  name: string
  type: 'single_choice' | 'multiple_choice' | 'quantity'
  options: string[]
  required: boolean
}

export class RecurringOrdersService {
  private readonly RECURRING_ORDERS_COLLECTION = 'recurring_orders'
  private readonly EXECUTIONS_COLLECTION = 'recurring_order_executions'
  private readonly TEMPLATES_COLLECTION = 'recurring_order_templates'
  private readonly SUBSCRIPTION_BOXES_COLLECTION = 'subscription_boxes'

  // Create recurring order
  async createRecurringOrder(orderData: Omit<RecurringOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<RecurringOrder> {
    try {
      const recurringOrder: Omit<RecurringOrder, 'id'> = {
        ...orderData,
        ordersCreated: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const docRef = await addDoc(collection(db, this.RECURRING_ORDERS_COLLECTION), recurringOrder)
      
      const createdOrder = {
        id: docRef.id,
        ...recurringOrder
      }

      // Schedule first execution
      await this.scheduleNextExecution(docRef.id, recurringOrder.nextOrderDate)

      // Log recurring order creation
      await auditService.logSystemEvent(
        'recurring_order_created',
        {
          recurringOrderId: docRef.id,
          userId: recurringOrder.userId,
          frequency: recurringOrder.frequency,
          total: recurringOrder.total
        },
        true
      )

      // Send confirmation email
      await this.sendRecurringOrderConfirmation(createdOrder)

      return createdOrder
    } catch (error) {
      throw new Error(`Failed to create recurring order: ${(error as Error).message}`)
    }
  }

  // Update recurring order
  async updateRecurringOrder(orderId: string, updates: Partial<RecurringOrder>): Promise<RecurringOrder> {
    try {
      const orderRef = doc(db, this.RECURRING_ORDERS_COLLECTION, orderId)
      const orderDoc = await getDoc(orderRef)
      
      if (!orderDoc.exists()) {
        throw new Error('Recurring order not found')
      }

      const updatedData = {
        ...updates,
        updatedAt: new Date()
      }

      // If frequency or next order date changed, reschedule
      if (updates.frequency || updates.nextOrderDate) {
        const currentOrder = orderDoc.data() as RecurringOrder
        const newNextDate = updates.nextOrderDate || this.calculateNextOrderDate(
          updates.frequency || currentOrder.frequency,
          currentOrder.lastOrderDate || new Date()
        )
        updatedData.nextOrderDate = newNextDate
        
        // Reschedule execution
        await this.scheduleNextExecution(orderId, newNextDate)
      }

      await updateDoc(orderRef, updatedData)

      const updatedOrder = {
        id: orderId,
        ...orderDoc.data(),
        ...updatedData
      } as RecurringOrder

      // Log update
      await auditService.logSystemEvent(
        'recurring_order_updated',
        {
          recurringOrderId: orderId,
          updates: Object.keys(updates)
        },
        true
      )

      return updatedOrder
    } catch (error) {
      throw new Error(`Failed to update recurring order: ${(error as Error).message}`)
    }
  }

  // Pause recurring order
  async pauseRecurringOrder(
    orderId: string,
    pauseUntil?: Date,
    reason?: string
  ): Promise<void> {
    try {
      await this.updateRecurringOrder(orderId, {
        status: 'paused',
        pausedUntil,
        pauseReason: reason,
        isActive: false
      })

      // Cancel scheduled executions
      await this.cancelScheduledExecutions(orderId)

      // Log pause
      await auditService.logSystemEvent(
        'recurring_order_paused',
        {
          recurringOrderId: orderId,
          pauseUntil,
          reason
        },
        true
      )
    } catch (error) {
      throw new Error(`Failed to pause recurring order: ${(error as Error).message}`)
    }
  }

  // Resume recurring order
  async resumeRecurringOrder(orderId: string): Promise<void> {
    try {
      const order = await this.getRecurringOrder(orderId)
      if (!order) {
        throw new Error('Recurring order not found')
      }

      const nextOrderDate = this.calculateNextOrderDate(order.frequency, new Date())

      await this.updateRecurringOrder(orderId, {
        status: 'active',
        pausedUntil: undefined,
        pauseReason: undefined,
        isActive: true,
        nextOrderDate
      })

      // Schedule next execution
      await this.scheduleNextExecution(orderId, nextOrderDate)

      // Log resume
      await auditService.logSystemEvent(
        'recurring_order_resumed',
        {
          recurringOrderId: orderId,
          nextOrderDate
        },
        true
      )
    } catch (error) {
      throw new Error(`Failed to resume recurring order: ${(error as Error).message}`)
    }
  }

  // Cancel recurring order
  async cancelRecurringOrder(orderId: string, reason?: string): Promise<void> {
    try {
      await this.updateRecurringOrder(orderId, {
        status: 'cancelled',
        isActive: false
      })

      // Cancel all scheduled executions
      await this.cancelScheduledExecutions(orderId)

      // Log cancellation
      await auditService.logSystemEvent(
        'recurring_order_cancelled',
        {
          recurringOrderId: orderId,
          reason
        },
        true
      )

      // Send cancellation confirmation
      const order = await this.getRecurringOrder(orderId)
      if (order) {
        await this.sendCancellationConfirmation(order)
      }
    } catch (error) {
      throw new Error(`Failed to cancel recurring order: ${(error as Error).message}`)
    }
  }

  // Execute recurring order
  async executeRecurringOrder(recurringOrderId: string): Promise<RecurringOrderExecution> {
    try {
      const recurringOrder = await this.getRecurringOrder(recurringOrderId)
      if (!recurringOrder) {
        throw new Error('Recurring order not found')
      }

      if (!recurringOrder.isActive || recurringOrder.status !== 'active') {
        throw new Error('Recurring order is not active')
      }

      // Create execution record
      const execution: Omit<RecurringOrderExecution, 'id'> = {
        recurringOrderId,
        scheduledDate: recurringOrder.nextOrderDate,
        status: 'processing',
        issues: [],
        substitutions: [],
        totalAmount: recurringOrder.total,
        paymentStatus: 'pending',
        createdAt: new Date()
      }

      const executionRef = await addDoc(collection(db, this.EXECUTIONS_COLLECTION), execution)
      const executionId = executionRef.id

      try {
        // Check inventory and handle substitutions
        const { availableItems, issues, substitutions } = await this.validateOrderItems(recurringOrder.items)

        // Update execution with issues and substitutions
        await updateDoc(executionRef, {
          issues,
          substitutions
        })

        // If there are critical issues, require approval
        const criticalIssues = issues.filter(issue => issue.severity === 'high')
        if (criticalIssues.length > 0) {
          await updateDoc(executionRef, {
            status: 'requires_approval'
          })

          // Send approval request
          await this.sendApprovalRequest(recurringOrder, criticalIssues, substitutions)

          return {
            id: executionId,
            ...execution,
            status: 'requires_approval',
            issues,
            substitutions
          }
        }

        // Create the actual order
        const orderData = {
          userId: recurringOrder.userId,
          items: availableItems,
          paymentMethodId: recurringOrder.paymentMethodId,
          shippingAddressId: recurringOrder.shippingAddressId,
          billingAddressId: recurringOrder.billingAddressId,
          discountCode: recurringOrder.discountCode,
          isRecurringOrder: true,
          recurringOrderId
        }

        const createdOrder = await orderService.createOrder(orderData)

        // Update execution with order ID
        await updateDoc(executionRef, {
          orderId: createdOrder.id,
          status: 'completed',
          executedDate: new Date(),
          paymentStatus: 'captured'
        })

        // Update recurring order
        const nextOrderDate = this.calculateNextOrderDate(recurringOrder.frequency, new Date())
        await this.updateRecurringOrder(recurringOrderId, {
          lastOrderDate: new Date(),
          nextOrderDate,
          ordersCreated: recurringOrder.ordersCreated + 1
        })

        // Schedule next execution
        await this.scheduleNextExecution(recurringOrderId, nextOrderDate)

        // Send order confirmation
        await this.sendOrderConfirmation(recurringOrder, createdOrder)

        // Log successful execution
        await auditService.logSystemEvent(
          'recurring_order_executed',
          {
            recurringOrderId,
            executionId,
            orderId: createdOrder.id,
            totalAmount: createdOrder.total
          },
          true
        )

        return {
          id: executionId,
          ...execution,
          orderId: createdOrder.id,
          status: 'completed',
          executedDate: new Date(),
          issues,
          substitutions
        }

      } catch (orderError) {
        // Update execution as failed
        await updateDoc(executionRef, {
          status: 'failed',
          issues: [
            ...execution.issues,
            {
              type: 'payment_failed',
              description: (orderError as Error).message,
              severity: 'high'
            }
          ]
        })

        // Send failure notification
        await this.sendExecutionFailureNotification(recurringOrder, (orderError as Error).message)

        throw orderError
      }
    } catch (error) {
      throw new Error(`Failed to execute recurring order: ${(error as Error).message}`)
    }
  }

  // Get recurring orders for user
  async getUserRecurringOrders(
    userId: string,
    status?: RecurringOrderStatus
  ): Promise<RecurringOrder[]> {
    try {
      let q = query(
        collection(db, this.RECURRING_ORDERS_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )

      if (status) {
        q = query(q, where('status', '==', status))
      }

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RecurringOrder[]
    } catch (error) {
      throw new Error('Failed to fetch user recurring orders')
    }
  }

  // Get recurring order by ID
  async getRecurringOrder(orderId: string): Promise<RecurringOrder | null> {
    try {
      const orderDoc = await getDoc(doc(db, this.RECURRING_ORDERS_COLLECTION, orderId))
      
      if (!orderDoc.exists()) {
        return null
      }

      return {
        id: orderDoc.id,
        ...orderDoc.data()
      } as RecurringOrder
    } catch (error) {
      throw new Error('Failed to fetch recurring order')
    }
  }

  // Get execution history
  async getExecutionHistory(
    recurringOrderId: string,
    limitCount: number = 50
  ): Promise<RecurringOrderExecution[]> {
    try {
      const q = query(
        collection(db, this.EXECUTIONS_COLLECTION),
        where('recurringOrderId', '==', recurringOrderId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RecurringOrderExecution[]
    } catch (error) {
      throw new Error('Failed to fetch execution history')
    }
  }

  // Create recurring order template
  async createTemplate(templateData: Omit<RecurringOrderTemplate, 'id' | 'createdAt'>): Promise<RecurringOrderTemplate> {
    try {
      const template: Omit<RecurringOrderTemplate, 'id'> = {
        ...templateData,
        usageCount: 0,
        rating: 0,
        createdAt: new Date()
      }

      const docRef = await addDoc(collection(db, this.TEMPLATES_COLLECTION), template)
      
      return {
        id: docRef.id,
        ...template
      }
    } catch (error) {
      throw new Error(`Failed to create template: ${(error as Error).message}`)
    }
  }

  // Get recurring order analytics
  async getRecurringOrderAnalytics(userId?: string): Promise<{
    totalRecurringOrders: number
    activeOrders: number
    pausedOrders: number
    totalRevenue: number
    averageOrderValue: number
    frequencyDistribution: { frequency: string; count: number }[]
    executionSuccessRate: number
    topProducts: { productId: string; quantity: number }[]
  }> {
    try {
      let ordersQuery = query(collection(db, this.RECURRING_ORDERS_COLLECTION))
      if (userId) {
        ordersQuery = query(ordersQuery, where('userId', '==', userId))
      }

      const ordersSnapshot = await getDocs(ordersQuery)
      const orders = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RecurringOrder[]

      const totalRecurringOrders = orders.length
      const activeOrders = orders.filter(o => o.status === 'active').length
      const pausedOrders = orders.filter(o => o.status === 'paused').length
      const totalRevenue = orders.reduce((sum, o) => sum + (o.total * o.ordersCreated), 0)
      const averageOrderValue = orders.length > 0 ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0

      // Frequency distribution
      const frequencyCount: Record<string, number> = {}
      orders.forEach(order => {
        frequencyCount[order.frequency] = (frequencyCount[order.frequency] || 0) + 1
      })
      const frequencyDistribution = Object.entries(frequencyCount)
        .map(([frequency, count]) => ({ frequency, count }))

      // Execution success rate (simplified)
      const executionSuccessRate = 95 // Would calculate from actual execution data

      // Top products
      const productCount: Record<string, number> = {}
      orders.forEach(order => {
        order.items.forEach(item => {
          productCount[item.productId] = (productCount[item.productId] || 0) + item.quantity
        })
      })
      const topProducts = Object.entries(productCount)
        .map(([productId, quantity]) => ({ productId, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10)

      return {
        totalRecurringOrders,
        activeOrders,
        pausedOrders,
        totalRevenue,
        averageOrderValue,
        frequencyDistribution,
        executionSuccessRate,
        topProducts
      }
    } catch (error) {
      throw new Error('Failed to get recurring order analytics')
    }
  }

  // Private helper methods
  private calculateNextOrderDate(frequency: OrderFrequency, fromDate: Date): Date {
    const nextDate = new Date(fromDate)
    
    switch (frequency) {
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7)
        break
      case 'bi_weekly':
        nextDate.setDate(nextDate.getDate() + 14)
        break
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1)
        break
      case 'bi_monthly':
        nextDate.setMonth(nextDate.getMonth() + 2)
        break
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3)
        break
      default:
        nextDate.setMonth(nextDate.getMonth() + 1) // Default to monthly
    }
    
    return nextDate
  }

  private async scheduleNextExecution(recurringOrderId: string, scheduledDate: Date): Promise<void> {
    // This would integrate with a job scheduler (like Firebase Functions with Pub/Sub)
    // For now, we'll just log the scheduling
    await auditService.logSystemEvent(
      'recurring_order_scheduled',
      {
        recurringOrderId,
        scheduledDate
      },
      true
    )
  }

  private async cancelScheduledExecutions(recurringOrderId: string): Promise<void> {
    // This would cancel scheduled jobs
    await auditService.logSystemEvent(
      'recurring_order_executions_cancelled',
      {
        recurringOrderId
      },
      true
    )
  }

  private async validateOrderItems(items: RecurringOrderItem[]): Promise<{
    availableItems: any[]
    issues: OrderIssue[]
    substitutions: ProductSubstitution[]
  }> {
    const availableItems: any[] = []
    const issues: OrderIssue[] = []
    const substitutions: ProductSubstitution[] = []

    for (const item of items) {
      // Check inventory availability
      const inventory = await inventoryManagementService.getProductInventory(item.productId)
      const totalAvailable = inventory.reduce((sum, inv) => sum + inv.availableQuantity, 0)

      if (totalAvailable >= item.quantity) {
        availableItems.push({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })
      } else if (totalAvailable > 0) {
        // Partial availability
        availableItems.push({
          productId: item.productId,
          variantId: item.variantId,
          quantity: totalAvailable,
          unitPrice: item.unitPrice
        })
        
        issues.push({
          type: 'out_of_stock',
          productId: item.productId,
          description: `Only ${totalAvailable} of ${item.quantity} available`,
          severity: 'medium'
        })
      } else {
        // Out of stock
        issues.push({
          type: 'out_of_stock',
          productId: item.productId,
          description: 'Product is out of stock',
          severity: 'high'
        })

        // Try to find substitutions if allowed
        if (item.isFlexible && item.substitutionRules) {
          // Implementation would find suitable substitutes
          // For now, just log the attempt
        }
      }
    }

    return { availableItems, issues, substitutions }
  }

  private async sendRecurringOrderConfirmation(order: RecurringOrder): Promise<void> {
    try {
      await emailService.sendRecurringOrderConfirmation(order)
    } catch (error) {
      await auditService.logSystemEvent(
        'recurring_order_confirmation_failed',
        {
          recurringOrderId: order.id,
          error: (error as Error).message
        },
        false
      )
    }
  }

  private async sendCancellationConfirmation(order: RecurringOrder): Promise<void> {
    try {
      await emailService.sendRecurringOrderCancellation(order)
    } catch (error) {
      await auditService.logSystemEvent(
        'cancellation_confirmation_failed',
        {
          recurringOrderId: order.id,
          error: (error as Error).message
        },
        false
      )
    }
  }

  private async sendApprovalRequest(
    order: RecurringOrder,
    issues: OrderIssue[],
    substitutions: ProductSubstitution[]
  ): Promise<void> {
    try {
      await emailService.sendRecurringOrderApprovalRequest(order, issues, substitutions)
    } catch (error) {
      await auditService.logSystemEvent(
        'approval_request_failed',
        {
          recurringOrderId: order.id,
          error: (error as Error).message
        },
        false
      )
    }
  }

  private async sendOrderConfirmation(recurringOrder: RecurringOrder, order: any): Promise<void> {
    try {
      await emailService.sendRecurringOrderExecuted(recurringOrder, order)
    } catch (error) {
      await auditService.logSystemEvent(
        'order_confirmation_failed',
        {
          recurringOrderId: recurringOrder.id,
          orderId: order.id,
          error: (error as Error).message
        },
        false
      )
    }
  }

  private async sendExecutionFailureNotification(order: RecurringOrder, errorMessage: string): Promise<void> {
    try {
      await emailService.sendRecurringOrderExecutionFailed(order, errorMessage)
    } catch (error) {
      await auditService.logSystemEvent(
        'execution_failure_notification_failed',
        {
          recurringOrderId: order.id,
          error: (error as Error).message
        },
        false
      )
    }
  }
}

export const recurringOrdersService = new RecurringOrdersService()
