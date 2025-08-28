import { NextRequest } from 'next/server';
import { POST } from '../route';
import { db } from '@/lib/firebase/admin';
import crypto from 'crypto';

// Mock Firebase
jest.mock('@/lib/firebase/admin', () => ({
  db: {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn(),
    update: jest.fn(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
  },
}));

describe('YellowCard Webhook Handler', () => {
  const webhookSecret = 'test-webhook-secret';
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    // Save original process.env
    originalEnv = process.env;
    process.env.YELLOWCARD_WEBHOOK_SECRET = webhookSecret;
  });

  afterAll(() => {
    // Restore original process.env
    process.env = originalEnv;
  });

  const createSignedRequest = (body: any) => {
    const timestamp = Date.now();
    const payload = JSON.stringify(body);
    
    const signature = crypto
      .createHmac('sha256', webhookSecret)
      .update(`${timestamp}${payload}`)
      .digest('hex');

    return new NextRequest('http://localhost/api/yellowcard/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-yellowcard-signature': signature,
        'x-yellowcard-timestamp': timestamp.toString(),
      },
      body: payload,
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle payment.completed event', async () => {
    const paymentId = 'pay-123';
    const webhookEvent = {
      event: 'payment.completed',
      data: {
        id: paymentId,
        status: 'completed',
        amount: 1000,
        currency: 'NGN',
        reference: 'YC-123456',
        provider_reference: 'MTN-789012',
        metadata: {
          orderId: 'order-123',
        },
      },
    };

    // Mock Firestore document
    (db.get as jest.Mock).mockResolvedValueOnce({
      exists: true,
      data: () => ({
        id: paymentId,
        status: 'pending',
        amount: 1000,
        currency: 'NGN',
        userId: 'user-123',
      }),
    });

    const req = createSignedRequest(webhookEvent);
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true, message: 'Webhook processed' });

    // Verify the payment was updated
    expect(db.collection).toHaveBeenCalledWith('yellowcard_payments');
    expect(db.doc).toHaveBeenCalledWith(paymentId);
    expect(db.update).toHaveBeenCalledWith({
      status: 'completed',
      providerReference: webhookEvent.data.provider_reference,
      updatedAt: expect.any(Date),
      metadata: expect.objectContaining({
        orderId: 'order-123',
      }),
    });
  });

  it('should handle payment.failed event', async () => {
    const paymentId = 'pay-456';
    const webhookEvent = {
      event: 'payment.failed',
      data: {
        id: paymentId,
        status: 'failed',
        amount: 1000,
        currency: 'NGN',
        reference: 'YC-789012',
        failure_reason: 'insufficient_funds',
        failure_code: 'INSUFFICIENT_FUNDS',
      },
    };

    // Mock Firestore document
    (db.get as jest.Mock).mockResolvedValueOnce({
      exists: true,
      data: () => ({
        id: paymentId,
        status: 'pending',
        amount: 1000,
        currency: 'NGN',
        userId: 'user-123',
      }),
    });

    const req = createSignedRequest(webhookEvent);
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true, message: 'Webhook processed' });

    // Verify the payment was updated with failure details
    expect(db.update).toHaveBeenCalledWith({
      status: 'failed',
      failureReason: 'insufficient_funds',
      failureCode: 'INSUFFICIENT_FUNDS',
      updatedAt: expect.any(Date),
    });
  });

  it('should return 400 for invalid signature', async () => {
    const webhookEvent = {
      event: 'payment.completed',
      data: {
        id: 'pay-123',
        status: 'completed',
      },
    };

    // Create a request with an invalid signature
    const req = new NextRequest('http://localhost/api/yellowcard/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-yellowcard-signature': 'invalid-signature',
        'x-yellowcard-timestamp': Date.now().toString(),
      },
      body: JSON.stringify(webhookEvent),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      success: false,
      error: 'Invalid signature',
    });
  });

  it('should return 400 for missing required headers', async () => {
    const webhookEvent = {
      event: 'payment.completed',
      data: {
        id: 'pay-123',
        status: 'completed',
      },
    };

    // Create a request with missing signature header
    const req = new NextRequest('http://localhost/api/yellowcard/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Missing x-yellowcard-signature
        'x-yellowcard-timestamp': Date.now().toString(),
      },
      body: JSON.stringify(webhookEvent),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      success: false,
      error: 'Missing required headers',
    });
  });

  it('should return 404 for non-existent payment', async () => {
    const paymentId = 'non-existent-payment';
    const webhookEvent = {
      event: 'payment.completed',
      data: {
        id: paymentId,
        status: 'completed',
        amount: 1000,
        currency: 'NGN',
      },
    };

    // Mock that the payment doesn't exist
    (db.get as jest.Mock).mockResolvedValueOnce({
      exists: false,
    });

    const req = createSignedRequest(webhookEvent);
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({
      success: false,
      error: 'Payment not found',
    });
  });
});
