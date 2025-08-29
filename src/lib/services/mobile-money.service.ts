import {
  MobileMoneyProvider,
  MobileMoneyTransaction,
  MobileMoneyConfig,
  InitiatePaymentResponse,
  PaymentStatusResponse,
  WebhookPayload,
} from '@/types/mobile-money';

class MobileMoneyService {
  private config: Required<MobileMoneyConfig>;
  private baseHeaders: Record<string, string>;

  constructor(config: MobileMoneyConfig) {
    this.config = {
      timeout: 30000,
      defaultCurrency: 'USD',
      ...config,
    };

    this.baseHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...this.baseHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Request failed with status ${response.status}`
        );
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        throw new Error(`Mobile Money API error: ${error.message}`);
      }
      throw new Error('Unknown error occurred while calling Mobile Money API');
    }
  }

  async initiatePayment(
    transaction: Omit<MobileMoneyTransaction, 'id' | 'status' | 'createdAt'>
  ): Promise<InitiatePaymentResponse> {
    return this.request<InitiatePaymentResponse>('/payments/initiate', {
      method: 'POST',
      body: JSON.stringify({
        ...transaction,
        currency: transaction.currency || this.config.defaultCurrency,
      }),
    });
  }

  async checkStatus(transactionId: string): Promise<PaymentStatusResponse> {
    return this.request<PaymentStatusResponse>(`/payments/${transactionId}/status`);
  }

  async getOperators(country: string): Promise<MobileMoneyProvider[]> {
    return this.request<MobileMoneyProvider[]>(`/operators?country=${encodeURIComponent(country)}`);
  }

  async handleWebhook(payload: unknown, signature?: string): Promise<{ success: boolean }> {
    if (this.config.webhookSecret && !this.verifyWebhookSignature(payload, signature || '')) {
      throw new Error('Invalid webhook signature');
    }

    const webhookPayload = payload as WebhookPayload;
    // Process the webhook payload here
    console.log('Processing webhook:', webhookPayload);
    
    return { success: true };
  }

  private verifyWebhookSignature(payload: unknown, signature: string): boolean {
    if (!this.config.webhookSecret) return true; // Skip verification if no secret is set
    
    // Implement your signature verification logic here
    // This is a placeholder implementation
    const expectedSignature = this.generateSignature(JSON.stringify(payload));
    return expectedSignature === signature;
  }

  private async generateSignature(data: string): Promise<string> {
    // Implement your signature generation logic here
    // This is a placeholder implementation
    const { createHmac } = await import('crypto');
    return createHmac('sha256', this.config.webhookSecret!)
      .update(data)
      .digest('hex');
  }
}

// Create a singleton instance
export const mobileMoneyService = new MobileMoneyService({
  apiKey: process.env.MOBILE_MONEY_API_KEY || '',
  baseUrl: process.env.MOBILE_MONEY_API_URL || 'https://api.mobilemoney.example.com',
  webhookSecret: process.env.MOBILE_MONEY_WEBHOOK_SECRET,
});

export default mobileMoneyService;
