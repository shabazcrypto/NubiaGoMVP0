import { db } from '@/lib/firebase/config'
import { doc, getDoc, setDoc, updateDoc, collection, addDoc } from 'firebase/firestore'

export interface PaymentTransaction {
  id: string
  orderId: string
  userId: string
  amount: number
  currency: string
  method: 'credit_card' | 'mobile_money' | 'bank_transfer'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  gateway: string
  gatewayTransactionId?: string
  metadata?: any
  createdAt: Date
  updatedAt: Date
}

export interface RefundTransaction {
  id: string
  originalTransactionId: string
  orderId: string
  amount: number
  reason?: string
  status: 'pending' | 'completed' | 'failed'
  gatewayRefundId?: string
  createdAt: Date
  updatedAt: Date
}

export class PaymentService {
  private readonly TRANSACTIONS_COLLECTION = 'payment_transactions'
  private readonly REFUNDS_COLLECTION = 'payment_refunds'

  // Process payment for an order
  async processPayment(orderData: {
    orderId: string
    userId: string
    amount: number
    currency: string
    method: 'credit_card' | 'mobile_money' | 'bank_transfer'
    paymentDetails: any
  }): Promise<PaymentTransaction> {
    try {
      // Create payment transaction record
      const transaction: Omit<PaymentTransaction, 'id'> = {
        orderId: orderData.orderId,
        userId: orderData.userId,
        amount: orderData.amount,
        currency: orderData.currency,
        method: orderData.method,
        status: 'pending',
        gateway: this.getGatewayForMethod(orderData.method),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Save transaction to Firestore
      const transactionRef = await addDoc(collection(db, this.TRANSACTIONS_COLLECTION), transaction)
      const transactionId = transactionRef.id

      // Process payment based on method
      let gatewayResult
      switch (orderData.method) {
        case 'credit_card':
          gatewayResult = await this.processCreditCardPayment(orderData, transactionId)
          break
        case 'mobile_money':
          gatewayResult = await this.processMobileMoneyPayment(orderData, transactionId)
          break
        case 'bank_transfer':
          gatewayResult = await this.processBankTransferPayment(orderData, transactionId)
          break
        default:
          throw new Error(`Unsupported payment method: ${orderData.method}`)
      }

      // Update transaction with gateway response
      await updateDoc(transactionRef, {
        status: gatewayResult.success ? 'completed' : 'failed',
        gatewayTransactionId: gatewayResult.transactionId,
        metadata: gatewayResult.metadata,
        updatedAt: new Date()
      })

      // Fetch and return updated transaction
      const updatedDoc = await getDoc(transactionRef)
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      } as PaymentTransaction

    } catch (error) {
      console.error('Error processing payment:', error)
      throw new Error(`Payment processing failed: ${(error as any).message}`)
    }
  }

  // Process refund for a transaction
  async processRefund(orderId: string, amount: number, reason?: string): Promise<RefundTransaction> {
    try {
      // Find original transaction
      const { collection: firestoreCollection, query, where, getDocs } = await import('firebase/firestore')
      
      const transactionsRef = firestoreCollection(db, this.TRANSACTIONS_COLLECTION)
      const q = query(transactionsRef, where('orderId', '==', orderId))
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) {
        throw new Error('Original transaction not found')
      }

      const originalTransaction = snapshot.docs[0]
      const transactionData = originalTransaction.data() as PaymentTransaction

      if (transactionData.status !== 'completed') {
        throw new Error('Cannot refund incomplete transaction')
      }

      // Create refund record
      const refund: Omit<RefundTransaction, 'id'> = {
        originalTransactionId: originalTransaction.id,
        orderId,
        amount,
        reason,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const refundRef = await addDoc(firestoreCollection(db, this.REFUNDS_COLLECTION), refund)

      // Process refund through gateway
      const gatewayResult = await this.processGatewayRefund(transactionData, amount)

      // Update refund record
      await updateDoc(refundRef, {
        status: gatewayResult.success ? 'completed' : 'failed',
        gatewayRefundId: gatewayResult.refundId,
        updatedAt: new Date()
      })

      // If successful, update original transaction
      if (gatewayResult.success) {
        await updateDoc(originalTransaction.ref, {
          status: 'refunded',
          updatedAt: new Date()
        })
      }

      const updatedRefund = await getDoc(refundRef)
      return {
        id: updatedRefund.id,
        ...updatedRefund.data()
      } as RefundTransaction

    } catch (error) {
      console.error('Error processing refund:', error)
      throw new Error(`Refund processing failed: ${(error as any).message}`)
    }
  }

