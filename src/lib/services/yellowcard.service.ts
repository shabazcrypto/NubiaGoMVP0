import { db } from '@/lib/firebase/config'
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore'

// YellowCard API Types
export interface YellowCardConfig {
  id: string
  apiKey: string
  apiSecret: string
  merchantId: string
  webhookSecret: string
  environment: 'sandbox' | 'production'
  destinationWallet: string
  defaultCurrency: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface MobileMoneyProvider {
  id: string
  countryCode: string
  countryName: string
  region: 'west_africa' | 'central_africa' | 'east_africa' | 'southern_africa'
  providerName: string
  providerCode: string
  providerType: 'mobile_money' | 'bank_transfer' | 'instant_payment'
  currencyCode: string
  minAmount: number
  maxAmount: number
  phoneFormat: string
  isActive: boolean
}

export interface YellowCardPaymentRequest {
  orderId: string
  amount: number
  currency: string
  customerPhone: string
  customerEmail: string
  customerName: string
  countryCode: string
  providerCode: string
  redirectUrl: string
  webhookUrl: string
  metadata?: Record<string, any>
}

export interface YellowCardPaymentResponse {
  success: boolean
  data?: {
    paymentId: string
    paymentUrl: string
    transactionId: string
    status: string
    expiresAt: string
    exchangeRate?: number
    usdcAmount?: number
  }
  message: string
  reference?: string
}

export interface ExchangeRate {
  fromCurrency: string
  toCurrency: string
  rate: number
  updatedAt: Date
}

export interface WalletTransaction {
  id: string
  userId: string
  paymentId: string
  amount: number
  currency: string
  transactionType: 'payment' | 'refund' | 'conversion'
  balanceBefore: number
  balanceAfter: number
  description: string
  createdAt: Date
}

class YellowCardService {
  private readonly CONFIG_COLLECTION = 'yellowcard_config'
  private readonly PROVIDERS_COLLECTION = 'mobile_money_providers'
  private readonly EXCHANGE_RATES_COLLECTION = 'exchange_rates'
  private readonly WALLET_TRANSACTIONS_COLLECTION = 'wallet_transactions'
  private readonly PAYMENT_HISTORY_COLLECTION = 'payment_status_history'

  private config: YellowCardConfig | null = null
  private baseUrl: string = ''

  constructor() {
    this.initializeConfig()
  }

  private async initializeConfig(): Promise<void> {
    try {
      const configQuery = query(
        collection(db, this.CONFIG_COLLECTION),
        where('isActive', '==', true)
      )
      const snapshot = await getDocs(configQuery)
      
      if (!snapshot.empty) {
        const configDoc = snapshot.docs[0]
        this.config = { id: configDoc.id, ...configDoc.data() } as YellowCardConfig
        this.baseUrl = this.config.environment === 'production' 
          ? 'https://api.yellowcard.io/v1' 
          : 'https://api.sandbox.yellowcard.io/v1'
      }
    } catch (error) {
      console.error('Failed to initialize YellowCard config:', error)
    }
  }

