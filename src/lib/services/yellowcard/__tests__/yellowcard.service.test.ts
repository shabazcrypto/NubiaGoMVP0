import { YellowCardService } from '../yellowcard.service';
import { db } from '@/lib/firebase/admin';
import crypto from 'crypto';
import { mockFirestoreDoc, mockQuerySnapshot, setupTestEnv } from '@/lib/__tests__/test-utils';

// Mock Firebase
jest.mock('@/lib/firebase/admin', () => ({
  db: {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    startAfter: jest.fn().mockReturnThis(),
  },
}));

describe('YellowCardService', () => {
  let service: YellowCardService;
  const mockUserId = 'test-user-123';
  const mockPaymentId = 'pay-123';
  const mockOrderId = 'order-123';
  
  const mockPaymentData = {
    id: mockPaymentId,
    userId: mockUserId,
    orderId: mockOrderId,
    amount: 1000,
    currency: 'NGN',
    status: 'pending',
    providerId: 'mtn-ng',
    providerName: 'MTN Mobile Money',
    phoneNumber: '08012345678',
    country: 'NG',
    reference: 'YC-123456',
    paymentUrl: 'https://payment.yellowcard.io/pay/pay-123',
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(() => {
    setupTestEnv();
    service = new YellowCardService();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPayment', () => {
    it('should create a new payment', async () => {
      const paymentData = {
        userId: mockUserId,
        orderId: mockOrderId,
        amount: 1000,
        currency: 'NGN',
        providerId: 'mtn-ng',
        providerName: 'MTN Mobile Money',
        phoneNumber: '08012345678',
        country: 'NG',
      };

      // Mock Firestore document creation
      const docRef = { id: mockPaymentId };
      (db.set as jest.Mock).mockResolvedValueOnce(docRef);

      const result = await service.createPayment(paymentData);

      expect(db.collection).toHaveBeenCalledWith('yellowcard_payments');
      expect(db.doc).toHaveBeenCalled();
      expect(db.set).toHaveBeenCalledWith(
        expect.objectContaining({
          ...paymentData,
          status: 'pending',
          reference: expect.any(String),
          paymentUrl: expect.any(String),
          expiresAt: expect.any(Date),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      );

      expect(result).toEqual({
        ...paymentData,
        id: mockPaymentId,
        status: 'pending',
        reference: expect.any(String),
        paymentUrl: expect.any(String),
        expiresAt: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('getPaymentById', () => {
    it('should retrieve a payment by ID', async () => {
      // Mock Firestore document
      (db.get as jest.Mock).mockResolvedValueOnce(
        mockFirestoreDoc(mockPaymentData)
      );

      const result = await service.getPaymentById(mockPaymentId);

      expect(db.collection).toHaveBeenCalledWith('yellowcard_payments');
      expect(db.doc).toHaveBeenCalledWith(mockPaymentId);
      expect(db.get).toHaveBeenCalled();
      expect(result).toEqual(mockPaymentData);
    });

    it('should return null if payment does not exist', async () => {
      // Mock non-existent document
      (db.get as jest.Mock).mockResolvedValueOnce(mockFirestoreDoc(null, false));

      const result = await service.getPaymentById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status', async () => {
      const updateData = {
        status: 'completed',
        providerReference: 'MTN-789012',
        metadata: { confirmedAt: new Date().toISOString() },
      };

      // Mock Firestore document and update
      (db.get as jest.Mock).mockResolvedValueOnce(
        mockFirestoreDoc(mockPaymentData)
      );
      (db.update as jest.Mock).mockResolvedValueOnce({});

      const result = await service.updatePaymentStatus(
        mockPaymentId,
        updateData.status,
        updateData.providerReference,
        updateData.metadata
      );

      expect(db.collection).toHaveBeenCalledWith('yellowcard_payments');
      expect(db.doc).toHaveBeenCalledWith(mockPaymentId);
      expect(db.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: updateData.status,
          providerReference: updateData.providerReference,
          metadata: expect.objectContaining(updateData.metadata),
          updatedAt: expect.any(Date),
        })
      );
      expect(result).toBe(true);
    });
  });

  describe('getPaymentsByUser', () => {
    it('should retrieve payments for a user', async () => {
      const mockPayments = [
        { ...mockPaymentData, id: 'pay-1' },
        { ...mockPaymentData, id: 'pay-2', status: 'completed' },
      ];

      // Mock Firestore query
      (db.get as jest.Mock).mockResolvedValueOnce(
        mockQuerySnapshot(mockPayments)
      );

      const result = await service.getPaymentsByUser(mockUserId, 10, null);

      expect(db.collection).toHaveBeenCalledWith('yellowcard_payments');
      expect(db.where).toHaveBeenCalledWith('userId', '==', mockUserId);
      expect(db.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(db.limit).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockPayments);
    });
  });

  describe('calculateFees', () => {
    it('should calculate fees correctly', () => {
      const amount = 10000; // 100.00 NGN
      const expectedFees = {
        percentage: 150, // 1.5% of 10000
        fixed: 100, // Fixed fee
        total: 250, // 150 + 100
        totalAmount: 10250, // 10000 + 250
      };

      const result = service.calculateFees(amount);

      expect(result).toEqual(expectedFees);
    });
  });

  describe('isPaymentExpired', () => {
    it('should return true if payment is expired', () => {
      const expiredDate = new Date(Date.now() - 1000 * 60 * 31); // 31 minutes ago
      const result = service.isPaymentExpired(expiredDate);
      expect(result).toBe(true);
    });

    it('should return false if payment is not expired', () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 29); // 29 minutes in the future
      const result = service.isPaymentExpired(futureDate);
      expect(result).toBe(false);
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should verify a valid signature', () => {
      const timestamp = Date.now();
      const payload = JSON.stringify({ event: 'test', data: { id: '123' } });
      const secret = 'test-secret';
      
      const signature = crypto
        .createHmac('sha256', secret)
        .update(`${timestamp}${payload}`)
        .digest('hex');

      const result = (service as any).verifyWebhookSignature(
        payload,
        signature,
        timestamp.toString(),
        secret
      );

      expect(result).toBe(true);
    });

    it('should reject an invalid signature', () => {
      const result = (service as any).verifyWebhookSignature(
        JSON.stringify({ event: 'test' }),
        'invalid-signature',
        Date.now().toString(),
        'test-secret'
      );

      expect(result).toBe(false);
    });
  });
});
