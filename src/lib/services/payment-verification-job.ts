import { mobileMoneyService } from './mobile-money.service'

export class PaymentVerificationJob {
  private isRunning = false
  private intervalId: NodeJS.Timeout | null = null

  // Start the payment verification job
  start() {
    if (this.isRunning) {
      // Payment verification job is already running - logging removed for production
      return
    }

    // Starting payment verification job - logging removed for production
    this.isRunning = true

    // Run every 2 minutes
    this.intervalId = setInterval(async () => {
      await this.verifyPendingPayments()
    }, 2 * 60 * 1000) // 2 minutes

    // Run immediately on start
    this.verifyPendingPayments()
  }

  // Stop the payment verification job
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    // Payment verification job stopped - logging removed for production
  }

  // Verify all pending payments
  private async verifyPendingPayments() {
    try {
      // Running payment verification job - logging removed for production
      
      const allPayments = await mobileMoneyService.getAllPayments()
      
      // Get payments that are pending and older than 5 minutes
      const pendingPayments = allPayments.filter(payment => {
        if (payment.status !== 'pending') return false
        
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
        if (payment.createdAt < fiveMinutesAgo) return true
        
        // Don't check too frequently
        if (payment.lastVerificationCheck) {
          const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)
          return payment.lastVerificationCheck < twoMinutesAgo
        }
        
        return true
      })

      // Found payments to verify - logging removed for production

      // Process payments in batches to avoid overwhelming the system
      const batchSize = 10
      for (let i = 0; i < pendingPayments.length; i += batchSize) {
        const batch = pendingPayments.slice(i, i + batchSize)
        
        await Promise.all(
          batch.map(payment => this.verifyIndividualPayment(payment))
        )
        
        // Small delay between batches
        if (i + batchSize < pendingPayments.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    } catch (error) {
      // Payment verification job failed - logging removed for production
    }
  }

  // Verify individual payment
  private async verifyIndividualPayment(payment: any) {
    try {
      // Update last verification check timestamp
      payment.lastVerificationCheck = new Date()
      payment.updatedAt = new Date()

      // Verify payment with gateway
      if (payment.gatewayTransactionId) {
        const verification = await mobileMoneyService.getPaymentStatus(payment.id)
        
        if (verification) {
          // Payment status check - logging removed for production
          
          // If payment is completed, update order status
          if (verification.status === 'completed') {
            await this.updateOrderStatus(payment.orderId, 'paid')
            // Order marked as paid - logging removed for production
          }
        }
      }

      // Check if payment has expired
      if (this.isPaymentExpired(payment)) {
        payment.status = 'expired'
        payment.updatedAt = new Date()
        // Payment marked as expired - logging removed for production
      }
    } catch (error) {
      // Failed to verify payment - logging removed for production
    }
  }

  // Check if payment has expired
  private isPaymentExpired(payment: any): boolean {
    const hoursSinceCreation = (Date.now() - payment.createdAt.getTime()) / (1000 * 60 * 60)
    return hoursSinceCreation > 24 // Expire after 24 hours
  }

  // Update order status (placeholder for integration with order service)
  private async updateOrderStatus(orderId: string, status: string) {
    try {
      // TODO: Integrate with your existing order service
      // await orderService.updatePaymentStatus(orderId, status)
      
      // Order payment status updated - logging removed for production
    } catch (error) {
      // Failed to update order status - logging removed for production
    }
  }

  // Get job status
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalId: this.intervalId ? 'active' : 'inactive'
    }
  }

  // Manually trigger verification for a specific payment
  async verifyPayment(paymentId: string) {
    try {
      const payment = await mobileMoneyService.getPaymentStatus(paymentId)
      if (payment) {
        await this.verifyIndividualPayment(payment)
        return { success: true, message: 'Payment verification completed' }
      } else {
        return { success: false, message: 'Payment not found' }
      }
    } catch (error) {
      return { 
        success: false, 
        message: 'Payment verification failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Create singleton instance
export const paymentVerificationJob = new PaymentVerificationJob()

// Start the job when the module is imported (for development)
if (process.env.NODE_ENV === 'development') {
  // Only start in development to avoid multiple instances
  setTimeout(() => {
    paymentVerificationJob.start()
  }, 5000) // Start after 5 seconds
}
