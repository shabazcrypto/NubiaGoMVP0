export interface MobileMoneyProvider {
  id: string;
  name: string;
  country: string;
  logoUrl?: string;
  minAmount?: number;
  maxAmount?: number;
  currencies: string[];
  supportedNetworks?: string[];
}

export interface MobileMoneyTransaction {
  id: string;
  amount: number;
  currency: string;
  phoneNumber: string;
  provider: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  reference: string;
  metadata?: Record<string, any>;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface MobileMoneyConfig {
  apiKey: string;
  baseUrl: string;
  webhookSecret?: string;
  defaultCurrency?: string;
  timeout?: number;
}

export interface InitiatePaymentResponse {
  success: boolean;
  transactionId: string;
  paymentUrl?: string;
  message?: string;
}

export interface PaymentStatusResponse {
  status: string;
  transactionId: string;
  amount?: number;
  currency?: string;
  reference?: string;
  timestamp?: string;
}

export interface WebhookPayload {
  event: string;
  data: {
    transactionId: string;
    status: string;
    amount?: number;
    currency?: string;
    reference?: string;
    metadata?: Record<string, any>;
  };
  timestamp: string;
}
