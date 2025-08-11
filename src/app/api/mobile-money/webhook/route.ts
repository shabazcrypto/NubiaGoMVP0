import { NextRequest, NextResponse } from 'next/server'
import { mobileMoneyService } from '@/lib/services/mobile-money.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Mobile Money Webhook received:', {
      timestamp: new Date().toISOString(),
      body: body
    })

    // Verify webhook signature (in production, implement proper signature verification)
    // const signature = request.headers.get('verif-hash')
    // if (!signature || signature !== process.env.MOBILE_MONEY_WEBHOOK_SECRET) {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    // }

    // Process webhook based on event type
    const eventType = body.event || body.type || 'unknown'
    
    switch (eventType) {
      case 'charge.completed':
      case 'payment.success':
      case 'transaction.success':
        // Payment completed successfully
        await processPaymentCompletion(body.data || body)
        break
        
      case 'charge.failed':
      case 'payment.failed':
      case 'transaction.failed':
        // Payment failed
        await processPaymentFailure(body.data || body)
        break
        
      case 'charge.pending':
      case 'payment.pending':
      case 'transaction.pending':
        // Payment still pending
        await processPaymentPending(body.data || body)
        break
        
      default:
        console.log(`Unhandled webhook event type: ${eventType}`)
        break
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    })
    
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Webhook processing failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function processPaymentCompletion(data: any) {
  try {
    console.log('Processing payment completion:', data)
    
    // Extract transaction reference
    const transactionRef = data.tx_ref || data.reference || data.transaction_id
    
    if (!transactionRef) {
      console.error('No transaction reference found in webhook data')
      return
    }

    // Find payment by transaction reference
    const payments = await mobileMoneyService.getAllPayments()
    const payment = payments.find(p => p.gatewayTransactionId === transactionRef)
    
    if (payment) {
      // Update payment status
      payment.status = 'completed'
      payment.completedAt = new Date()
      payment.updatedAt = new Date()
      payment.gatewayResponse = data
      
      console.log(`Payment ${payment.id} completed via webhook`)
      
      // TODO: Update order status in your order management system
      // await orderService.updatePaymentStatus(payment.orderId, 'paid')
      
      // TODO: Send customer notification
      // await notificationService.sendPaymentSuccess(payment)
    } else {
      console.log(`Payment not found for transaction reference: ${transactionRef}`)
    }
  } catch (error) {
    console.error('Error processing payment completion:', error)
  }
}

async function processPaymentFailure(data: any) {
  try {
    console.log('Processing payment failure:', data)
    
    const transactionRef = data.tx_ref || data.reference || data.transaction_id
    
    if (!transactionRef) {
      console.error('No transaction reference found in webhook data')
      return
    }

    const payments = await mobileMoneyService.getAllPayments()
    const payment = payments.find(p => p.gatewayTransactionId === transactionRef)
    
    if (payment) {
      payment.status = 'failed'
      payment.updatedAt = new Date()
      payment.gatewayResponse = data
      
      console.log(`Payment ${payment.id} marked as failed via webhook`)
      
      // TODO: Update order status
      // await orderService.updatePaymentStatus(payment.orderId, 'payment_failed')
      
      // TODO: Send customer notification
      // await notificationService.sendPaymentFailure(payment)
    }
  } catch (error) {
    console.error('Error processing payment failure:', error)
  }
}

async function processPaymentPending(data: any) {
  try {
    console.log('Processing payment pending:', data)
    
    const transactionRef = data.tx_ref || data.reference || data.transaction_id
    
    if (!transactionRef) {
      console.error('No transaction reference found in webhook data')
      return
    }

    const payments = await mobileMoneyService.getAllPayments()
    const payment = payments.find(p => p.gatewayTransactionId === transactionRef)
    
    if (payment) {
      payment.status = 'pending'
      payment.updatedAt = new Date()
      payment.gatewayResponse = data
      
      console.log(`Payment ${payment.id} status updated to pending via webhook`)
    }
  } catch (error) {
    console.error('Error processing payment pending:', error)
  }
}
