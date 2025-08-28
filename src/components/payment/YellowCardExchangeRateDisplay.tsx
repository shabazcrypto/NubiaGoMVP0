'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { RefreshCw, TrendingUp, Calculator, Clock, AlertCircle } from 'lucide-react'

interface YellowCardExchangeRateDisplayProps {
  fromCurrency: string
  toCurrency?: string
  amount?: number
  onRateUpdate?: (rate: number, usdcAmount: number) => void
  autoRefresh?: boolean
  refreshInterval?: number
  className?: string
}

interface ExchangeRateData {
  fromCurrency: string
  toCurrency: string
  rate: number
  timestamp: string
  lastUpdated: Date
}

export default function YellowCardExchangeRateDisplay({
  fromCurrency,
  toCurrency = 'USDC',
  amount = 0,
  onRateUpdate,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
  className = ''
}: YellowCardExchangeRateDisplayProps) {
  const [rateData, setRateData] = useState<ExchangeRateData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [calculatorAmount, setCalculatorAmount] = useState<string>('')
  const [showCalculator, setShowCalculator] = useState(false)

  const fetchExchangeRate = useCallback(async (showLoading = true) => {
    if (!fromCurrency) return

    try {
      if (showLoading) setLoading(true)
      setError(null)

      const response = await fetch(`/api/yellowcard/exchange-rate?from=${fromCurrency}&to=${toCurrency}`)
      const data = await response.json()

      if (data.success) {
        const newRateData: ExchangeRateData = {
          fromCurrency: data.data.fromCurrency,
          toCurrency: data.data.toCurrency,
          rate: data.data.rate,
          timestamp: data.data.timestamp,
          lastUpdated: new Date()
        }
        
        setRateData(newRateData)
        setLastRefresh(new Date())

        // Notify parent component of rate update
        if (onRateUpdate && amount > 0) {
          const usdcAmount = amount * newRateData.rate
          onRateUpdate(newRateData.rate, usdcAmount)
        }
      } else {
        setError(data.message || 'Failed to fetch exchange rate')
      }
    } catch (err) {
      setError('Failed to fetch exchange rate')
      console.error('Exchange rate fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [fromCurrency, toCurrency, amount, onRateUpdate])

  // Initial fetch and auto-refresh setup
  useEffect(() => {
    fetchExchangeRate()

    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchExchangeRate(false) // Don't show loading for auto-refresh
      }, refreshInterval)

      return () => clearInterval(interval)
    }
  }, [fetchExchangeRate, autoRefresh, refreshInterval])

  const formatCurrency = (value: number, currency: string) => {
    if (currency === 'USDC') {
      return `${value.toFixed(6)} USDC`
    }
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value)
    } catch {
      return `${value.toFixed(2)} ${currency}`
    }
  }

  const formatRate = (rate: number) => {
    if (rate < 0.001) {
      return rate.toExponential(4)
    }
    return rate.toFixed(6)
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)

    if (diffSeconds < 60) {
      return `${diffSeconds}s ago`
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`
    } else {
      const diffHours = Math.floor(diffMinutes / 60)
      return `${diffHours}h ago`
    }
  }

  const calculateConversion = (inputAmount: number) => {
    if (!rateData || inputAmount <= 0) return 0
    return inputAmount * rateData.rate
  }

  const handleCalculatorAmountChange = (value: string) => {
    // Allow only numbers and decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '')
    const parts = cleanValue.split('.')
    if (parts.length > 2) return // Prevent multiple decimal points
    
    setCalculatorAmount(cleanValue)
  }

  if (!fromCurrency) {
    return null
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <h3 className="font-medium text-gray-900">Exchange Rate</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Toggle Calculator"
          >
            <Calculator className="w-4 h-4" />
          </button>
          <button
            onClick={() => fetchExchangeRate()}
            disabled={loading}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            title="Refresh Rate"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      ) : rateData ? (
        <div className="space-y-4">
          {/* Current Rate */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              1 {fromCurrency} = {formatRate(rateData.rate)} {toCurrency}
            </div>
            <div className="text-sm text-gray-500 flex items-center justify-center mt-1">
              <Clock className="w-3 h-3 mr-1" />
              {lastRefresh ? `Updated ${getTimeAgo(lastRefresh)}` : 'Live rate'}
            </div>
          </div>

          {/* Amount Conversion */}
          {amount > 0 && (
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="text-center">
                <div className="text-lg font-medium text-blue-900">
                  {formatCurrency(amount, fromCurrency)}
                </div>
                <div className="text-sm text-blue-600 my-1">converts to</div>
                <div className="text-xl font-bold text-blue-900">
                  {formatCurrency(calculateConversion(amount), toCurrency)}
                </div>
              </div>
            </div>
          )}

          {/* Calculator */}
          {showCalculator && (
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Quick Converter
                </label>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={calculatorAmount}
                      onChange={(e) => handleCalculatorAmountChange(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="text-xs text-gray-500 mt-1">{fromCurrency}</div>
                  </div>
                  <div className="flex items-center text-gray-400">
                    →
                  </div>
                  <div className="flex-1">
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                      {calculatorAmount ? formatCurrency(calculateConversion(parseFloat(calculatorAmount) || 0), toCurrency) : '0.00'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{toCurrency}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rate Info */}
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Rate Source:</span>
              <span>YellowCard API</span>
            </div>
            <div className="flex justify-between">
              <span>Auto Refresh:</span>
              <span>{autoRefresh ? `Every ${refreshInterval / 1000}s` : 'Disabled'}</span>
            </div>
            {rateData.timestamp && (
              <div className="flex justify-between">
                <span>Rate Time:</span>
                <span>{new Date(rateData.timestamp).toLocaleTimeString()}</span>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded">
            <AlertCircle className="w-3 h-3 inline mr-1" />
            Exchange rates are indicative and may vary at the time of transaction. Final conversion rates are determined by YellowCard at payment processing.
          </div>
        </div>
      ) : loading ? (
        <div className="text-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gray-400 mb-2" />
          <div className="text-sm text-gray-500">Loading exchange rate...</div>
        </div>
      ) : null}
    </div>
  )
}
