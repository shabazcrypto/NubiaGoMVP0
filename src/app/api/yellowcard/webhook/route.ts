import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from '@/lib/firebase/firebase-admin';
import crypto from 'crypto';

// Initialize Firebase Admin if not already initialized
try {
  initializeFirebaseAdmin();
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
}

const db = getFirestore();
const PAYMENTS_COLLECTION = 'yellowcard_payments';

// Verify the webhook signature
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (process.env.NODE_ENV === 'development' && !signature) {
    console.warn('Skipping webhook signature verification in development mode');
    return true;
  }

  const hmac = crypto.createHmac('sha256', secret);
  const calculatedSignature = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedSignature)
  );
}

export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const payload = await request.text();
    const signature = request.headers.get('x-yellowcard-signature') || '';
    const webhookSecret = process.env.YELLOWCARD_WEBHOOK_SECRET || 'test-secret';

    // Verify webhook signature
    if (!verifyWebhookSignature(payload, signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const data = JSON.parse(payload);
    console.log('Received webhook:', JSON.stringify(data, null, 2));

    // Handle different webhook event types
    switch (data.event) {
      case 'payment.completed':
        await handlePaymentCompleted(data.data);
        break;
      case 'payment.failed':
        await handlePaymentFailed(data.data);
        break;
      case 'payment.expired':
        await handlePaymentExpired(data.data);
        break;
      default:
        console.warn('Unhandled webhook event type:', data.event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentCompleted(paymentData: any) {
  const paymentRef = db.collection(PAYMENTS_COLLECTION).doc(paymentData.id);
  const paymentDoc = await paymentRef.get();

  if (!paymentDoc.exists) {
    console.error('Payment not found:', paymentData.id);
    return;
  }

  const payment = paymentDoc.data();
  
  // Only update if not already completed to prevent duplicate processing
  if (payment.status !== 'completed') {
    await db.runTransaction(async (transaction) => {
      // Update payment status
      transaction.update(paymentRef, {
        status: 'completed',
        providerReference: paymentData.provider_reference,
        updatedAt: new Date().toISOString(),
        metadata: {
          ...payment.metadata,
          completedAt: new Date().toISOString(),
          providerData: paymentData,
        },
      });

      // TODO: Add your order processing logic here
      // Example: Update order status, send confirmation email, etc.
      // await processOrderCompletion(payment.orderId, paymentData);
    });

    console.log(`Payment ${paymentData.id} marked as completed`);
  }
}

async function handlePaymentFailed(paymentData: any) {
  const paymentRef = db.collection(PAYMENTS_COLLECTION).doc(paymentData.id);
  
  await paymentRef.update({
    status: 'failed',
    updatedAt: new Date().toISOString(),
    metadata: {
      failureReason: paymentData.failure_reason || 'Unknown failure',
      failedAt: new Date().toISOString(),
      providerData: paymentData,
    },
  });

  console.log(`Payment ${paymentData.id} marked as failed:`, paymentData.failure_reason);
  
  // TODO: Notify user of payment failure
  // await sendPaymentFailureNotification(paymentData.userId, paymentData);
}

async function handlePaymentExpired(paymentData: any) {
  const paymentRef = db.collection(PAYMENTS_COLLECTION).doc(paymentData.id);
  
  await paymentRef.update({
    status: 'expired',
    updatedAt: new Date().toISOString(),
    metadata: {
      expiredAt: new Date().toISOString(),
      providerData: paymentData,
    },
  });

  console.log(`Payment ${paymentData.id} marked as expired`);
  
  // TODO: Notify user of payment expiration
  // await sendPaymentExpiredNotification(paymentData.userId, paymentData);
}

// Prevent GET requests to webhook endpoint
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}