  // Get supported countries and providers
  async getSupportedCountries(): Promise<{ [region: string]: MobileMoneyProvider[] }> {
    try {
      const providersRef = collection(db, this.PROVIDERS_COLLECTION)
      const q = query(providersRef, where('isActive', '==', true), orderBy('countryName'))
      const snapshot = await getDocs(q)
      
      const providers: MobileMoneyProvider[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MobileMoneyProvider[]

      // Group by region
      const groupedByRegion = providers.reduce((acc, provider) => {
        if (!acc[provider.region]) {
          acc[provider.region] = []
        }
        acc[provider.region].push(provider)
        return acc
      }, {} as { [region: string]: MobileMoneyProvider[] })

      return groupedByRegion
    } catch (error) {
      throw new Error(`Failed to get supported countries: ${error}`)
    }
  }

  // Get providers by country
  async getProvidersByCountry(countryCode: string): Promise<MobileMoneyProvider[]> {
    try {
      const providersRef = collection(db, this.PROVIDERS_COLLECTION)
      const q = query(
        providersRef, 
        where('countryCode', '==', countryCode.toUpperCase()),
        where('isActive', '==', true)
      )
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MobileMoneyProvider[]
    } catch (error) {
      throw new Error(`Failed to get providers for country ${countryCode}: ${error}`)
    }
  }

  // Get exchange rate
  async getExchangeRate(fromCurrency: string, toCurrency: string = 'USDC'): Promise<number> {
    try {
      // Check cached rate first
      const rateRef = doc(db, this.EXCHANGE_RATES_COLLECTION, `${fromCurrency}_${toCurrency}`)
      const rateDoc = await getDoc(rateRef)
      
      if (rateDoc.exists()) {
        const rateData = rateDoc.data() as ExchangeRate
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        
        if (rateData.updatedAt.toDate() > oneHourAgo) {
          return rateData.rate
        }
      }

      // Fetch fresh rate from YellowCard API
      const rate = await this.fetchExchangeRateFromAPI(fromCurrency, toCurrency)
      
      // Cache the rate
      await setDoc(rateRef, {
        fromCurrency,
        toCurrency,
        rate,
        updatedAt: new Date()
      })

      return rate
    } catch (error) {
      // Fallback to cached rate if API fails
      const rateRef = doc(db, this.EXCHANGE_RATES_COLLECTION, `${fromCurrency}_${toCurrency}`)
      const rateDoc = await getDoc(rateRef)
      
      if (rateDoc.exists()) {
        return (rateDoc.data() as ExchangeRate).rate
      }
      
      throw new Error(`Failed to get exchange rate for ${fromCurrency} to ${toCurrency}: ${error}`)
    }
  }

  // Initiate payment
  async initiatePayment(paymentRequest: YellowCardPaymentRequest): Promise<YellowCardPaymentResponse> {
    try {
      if (!this.config) {
        await this.initializeConfig()
        if (!this.config) {
          throw new Error('YellowCard configuration not found')
        }
      }

      // Validate provider
      const providers = await this.getProvidersByCountry(paymentRequest.countryCode)
      const provider = providers.find(p => p.providerCode === paymentRequest.providerCode)
      
      if (!provider) {
        throw new Error(`Provider ${paymentRequest.providerCode} not supported in ${paymentRequest.countryCode}`)
      }

      // Validate amount limits
      if (paymentRequest.amount < provider.minAmount || paymentRequest.amount > provider.maxAmount) {
        throw new Error(`Amount must be between ${provider.minAmount} and ${provider.maxAmount} ${provider.currencyCode}`)
      }

      // Get exchange rate
      const exchangeRate = await this.getExchangeRate(paymentRequest.currency)
      const usdcAmount = paymentRequest.amount * exchangeRate

      // Prepare API request
      const apiPayload = {
        merchant_id: this.config.merchantId,
        order_id: paymentRequest.orderId,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        customer: {
          name: paymentRequest.customerName,
          email: paymentRequest.customerEmail,
          phone: paymentRequest.customerPhone
        },
        payment_method: {
          type: provider.providerType,
          provider: paymentRequest.providerCode,
          country: paymentRequest.countryCode
        },
        destination_wallet: this.config.destinationWallet,
        destination_currency: this.config.defaultCurrency,
        redirect_url: paymentRequest.redirectUrl,
        webhook_url: paymentRequest.webhookUrl,
        metadata: {
          ...paymentRequest.metadata,
          exchange_rate: exchangeRate,
          usdc_amount: usdcAmount
        }
      }

      // Make API call
      const response = await this.makeAuthenticatedRequest('/payments', 'POST', apiPayload)

      if (response.success) {
        return {
          success: true,
          data: {
            paymentId: response.data.payment_id,
            paymentUrl: response.data.payment_url,
            transactionId: response.data.transaction_id,
            status: response.data.status,
            expiresAt: response.data.expires_at,
            exchangeRate,
            usdcAmount
          },
          message: 'Payment initiated successfully',
          reference: response.data.reference
        }
      } else {
        return {
          success: false,
          message: response.message || 'Payment initiation failed'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Payment initiation failed: ${error}`
      }
    }
  }

  // Check payment status
  async checkPaymentStatus(paymentId: string): Promise<{
    status: string
    transactionHash?: string
    completedAt?: string
    failureReason?: string
  }> {
    try {
      if (!this.config) {
        await this.initializeConfig()
      }

      const response = await this.makeAuthenticatedRequest(`/payments/${paymentId}`, 'GET')
      
      return {
        status: response.data.status,
        transactionHash: response.data.transaction_hash,
        completedAt: response.data.completed_at,
        failureReason: response.data.failure_reason
      }
    } catch (error) {
      throw new Error(`Failed to check payment status: ${error}`)
    }
  }

  // Process webhook
  async processWebhook(payload: any, signature: string): Promise<boolean> {
    try {
      if (!this.config) {
        await this.initializeConfig()
        if (!this.config) {
          throw new Error('YellowCard configuration not found')
        }
      }

      // Verify webhook signature
      const isValid = await this.verifyWebhookSignature(payload, signature, this.config.webhookSecret)
      if (!isValid) {
        throw new Error('Invalid webhook signature')
      }

      // Process payment status update
      await this.updatePaymentStatus(payload)

      // If payment completed, update wallet balance
      if (payload.status === 'completed') {
        await this.updateWalletBalance(payload)
      }

      return true
    } catch (error) {
      console.error('Webhook processing failed:', error)
      return false
    }
  }

  // Private helper methods
  private async fetchExchangeRateFromAPI(fromCurrency: string, toCurrency: string): Promise<number> {
    try {
      const response = await this.makeAuthenticatedRequest(
        `/rates?from=${fromCurrency}&to=${toCurrency}`, 
        'GET'
      )
      return response.data.rate
    } catch (error) {
      throw new Error(`Failed to fetch exchange rate from API: ${error}`)
    }
  }

  private async makeAuthenticatedRequest(endpoint: string, method: string, payload?: any): Promise<any> {
    if (!this.config) {
      throw new Error('YellowCard configuration not initialized')
    }

    const timestamp = Date.now().toString()
    const nonce = (await import('crypto')).randomBytes(16).toString('hex')
    
    // Create signature
    const message = `${method}${endpoint}${timestamp}${nonce}${payload ? JSON.stringify(payload) : ''}`
    const signature = (await import('crypto')).createHmac('sha256', this.config.apiSecret)
      .update(message)
      .digest('hex')

    const headers = {
      'Content-Type': 'application/json',
      'X-API-KEY': this.config.apiKey,
      'X-TIMESTAMP': timestamp,
      'X-NONCE': nonce,
      'X-SIGNATURE': signature
    }

    const options: RequestInit = {
      method,
      headers,
      ...(payload && { body: JSON.stringify(payload) })
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options)
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  }

  private async verifyWebhookSignature(payload: any, signature: string, secret: string): Promise<boolean> {
    const expectedSignature = (await import('crypto')).createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex')
    
    return (await import('crypto')).timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  }

  private async updatePaymentStatus(webhookPayload: any): Promise<void> {
    try {
      // Add to payment status history
      await addDoc(collection(db, this.PAYMENT_HISTORY_COLLECTION), {
        paymentId: webhookPayload.payment_id,
        oldStatus: webhookPayload.previous_status,
        newStatus: webhookPayload.status,
        changedAt: new Date(),
        webhookData: webhookPayload
      })
    } catch (error) {
      console.error('Failed to update payment status:', error)
    }
  }

  private async updateWalletBalance(webhookPayload: any): Promise<void> {
    try {
      // Create wallet transaction record
      await addDoc(collection(db, this.WALLET_TRANSACTIONS_COLLECTION), {
        userId: webhookPayload.metadata?.user_id,
        paymentId: webhookPayload.payment_id,
        amount: webhookPayload.destination_amount,
        currency: webhookPayload.destination_currency,
        transactionType: 'payment',
        description: `Payment received for order ${webhookPayload.order_id}`,
        createdAt: new Date()
      })
    } catch (error) {
      console.error('Failed to update wallet balance:', error)
    }
  }

  // Utility methods
  async validatePhoneNumber(phone: string, countryCode: string): Promise<boolean> {
    try {
      const providers = await this.getProvidersByCountry(countryCode)
      if (providers.length === 0) return false

      const phoneFormat = providers[0].phoneFormat
      const regex = new RegExp(phoneFormat.replace(/X/g, '\\d'))
      return regex.test(phone)
    } catch (error) {
      return false
    }
  }

  async getCountryByPhone(phone: string): Promise<string | null> {
    // Simple country detection based on phone prefix
    const countryPrefixes: { [prefix: string]: string } = {
      '+234': 'NG', '+233': 'GH', '+225': 'CI', '+221': 'SN',
      '+237': 'CM', '+243': 'CD', '+241': 'GA', '+242': 'CG',
      '+254': 'KE', '+256': 'UG', '+255': 'TZ', '+250': 'RW', '+265': 'MW',
      '+27': 'ZA', '+260': 'ZM', '+267': 'BW'
    }

    for (const [prefix, country] of Object.entries(countryPrefixes)) {
      if (phone.startsWith(prefix)) {
        return country
      }
    }

    return null
  }
}

export const yellowCardService = new YellowCardService()

// Initialize mobile money providers data
export const initializeMobileMoneyProviders = async (): Promise<void> => {
  const providers: Omit<MobileMoneyProvider, 'id'>[] = [
    // West Africa
    { countryCode: 'NG', countryName: 'Nigeria', region: 'west_africa', providerName: 'OPay', providerCode: 'opay_ng', providerType: 'mobile_money', currencyCode: 'NGN', minAmount: 100, maxAmount: 5000000, phoneFormat: '+234XXXXXXXXXX', isActive: true },
    { countryCode: 'NG', countryName: 'Nigeria', region: 'west_africa', providerName: 'PalmPay', providerCode: 'palmpay_ng', providerType: 'mobile_money', currencyCode: 'NGN', minAmount: 100, maxAmount: 5000000, phoneFormat: '+234XXXXXXXXXX', isActive: true },
    { countryCode: 'GH', countryName: 'Ghana', region: 'west_africa', providerName: 'MTN Mobile Money', providerCode: 'mtn_gh', providerType: 'mobile_money', currencyCode: 'GHS', minAmount: 1, maxAmount: 100000, phoneFormat: '+233XXXXXXXXX', isActive: true },
    { countryCode: 'CI', countryName: 'Ivory Coast', region: 'west_africa', providerName: 'Orange Money', providerCode: 'orange_ci', providerType: 'mobile_money', currencyCode: 'XOF', minAmount: 500, maxAmount: 2000000, phoneFormat: '+225XXXXXXXXXX', isActive: true },
    { countryCode: 'SN', countryName: 'Senegal', region: 'west_africa', providerName: 'Orange Money', providerCode: 'orange_sn', providerType: 'mobile_money', currencyCode: 'XOF', minAmount: 500, maxAmount: 1500000, phoneFormat: '+221XXXXXXXXX', isActive: true },
    
    // Central Africa
    { countryCode: 'CM', countryName: 'Cameroon', region: 'central_africa', providerName: 'MTN Mobile Money', providerCode: 'mtn_cm', providerType: 'mobile_money', currencyCode: 'XAF', minAmount: 500, maxAmount: 5000000, phoneFormat: '+237XXXXXXXXX', isActive: true },
    { countryCode: 'CD', countryName: 'DR Congo', region: 'central_africa', providerName: 'Airtel Money', providerCode: 'airtel_cd', providerType: 'mobile_money', currencyCode: 'CDF', minAmount: 2000, maxAmount: 10000000, phoneFormat: '+243XXXXXXXXX', isActive: true },
    
    // East Africa
    { countryCode: 'KE', countryName: 'Kenya', region: 'east_africa', providerName: 'M-Pesa', providerCode: 'mpesa_ke', providerType: 'mobile_money', currencyCode: 'KES', minAmount: 10, maxAmount: 1000000, phoneFormat: '+254XXXXXXXXX', isActive: true },
    { countryCode: 'UG', countryName: 'Uganda', region: 'east_africa', providerName: 'MTN Mobile Money', providerCode: 'mtn_ug', providerType: 'mobile_money', currencyCode: 'UGX', minAmount: 1000, maxAmount: 10000000, phoneFormat: '+256XXXXXXXXX', isActive: true },
    { countryCode: 'TZ', countryName: 'Tanzania', region: 'east_africa', providerName: 'M-Pesa Vodacom', providerCode: 'mpesa_tz', providerType: 'mobile_money', currencyCode: 'TZS', minAmount: 1000, maxAmount: 5000000, phoneFormat: '+255XXXXXXXXX', isActive: true },
    { countryCode: 'RW', countryName: 'Rwanda', region: 'east_africa', providerName: 'MTN Mobile Money', providerCode: 'mtn_rw', providerType: 'mobile_money', currencyCode: 'RWF', minAmount: 500, maxAmount: 3000000, phoneFormat: '+250XXXXXXXXX', isActive: true },
    
    // Southern Africa
    { countryCode: 'ZA', countryName: 'South Africa', region: 'southern_africa', providerName: 'Bank Transfer', providerCode: 'bank_za', providerType: 'bank_transfer', currencyCode: 'ZAR', minAmount: 10, maxAmount: 1000000, phoneFormat: '+27XXXXXXXXX', isActive: true },
    { countryCode: 'ZM', countryName: 'Zambia', region: 'southern_africa', providerName: 'MTN Mobile Money', providerCode: 'mtn_zm', providerType: 'mobile_money', currencyCode: 'ZMW', minAmount: 5, maxAmount: 100000, phoneFormat: '+260XXXXXXXXX', isActive: true }
  ]

  try {
    const providersCollection = collection(db, 'mobile_money_providers')
    
    for (const provider of providers) {
      // Check if provider already exists
      const q = query(
        providersCollection,
        where('countryCode', '==', provider.countryCode),
        where('providerCode', '==', provider.providerCode)
      )
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) {
        await addDoc(providersCollection, provider)
      }
    }
  } catch (error) {
    console.error('Failed to initialize mobile money providers:', error)
  }
}
