import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from '@/lib/firebase/firebase-admin';
import { createCSRFHash } from '@/lib/security/server-csrf';
import { yellowCardService } from '@/lib/services/yellowcard.service';

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
  try {
    const hmac = createCSRFHash(secret, payload);
    return timingSafeEqual(hmac, signature);
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

// Helper function for timing-safe comparison
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-yellowcard-signature');
    const payload = await request.text();

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Get the webhook secret from environment variables
    const webhookSecret = process.env.YELLOWCARD_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('YELLOWCARD_WEBHOOK_SECRET is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Verify the webhook signature
    if (!verifyWebhookSignature(payload, signature, webhookSecret)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(payload);
    
    // Process the webhook event
    await yellowCardService.handleWebhookEvent(event);

    // Save the webhook event to Firestore
    await db.collection(PAYMENTS_COLLECTION).add({
      ...event,
      processedAt: new Date().toISOString(),
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
}
