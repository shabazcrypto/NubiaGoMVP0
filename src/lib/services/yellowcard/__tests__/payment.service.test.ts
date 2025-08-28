import { PaymentService } from '../payment.service';
import { db } from '@/lib/firebase/admin';

// Mock the Firestore methods
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

describe('PaymentService', () => {
  let paymentService: PaymentService;
  const mockPayment = {
    id: 'test-payment-1',
    userId: 'user-123',
    amount: 1000,
    currency: 'NGN',
    status: 'pending',
    provider: 'mtn-ng',
    phoneNumber: '08012345678',
    reference: 'YC-123456',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    paymentService = new PaymentService();
  });

  describe('createPayment', () => {
    it('should create a new payment', async () => {
      const paymentData = {
        userId: 'user-123',
        amount: 1000,
        currency: 'NGN',
        provider: 'mtn-ng',
        phoneNumber: '08012345678',
        reference: 'YC-123456',
      };

      (db.set as jest.Mock).mockResolvedValueOnce({ id: 'test-payment-1' });

      const result = await paymentService.createPayment(paymentData);

      expect(db.collection).toHaveBeenCalledWith('yellowcard_payments');
      expect(db.doc).toHaveBeenCalledWith(expect.any(String));
      expect(db.set).toHaveBeenCalledWith(expect.objectContaining({
        ...paymentData,
        status: 'pending',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }));
      expect(result.id).toBe('test-payment-1');
    });
  });

  describe('getPaymentById', () => {
    it('should retrieve a payment by ID', async () => {
      const mockDoc = {
        exists: true,
        id: 'test-payment-1',
        data: () => mockPayment,
      };

      (db.get as jest.Mock).mockResolvedValueOnce(mockDoc);

      const result = await paymentService.getPaymentById('test-payment-1');

      expect(db.collection).toHaveBeenCalledWith('yellowcard_payments');
      expect(db.doc).toHaveBeenCalledWith('test-payment-1');
      expect(db.get).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        id: 'test-payment-1',
        ...mockPayment,
      }));
    });

    it('should return null if payment does not exist', async () => {
      (db.get as jest.Mock).mockResolvedValueOnce({ exists: false });

      const result = await paymentService.getPaymentById('non-existent-payment');

      expect(result).toBeNull();
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status', async () => {
      const paymentId = 'test-payment-1';
      const updates = { status: 'completed', providerReference: 'MTN-123' };

      await paymentService.updatePaymentStatus(paymentId, updates);

      expect(db.collection).toHaveBeenCalledWith('yellowcard_payments');
      expect(db.doc).toHaveBeenCalledWith(paymentId);
      expect(db.update).toHaveBeenCalledWith({
        ...updates,
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('getPaymentsByUser', () => {
    it('should retrieve payments for a user', async () => {
      const mockSnapshot = {
        docs: [
          { id: 'pay-1', data: () => ({ userId: 'user-123', amount: 1000 }) },
          { id: 'pay-2', data: () => ({ userId: 'user-123', amount: 2000 }) },
        ],
      };

      (db.get as jest.Mock).mockResolvedValueOnce(mockSnapshot);

      const result = await paymentService.getPaymentsByUser('user-123', 10);

      expect(db.collection).toHaveBeenCalledWith('yellowcard_payments');
      expect(db.where).toHaveBeenCalledWith('userId', '==', 'user-123');
      expect(db.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(db.limit).toHaveBeenCalledWith(10);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('pay-1');
      expect(result[1].id).toBe('pay-2');
    });
  });

  describe('calculateFees', () => {
    it('should calculate fixed fee correctly', () => {
      const amount = 10000; // 100.00 NGN
      const fee = paymentService.calculateFees(amount, 'fixed');
      expect(fee).toBe(100); // Fixed fee of 100 kobo (1 NGN)
    });

    it('should calculate percentage fee correctly', () => {
      const amount = 10000; // 100.00 NGN
      const fee = paymentService.calculateFees(amount, 'percentage');
      expect(fee).toBe(150); // 1.5% of 10000 = 150 kobo (1.50 NGN)
    });

    it('should use default fee type if not specified', () => {
      const amount = 10000;
      const fee = paymentService.calculateFees(amount);
      expect(fee).toBe(100); // Default is fixed fee
    });
  });

  describe('isPaymentExpired', () => {
    it('should return true if payment is expired', () => {
      const oldDate = new Date();
      oldDate.setMinutes(oldDate.getMinutes() - 31); // 31 minutes ago
      
      const isExpired = paymentService.isPaymentExpired(oldDate);
      expect(isExpired).toBe(true);
    });

    it('should return false if payment is not expired', () => {
      const recentDate = new Date();
      recentDate.setMinutes(recentDate.getMinutes() - 15); // 15 minutes ago
      
      const isExpired = paymentService.isPaymentExpired(recentDate);
      expect(isExpired).toBe(false);
    });
  });
});
