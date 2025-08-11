'use client'

import { useState } from 'react'
import { EnhancedMobileMoneyPayment } from '@/components/payment/enhanced-mobile-money-payment'
import { CheckCircle, AlertCircle, Clock } from 'lucide-react'

export default function TestMobileMoneyPage() {
  const [testResults, setTestResults] = useState<Array<{
    id: string
    type: 'success' | 'error' | 'info'
    message: string
    timestamp: string
  }>>([])

  const addTestResult = (type: 'success' | 'error' | 'info', message: string) => {
    setTestResults(prev => [{
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev])
  }

  const handlePaymentComplete = (paymentId: string) => {
    addTestResult('success', `Payment completed successfully! Payment ID: ${paymentId}`)
  }

  const handlePaymentFailed = (error: string) => {
    addTestResult('error', `Payment failed: ${error}`)
  }

  const testAPIEndpoints = async () => {
    addTestResult('info', 'Testing API endpoints...')
    
    try {
      // Test 1: Get operators for Cameroon
      const operatorsResponse = await fetch('/api/mobile-money/operators/CM')
      const operators = await operatorsResponse.json()
      
      if (operators.success) {
        addTestResult('success', `✅ Operators API working - Found ${operators.data?.length} operators for Cameroon`)
      } else {
        addTestResult('error', `❌ Operators API failed: ${operators.message}`)
      }

      // Test 2: Test payment initiation
      const paymentResponse = await fetch('/api/mobile-money/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'test_' + Date.now(),
          amount: 1000,
          currency: 'XAF',
          customerPhone: '+237670000000',
          customerEmail: 'test@nubiago.com',
          customerName: 'Test Customer',
          operatorCode: 'orange_money_cm',
          country: 'CM'
        })
      })
      
      const payment = await paymentResponse.json()
      
      if (payment.success) {
        addTestResult('success', `✅ Payment initiation API working - Payment ID: ${payment.data?.paymentId}`)
        
        // Test 3: Test payment status
        const statusResponse = await fetch(`/api/mobile-money/status/${payment.data.paymentId}`)
        const status = await statusResponse.json()
        
        if (status.success) {
          addTestResult('success', `✅ Payment status API working - Status: ${status.data?.status}`)
        } else {
          addTestResult('error', `❌ Payment status API failed: ${status.message}`)
        }
      } else {
        addTestResult('error', `❌ Payment initiation API failed: ${payment.message}`)
      }

    } catch (error) {
      addTestResult('error', `❌ API test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const clearTestResults = () => {
    setTestResults([])
  }

  const getTestResultIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'info':
        return <Clock className="h-5 w-5 text-blue-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getTestResultColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Mobile Money Payment System Test</h1>
          <p className="text-lg text-gray-600">
            Test the complete mobile money payment integration system
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Test Panel</h2>
            
            <div className="space-y-4">
              <button
                onClick={testAPIEndpoints}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                🧪 Test API Endpoints
              </button>
              
              <button
                onClick={clearTestResults}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                🗑️ Clear Test Results
              </button>
            </div>

            {/* Test Results */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Test Results</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {testResults.length === 0 ? (
                  <p className="text-gray-500 text-sm">No test results yet. Run a test to see results here.</p>
                ) : (
                  testResults.map((result) => (
                    <div
                      key={result.id}
                      className={`p-3 rounded-lg border ${getTestResultColor(result.type)}`}
                    >
                      <div className="flex items-start space-x-2">
                        {getTestResultIcon(result.type)}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{result.message}</p>
                          <p className="text-xs opacity-75 mt-1">{result.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Payment Demo */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Demo</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">Demo Instructions</h3>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Select a country (e.g., Cameroon)</li>
                <li>2. Choose a mobile money operator</li>
                <li>3. Fill in your details</li>
                <li>4. Click "Pay" to test the payment flow</li>
                <li>5. Watch the payment status updates</li>
              </ol>
            </div>

            <EnhancedMobileMoneyPayment
              orderId={`DEMO-${Date.now()}`}
              amount={2500}
              currency="XAF"
              onPaymentComplete={handlePaymentComplete}
              onPaymentFailed={handlePaymentFailed}
            />
          </div>
        </div>

        {/* System Information */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">System Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">✅ What's Working</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Mobile Money Service</li>
                <li>• API Endpoints</li>
                <li>• Payment Flow</li>
                <li>• Status Tracking</li>
                <li>• Webhook Handling</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-900 mb-2">⚠️ Current Status</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Mock Payment Gateway</li>
                <li>• In-Memory Storage</li>
                <li>• Development Mode</li>
                <li>• Testing Environment</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">🚀 Next Steps</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Real Gateway Integration</li>
                <li>• Database Storage</li>
                <li>• Production Deployment</li>
                <li>• Monitoring & Alerts</li>
              </ul>
            </div>
          </div>
        </div>

        {/* API Documentation */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">API Documentation</h2>
          
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">GET /api/mobile-money/operators/{'{country}'}</h3>
              <p className="text-sm text-gray-600 mb-2">Get available mobile money operators for a specific country</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">Example: /api/mobile-money/operators/CM</code>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">POST /api/mobile-money/initiate</h3>
              <p className="text-sm text-gray-600 mb-2">Initiate a mobile money payment</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">Body: orderId, amount, currency, customerPhone, customerEmail, customerName, operatorCode, country</code>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">GET /api/mobile-money/status/{'{paymentId}'}</h3>
              <p className="text-sm text-gray-600 mb-2">Get payment status by payment ID</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">Example: /api/mobile-money/status/pm_123456789</code>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">POST /api/mobile-money/webhook</h3>
              <p className="text-sm text-gray-600 mb-2">Webhook endpoint for payment notifications</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">Handles: charge.completed, charge.failed, charge.pending</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
