import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import * as yellowCardAPI from '@/lib/api/yellowcard.api';
import { db } from '@/lib/firebase/admin';

// Mock the yellowcard API and Firebase
jest.mock('@/lib/api/yellowcard.api');
jest.mock('@/lib/firebase/admin', () => ({
  db: {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    set: jest.fn(),
    get: jest.fn(),
  },
}));

describe('YellowCard Payment API', () => {
  const mockUserId = 'test-user-123';
  const mockToken = 'test-token-123';
  
  // Mock Firebase Auth
  const mockVerifyIdToken = jest.fn();
  jest.mock('firebase-admin/auth', () => ({
    getAuth: () => ({
      verifyIdToken: mockVerifyIdToken,
    }),
  }));

  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyIdToken.mockResolvedValue({ uid: mockUserId });
  });

  describe('POST /api/yellowcard/payment', () => {
    it('should initiate a payment successfully', async () => {
      const paymentData = {
        amount: 1000,
        currency: 'NGN',
        providerId: 'mtn-ng',
        phoneNumber: '08012345678',
        country: 'ng',
        orderId: 'order-123',
      };

      const mockPaymentResponse = {
        success: true,
        data: {
          paymentId: 'pay-123',
          paymentUrl: 'https://payment.yellowcard.io/pay/pay-123',
          status: 'pending',
          ...paymentData,
        },
      };

      (yellowCardAPI.POST_InitiatePayment as jest.Mock).mockResolvedValue(mockPaymentResponse);

      const req = new NextRequest('http://localhost/api/yellowcard/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockToken}`,
        },
        body: JSON.stringify(paymentData),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: expect.objectContaining({
          paymentId: 'pay-123',
          paymentUrl: expect.any(String),
          status: 'pending',
        }),
      });
      
      expect(yellowCardAPI.POST_InitiatePayment).toHaveBeenCalledWith(
        { ...paymentData, userId: mockUserId },
        expect.any(Object)
      );
    });

    it('should return 400 for invalid request body', async () => {
      const req = new NextRequest('http://localhost/api/yellowcard/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockToken}`,
        },
        body: JSON.stringify({}), // Missing required fields
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe('GET /api/yellowcard/payment', () => {
    it('should retrieve payment status successfully', async () => {
      const paymentId = 'pay-123';
      const mockPayment = {
        id: paymentId,
        status: 'completed',
        amount: 1000,
        currency: 'NGN',
        userId: mockUserId,
        provider: 'mtn-ng',
        phoneNumber: '08012345678',
        reference: 'YC-123456',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (db.get as jest.Mock).mockResolvedValueOnce({
        exists: true,
        data: () => mockPayment,
      });

      const req = new NextRequest(`http://localhost/api/yellowcard/payment?paymentId=${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
        },
      });

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: expect.objectContaining({
          id: paymentId,
          status: 'completed',
          amount: 1000,
          currency: 'NGN',
        }),
      });

      expect(db.collection).toHaveBeenCalledWith('yellowcard_payments');
      expect(db.doc).toHaveBeenCalledWith(paymentId);
    });

    it('should return 404 for non-existent payment', async () => {
      const paymentId = 'non-existent-payment';
      
      (db.get as jest.Mock).mockResolvedValueOnce({
        exists: false,
      });

      const req = new NextRequest(`http://localhost/api/yellowcard/payment?paymentId=${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
        },
      });

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Payment not found');
    });

    it('should return 403 for unauthorized access to payment', async () => {
      const paymentId = 'pay-123';
      const otherUserId = 'other-user-456';
      
      // Mock that the payment belongs to a different user
      (db.get as jest.Mock).mockResolvedValueOnce({
        exists: true,
        data: () => ({
          id: paymentId,
          userId: otherUserId, // Different user ID
          status: 'completed',
        }),
      });

      const req = new NextRequest(`http://localhost/api/yellowcard/payment?paymentId=${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
        },
      });

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });
  });
});
