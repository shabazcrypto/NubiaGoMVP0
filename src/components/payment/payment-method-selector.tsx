'use client'

import { useState } from 'react'
import { CreditCard, Smartphone, Building2, Wallet } from 'lucide-react'
import { CreditCardForm } from './credit-card-form'
import { MobileMoneyForm } from './mobile-money-form'
import { PaymentForm } from './payment-form'

interface PaymentMethod {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  type: 'card' | 'mobile_money' | 'bank_transfer' | 'wallet'
  available: boolean
}

interface PaymentMethodSelectorProps {
  amount: number
  currency: string
  onSuccess?: (paymentData: any) => void
  onError?: (error: string) => void
  className?: string
}

export function PaymentMethodSelector({ 
  amount, 
  currency, 
  onSuccess, 
  onError, 
  className = '' 
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('')

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Pay with Visa, Mastercard, or other cards',
      icon: <CreditCard className="h-5 w-5" />,
      type: 'card',
      available: true,
    },
    {
      id: 'mobile_money',
      name: 'Mobile Money',
      description: 'Pay with M-Pesa, Airtel Money, or other mobile money',
      icon: <Smartphone className="h-5 w-5" />,
      type: 'mobile_money',
      available: true,
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      description: 'Pay via bank transfer or wire transfer',
      icon: <Building2 className="h-5 w-5" />,
      type: 'bank_transfer',
      available: true,
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      description: 'Pay with PayPal, Apple Pay, or Google Pay',
      icon: <Wallet className="h-5 w-5" />,
      type: 'wallet',
      available: false, // Disabled for demo
    },
  ]

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId)
  }

  const handlePaymentSuccess = (paymentData: any) => {
    onSuccess?.(paymentData)
  }

  const handlePaymentError = (error: string) => {
    onError?.(error)
  }

  const renderPaymentForm = () => {
    switch (selectedMethod) {
      case 'card':
        return (
          <CreditCardForm
            amount={amount}
            currency={currency}
            onSuccess={() => handlePaymentSuccess({})}
            onError={handlePaymentError}
          />
        )
      case 'mobile_money':
        return (
          <MobileMoneyForm
            amount={amount}
            currency={currency}
            onSuccess={() => handlePaymentSuccess({})}
            onError={handlePaymentError}
          />
        )
      case 'bank_transfer':
      case 'wallet':
        return (
          <PaymentForm
            amount={amount}
            currency={currency}
            orderId={`ORDER-${Date.now()}`}
            onSuccess={() => handlePaymentSuccess({})}
            onError={handlePaymentError}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Choose Payment Method</h2>
        <p className="text-sm text-gray-600">
          Select your preferred payment method to complete your purchase
        </p>
      </div>

      <div className="p-6">
        {!selectedMethod ? (
          // Payment Method Selection
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleMethodSelect(method.id)}
                  disabled={!method.available}
                  className={`relative p-4 border rounded-lg text-left transition-all ${
                    method.available
                      ? 'border-gray-300 hover:border-primary-500 hover:bg-primary-50 cursor-pointer'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      method.available ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium ${
                        method.available ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {method.name}
                      </h3>
                      <p className={`text-sm ${
                        method.available ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {method.description}
                      </p>
                    </div>
                  </div>
                  {!method.available && (
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Coming Soon
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Payment Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-semibold text-lg">
                  {amount.toLocaleString()} {currency}
                </span>
              </div>
            </div>
          </div>
        ) : (
          // Selected Payment Form
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedMethod('')}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Change Payment Method</span>
              </button>
              <div className="flex items-center space-x-2">
                {paymentMethods.find(m => m.id === selectedMethod)?.icon}
                <span className="font-medium text-gray-900">
                  {paymentMethods.find(m => m.id === selectedMethod)?.name}
                </span>
              </div>
            </div>

            {renderPaymentForm()}
          </div>
        )}
      </div>
    </div>
  )
} 