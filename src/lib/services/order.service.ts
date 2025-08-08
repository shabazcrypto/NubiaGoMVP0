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
  addDoc
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Order, OrderItem, OrderStatus, PaymentStatus, Address } from '@/types'
import { cartService } from './cart.service'
import { productService } from './product.service'

export class OrderService {
  private readonly COLLECTION_NAME = 'orders'

  // Create new order
  async createOrder(orderData: {
    userId: string
    items: OrderItem[]
    shippingAddress: Address
    billingAddress: Address
    paymentMethod: string
    shippingMethod: string
    notes?: string
  }): Promise<Order> {
    try {
      // Validate cart before creating order
      const cartValidation = await cartService.validateCart(orderData.userId)
      if (!cartValidation.isValid) {
        throw new Error(`Cart validation failed: ${cartValidation.errors.join(', ')}`)
      }

      // Calculate totals
      const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const shipping = await cartService.calculateShipping(orderData.userId, orderData.shippingMethod)
      const tax = subtotal * 0.1 // 10% tax rate
      const total = subtotal + shipping + tax

      // Create order
      const newOrder: Order = {
        id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: orderData.userId,
        items: orderData.items,
        total,
        subtotal,
        tax,
        shipping,
        status: 'pending',
        paymentStatus: 'pending',
        shippingAddress: orderData.shippingAddress,
        billingAddress: orderData.billingAddress,
        paymentMethod: orderData.paymentMethod,
        notes: orderData.notes,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Save order to Firestore
      const orderRef = doc(db, this.COLLECTION_NAME, newOrder.id)
      await setDoc(orderRef, newOrder)

      // Clear cart after successful order creation
      await cartService.clearCart(orderData.userId)

      return newOrder
    } catch (error) {
      console.error('Error creating order:', error)
      throw new Error('Failed to create order')
    }
  }

  // Get order by ID
  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const orderRef = doc(db, this.COLLECTION_NAME, orderId)
      const orderDoc = await getDoc(orderRef)

      if (!orderDoc.exists()) {
        return null
      }

      return orderDoc.data() as Order
    } catch (error) {
      console.error('Error getting order:', error)
      // During build time, return null instead of throwing
      if (process.env.NODE_ENV === 'production' || process.env.NEXT_PHASE === 'phase-production-build') {
        return null
      }
      throw new Error('Failed to fetch order')
    }
  }

  // Get user's orders
  async getUserOrders(userId: string, page: number = 1, limit: number = 20): Promise<{
    orders: Order[]
    total: number
    hasMore: boolean
  }> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(q)
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[]

      // Pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedOrders = orders.slice(startIndex, endIndex)

      return {
        orders: paginatedOrders,
        total: orders.length,
        hasMore: endIndex < orders.length
      }
    } catch (error) {
      console.error('Error getting user orders:', error)
      // During build time, return empty array instead of throwing
      if (process.env.NODE_ENV === 'production' || process.env.NEXT_PHASE === 'phase-production-build') {
        return {
          orders: [],
          total: 0,
          hasMore: false
        }
      }
      throw new Error('Failed to fetch user orders')
    }
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    try {
      const orderRef = doc(db, this.COLLECTION_NAME, orderId)
      await updateDoc(orderRef, {
        status,
        updatedAt: new Date()
      })

      const updatedDoc = await getDoc(orderRef)
      return updatedDoc.data() as Order
    } catch (error) {
      console.error('Error updating order status:', error)
      throw new Error('Failed to update order status')
    }
  }

  // Update payment status
  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<Order> {
    try {
      const orderRef = doc(db, this.COLLECTION_NAME, orderId)
      await updateDoc(orderRef, {
        paymentStatus,
        updatedAt: new Date()
      })

      const updatedDoc = await getDoc(orderRef)
      return updatedDoc.data() as Order
    } catch (error) {
      console.error('Error updating payment status:', error)
      throw new Error('Failed to update payment status')
    }
  }

  // Add tracking number
  async addTrackingNumber(orderId: string, trackingNumber: string): Promise<Order> {
    try {
      const orderRef = doc(db, this.COLLECTION_NAME, orderId)
      await updateDoc(orderRef, {
        trackingNumber,
        updatedAt: new Date()
      })

      const updatedDoc = await getDoc(orderRef)
      return updatedDoc.data() as Order
    } catch (error) {
      console.error('Error adding tracking number:', error)
      throw new Error('Failed to add tracking number')
    }
  }

  // Cancel order
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    try {
      const order = await this.getOrder(orderId)
      if (!order) {
        throw new Error('Order not found')
      }

      if (order.status === 'shipped' || order.status === 'delivered') {
        throw new Error('Cannot cancel shipped or delivered order')
      }

      // Update order status
      const orderRef = doc(db, this.COLLECTION_NAME, orderId)
      await updateDoc(orderRef, {
        status: 'cancelled',
        notes: reason ? `${order.notes || ''}\nCancelled: ${reason}` : order.notes,
        updatedAt: new Date()
      })

      // Restore items to inventory if needed
      // TODO: Implement inventory restoration

      const updatedDoc = await getDoc(orderRef)
      return updatedDoc.data() as Order
    } catch (error) {
      console.error('Error cancelling order:', error)
      throw new Error('Failed to cancel order')
    }
  }

  // Process payment
  async processPayment(orderId: string, paymentData: {
    method: string
    transactionId: string
    amount: number
  }): Promise<Order> {
    try {
      const order = await this.getOrder(orderId)
      if (!order) {
        throw new Error('Order not found')
      }

      // TODO: Integrate with payment gateway (Yellow Card, etc.)
      // const paymentResult = await paymentService.processPayment(paymentData)

      // Update order with payment information
      const orderRef = doc(db, this.COLLECTION_NAME, orderId)
      await updateDoc(orderRef, {
        paymentStatus: 'paid',
        status: 'confirmed',
        updatedAt: new Date()
      })

      const updatedDoc = await getDoc(orderRef)
      return updatedDoc.data() as Order
    } catch (error) {
      console.error('Error processing payment:', error)
      throw new Error('Failed to process payment')
    }
  }

  // Get order statistics
  async getOrderStatistics(userId: string): Promise<{
    totalOrders: number
    totalSpent: number
    averageOrderValue: number
    pendingOrders: number
  }> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId)
      )

      const snapshot = await getDocs(q)
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[]

      const totalOrders = orders.length
      const totalSpent = orders.reduce((sum, order) => sum + order.total, 0)
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0
      const pendingOrders = orders.filter(order => 
        order.status === 'pending' || order.status === 'confirmed'
      ).length

      return {
        totalOrders,
        totalSpent,
        averageOrderValue,
        pendingOrders
      }
    } catch (error) {
      console.error('Error getting order statistics:', error)
      throw new Error('Failed to fetch order statistics')
    }
  }

  // Get all orders (admin only)
  async getAllOrders(page: number = 1, limit: number = 50, status?: OrderStatus): Promise<{
    orders: Order[]
    total: number
    hasMore: boolean
  }> {
    try {
      let q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      )

      if (status) {
        q = query(q, where('status', '==', status))
      }

      const snapshot = await getDocs(q)
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[]

      // Pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedOrders = orders.slice(startIndex, endIndex)

      return {
        orders: paginatedOrders,
        total: orders.length,
        hasMore: endIndex < orders.length
      }
    } catch (error) {
      console.error('Error getting all orders:', error)
      throw new Error('Failed to fetch orders')
    }
  }

  // Refund order
  async refundOrder(orderId: string, refundAmount: number, reason?: string): Promise<Order> {
    try {
      const order = await this.getOrder(orderId)
      if (!order) {
        throw new Error('Order not found')
      }

      if (order.paymentStatus !== 'paid') {
        throw new Error('Order is not paid')
      }

      // TODO: Process refund through payment gateway
      // await paymentService.processRefund(order.paymentMethod, refundAmount)

      // Update order status
      const orderRef = doc(db, this.COLLECTION_NAME, orderId)
      await updateDoc(orderRef, {
        status: 'refunded',
        paymentStatus: 'refunded',
        notes: reason ? `${order.notes || ''}\nRefunded: ${reason}` : order.notes,
        updatedAt: new Date()
      })

      const updatedDoc = await getDoc(orderRef)
      return updatedDoc.data() as Order
    } catch (error) {
      console.error('Error refunding order:', error)
      throw new Error('Failed to refund order')
    }
  }
}

export const orderService = new OrderService() 