  // Get payment gateway for method
  private getGatewayForMethod(method: string): string {
    const gateways = {
      'credit_card': 'stripe',
      'mobile_money': 'flutterwave',
      'bank_transfer': 'razorpay'
    }
    return (gateways as any)[method] || 'default'
  }

  // Process credit card payment
  private async processCreditCardPayment(orderData: any, transactionId: string) {
    // Integrate with Stripe or other credit card processor
    try {
      // Mock implementation for now
      console.log('Processing credit card payment via Stripe...')
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const success = Math.random() > 0.1 // 90% success rate
      
      return {
        success,
        transactionId: success ? `stripe_${Date.now()}` : null,
        metadata: {
          gateway: 'stripe',
          amount: orderData.amount,
          currency: orderData.currency
        }
      }
    } catch (error) {
      return {
        success: false,
        transactionId: null,
        metadata: { error: (error as any).message }
      }
    }
  }

  // Process mobile money payment
  private async processMobileMoneyPayment(orderData: any, transactionId: string) {
    try {
      console.log('Processing mobile money payment via Flutterwave...')
      
      // Simulate mobile money processing
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const success = Math.random() > 0.15 // 85% success rate
      
      return {
        success,
        transactionId: success ? `flw_${Date.now()}` : null,
        metadata: {
          gateway: 'flutterwave',
          amount: orderData.amount,
          currency: orderData.currency
        }
      }
    } catch (error) {
      return {
        success: false,
        transactionId: null,
        metadata: { error: (error as any).message }
      }
    }
  }

  // Process bank transfer payment
  private async processBankTransferPayment(orderData: any, transactionId: string) {
    try {
      console.log('Processing bank transfer via Razorpay...')
      
      // Simulate bank transfer processing
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const success = Math.random() > 0.05 // 95% success rate
      
      return {
        success,
        transactionId: success ? `razorpay_${Date.now()}` : null,
        metadata: {
          gateway: 'razorpay',
          amount: orderData.amount,
          currency: orderData.currency
        }
      }
    } catch (error) {
      return {
        success: false,
        transactionId: null,
        metadata: { error: (error as any).message }
      }
    }
  }

  // Process gateway refund
  private async processGatewayRefund(transaction: PaymentTransaction, amount: number) {
    try {
      console.log(`Processing refund via ${transaction.gateway}...`)
      
      // Simulate refund processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const success = Math.random() > 0.1 // 90% success rate
      
      return {
        success,
        refundId: success ? `refund_${Date.now()}` : null
      }
    } catch (error) {
      return {
        success: false,
        refundId: null
      }
    }
  }

  // Get transaction by ID
  async getTransaction(transactionId: string): Promise<PaymentTransaction | null> {
    try {
      const transactionRef = doc(db, this.TRANSACTIONS_COLLECTION, transactionId)
      const transactionDoc = await getDoc(transactionRef)
      
      if (transactionDoc.exists()) {
        return {
          id: transactionDoc.id,
          ...transactionDoc.data()
        } as PaymentTransaction
      }
      
      return null
    } catch (error) {
      console.error('Error getting transaction:', error)
      throw new Error('Failed to get transaction')
    }
  }

  // Get transactions for user
  async getUserTransactions(userId: string): Promise<PaymentTransaction[]> {
    try {
      const { collection: firestoreCollection, query, where, orderBy, getDocs } = await import('firebase/firestore')
      
      const transactionsRef = firestoreCollection(db, this.TRANSACTIONS_COLLECTION)
      const q = query(
        transactionsRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PaymentTransaction[]
      
    } catch (error) {
      console.error('Error getting user transactions:', error)
      throw new Error('Failed to get user transactions')
    }
  }
}

export const paymentService = new PaymentService()
