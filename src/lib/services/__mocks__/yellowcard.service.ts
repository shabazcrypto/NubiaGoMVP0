// src/lib/services/__mocks__/yellowcard.service.ts

import { YellowCardService } from '../yellowcard.service';
import { MobileMoneyProvider, YellowCardPaymentRequest, YellowCardPaymentResponse, ExchangeRate, WalletTransaction } from '../yellowcard.service';

// Mock data
const MOCK_CONFIG = {
  id: 'config-123',
  apiKey: 'mock-api-key',
  apiSecret: 'mock-api-secret',
  merchantId: 'mock-merchant-123',
  webhookSecret: 'mock-webhook-secret',
  environment: 'sandbox',
  destinationWallet: 'mock-wallet-123',
  defaultCurrency: 'USD',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const MOCK_PROVIDERS: MobileMoneyProvider[] = [
  {
    id: 'provider-1',
    countryCode: 'NG',
    countryName: 'Nigeria',
    region: 'west_africa',
    providerName: 'MTN Mobile Money',
    providerCode: 'MTN',
    providerType: 'mobile_money',
    currencyCode: 'NGN',
    minAmount: 100,
    maxAmount: 5000000,
    phoneFormat: '^\+234[7-9][0-1]\d{8}$',
    isActive: true,
  },
  {
    id: 'provider-2',
    countryCode: 'KE',
    countryName: 'Kenya',
    region: 'east_africa',
    providerName: 'M-Pesa',
    providerCode: 'MPESA',
    providerType: 'mobile_money',
    currencyCode: 'KES',
    minAmount: 10,
    maxAmount: 1000000,
    phoneFormat: '^\+2547\d{8}$',
    isActive: true,
  },
  // Add more mock providers as needed
];

const MOCK_EXCHANGE_RATES: Record<string, number> = {
  'NGN_USDC': 0.00067,
  'KES_USDC': 0.0067,
  'GHS_USDC': 0.08,
  'ZAR_USDC': 0.054,
  'USD_USDC': 1,
};

export class MockYellowCardService extends YellowCardService {
  private mockPayments: Record<string, any> = {};
  private lastPaymentId = 0;

  constructor() {
    super();
    // Initialize with mock data
    this['config'] = MOCK_CONFIG;
    this['baseUrl'] = 'https://api.sandbox.yellowcard.io/v1';
  }

  // Override methods with mock implementations
  async getSupportedCountries(): Promise<{ [region: string]: MobileMoneyProvider[] }> {
    return MOCK_PROVIDERS.reduce((acc, provider) => {
      if (!acc[provider.region]) {
        acc[provider.region] = [];
      }
      acc[provider.region].push(provider);
      return acc;
    }, {} as { [region: string]: MobileMoneyProvider[] });
  }

  async getProvidersByCountry(countryCode: string): Promise<MobileMoneyProvider[]> {
    return MOCK_PROVIDERS.filter(
      p => p.countryCode === countryCode.toUpperCase() && p.isActive
    );
  }

  async getExchangeRate(fromCurrency: string, toCurrency: string = 'USDC'): Promise<number> {
    const rate = MOCK_EXCHANGE_RATES[`${fromCurrency}_${toCurrency}`];
    if (!rate) {
      throw new Error(`No exchange rate found for ${fromCurrency} to ${toCurrency}`);
    }
    return rate;
  }

  async initiatePayment(paymentRequest: YellowCardPaymentRequest): Promise<YellowCardPaymentResponse> {
    // Validate required fields
    if (!paymentRequest.amount || !paymentRequest.currency || !paymentRequest.customerPhone) {
      return {
        success: false,
        message: 'Missing required payment details',
      };
    }

    // Check if provider is valid
    const providers = await this.getProvidersByCountry(paymentRequest.countryCode);
    const provider = providers.find(p => p.providerCode === paymentRequest.providerCode);
    
    if (!provider) {
      return {
        success: false,
        message: `Provider ${paymentRequest.providerCode} not supported in ${paymentRequest.countryCode}`,
      };
    }

    // Check amount limits
    if (paymentRequest.amount < provider.minAmount || paymentRequest.amount > provider.maxAmount) {
      return {
        success: false,
        message: `Amount must be between ${provider.minAmount} and ${provider.maxAmount} ${provider.currencyCode}`,
      };
    }

    // Generate mock payment ID and URL
    const paymentId = `mock_pay_${++this.lastPaymentId}`;
    const paymentUrl = `https://checkout.yellowcard.io/mock/pay/${paymentId}`;
    
    // Get exchange rate
    let exchangeRate = 1;
    let usdcAmount = paymentRequest.amount;
    
    try {
      exchangeRate = await this.getExchangeRate(paymentRequest.currency, 'USDC');
      usdcAmount = paymentRequest.amount * exchangeRate;
    } catch (error) {
      console.warn('Failed to get exchange rate, using 1:1', error);
    }

    // Store the payment for later reference
    this.mockPayments[paymentId] = {
      ...paymentRequest,
      paymentId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      exchangeRate,
      usdcAmount,
    };

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      data: {
        paymentId,
        paymentUrl,
        transactionId: `mock_tx_${Date.now()}`,
        status: 'pending',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        exchangeRate,
        usdcAmount,
      },
      message: 'Payment initiated successfully',
      reference: paymentId,
    };
  }

  async checkPaymentStatus(paymentId: string): Promise<{
    status: string;
    transactionHash?: string;
    completedAt?: string;
    failureReason?: string;
  }> {
    const payment = this.mockPayments[paymentId];
    
    if (!payment) {
      throw new Error('Payment not found');
    }

    // Simulate payment completion after some time
    if (payment.status === 'pending' && Math.random() > 0.7) {
      payment.status = 'completed';
      payment.completedAt = new Date();
      payment.transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    }

    return {
      status: payment.status,
      transactionHash: payment.transactionHash,
      completedAt: payment.completedAt?.toISOString(),
    };
  }

  // Helper method to simulate webhook call
  async simulateWebhook(paymentId: string, status: 'completed' | 'failed' = 'completed'): Promise<void> {
    const payment = this.mockPayments[paymentId];
    if (!payment) {
      throw new Error('Payment not found');
    }

    payment.status = status;
    payment.updatedAt = new Date();
    
    if (status === 'completed') {
      payment.completedAt = new Date();
      payment.transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    } else {
      payment.failureReason = 'Simulated payment failure';
    }
  }

  // Reset mock data between tests
  resetMocks(): void {
    this.mockPayments = {};
    this.lastPaymentId = 0;
  }
}

// Create a singleton instance
export const mockYellowCardService = new MockYellowCardService();

// For testing with Jest
jest.mock('../yellowcard.service', () => ({
  YellowCardService: MockYellowCardService,
  yellowCardService: mockYellowCardService,
}));
