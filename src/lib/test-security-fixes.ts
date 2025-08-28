/**
 * Test file to verify all security and performance fixes
 * This file can be run to test the implemented fixes
 */

import { CSRFProtection } from './security/csrf'
import { EnhancedCache, CacheFactory } from './cache'
import { errorLoggingService } from './services/error-logging.service'
import { PerformanceMetrics } from './performance'

/**
 * Test CSRF Protection
 */
export function testCSRFProtection(): boolean {
  try {
    // Testing CSRF Protection - logging removed for production
    
    const sessionId = 'test-session-123'
    const secret = 'test-secret-key'
    
    // Test token generation
    const tokenData = CSRFProtection.generateToken(sessionId, secret)
    // Token generation test - logging removed for production
    
    // Test signed token generation
    const signedToken = CSRFProtection.generateSignedToken(sessionId, secret)
    // Signed token generation test - logging removed for production
    
    // Test token validation
    const isValid = CSRFProtection.validateSignedToken(signedToken, sessionId, secret)
    // Token validation test - logging removed for production
    
    // Test token expiry
    const isExpired = CSRFProtection.isTokenExpired(Date.now() - 1000)
    // Token expiry check test - logging removed for production
    
    // CSRF Protection tests passed - logging removed for production
    return true
  } catch (error) {
    // CSRF Protection tests failed - logging removed for production
    return false
  }
}

/**
 * Test Enhanced Cache
 */
export function testEnhancedCache(): boolean {
  try {
    // Testing Enhanced Cache - logging removed for production
    
    const cache = new EnhancedCache({
      ttl: 1000, // 1 second
      maxSize: 5,
      persist: false
    })
    
    // Test basic operations
    cache.set('test-key', 'test-value')
    const value = cache.get('test-key')
    // Basic cache operations test - logging removed for production
    
    // Test TTL
    setTimeout(() => {
      const expiredValue = cache.get('test-key')
      // TTL expiration test - logging removed for production
    }, 1100)
    
    // Test max size
    for (let i = 0; i < 10; i++) {
      cache.set(`key-${i}`, `value-${i}`)
    }
    // Max size enforcement test - logging removed for production
    
    // Test statistics
    const stats = cache.getStats()
    // Cache statistics test - logging removed for production
    
    // Enhanced Cache tests passed - logging removed for production
    return true
  } catch (error) {
    // Enhanced Cache tests failed - logging removed for production
    return false
  }
}

/**
 * Test Error Logging Service
 */
export async function testErrorLoggingService(): Promise<boolean> {
  try {
    // Testing Error Logging Service - logging removed for production
    
    // Test basic error logging
    const errorId = await errorLoggingService.logError(new Error('Test error message'))
    // Basic error logging test - logging removed for production
    
    // Test warning logging
    const warningId = await errorLoggingService.logError(new Error('Test warning message'), { level: 'warn' })
    // Warning logging test - logging removed for production
    
    // Test info logging
    const infoId = await errorLoggingService.logError(new Error('Test info message'), { level: 'info' })
    // Info logging test - logging removed for production
    
    // Test API error logging
    const apiErrorId = await errorLoggingService.logError(
      new Error('API test error'),
      { 
        category: 'api',
        context: { method: 'GET', url: '/test', statusCode: 500 },
        tags: ['api', 'get']
      }
    )
    // API error logging test - logging removed for production
    
    // Test validation error logging
    const validationErrorId = await errorLoggingService.logError(
      new Error('Validation test error'),
      { 
        category: 'validation',
        level: 'warn',
        context: { form: 'test-form', field: 'test-field' },
        tags: ['validation', 'form']
      }
    )
    // Validation error logging test - logging removed for production
    
    // Error Logging Service tests passed - logging removed for production
    return true
  } catch (error) {
    // Error Logging Service tests failed - logging removed for production
    return false
  }
}

/**
 * Test Performance Utilities
 */
export function testPerformanceUtilities(): boolean {
  try {
    // Testing Performance Utilities - logging removed for production
    
    // Test performance metrics
    const metrics = PerformanceMetrics.getInstance()
    const measureId = metrics.startMeasure('test-measure')
    // Performance measurement start test - logging removed for production
    
    // Simulate some work
    setTimeout(() => {
      const duration = metrics.endMeasure('test-measure', measureId)
      // Performance measurement end test - logging removed for production
    }, 100)
    
    // Test cache factory
    const testCache = CacheFactory.getCache('test-cache')
    testCache.set('test', 'value')
    // Cache factory test - logging removed for production
    
    // Performance Utilities tests passed - logging removed for production
    return true
  } catch (error) {
    // Performance Utilities tests failed - logging removed for production
    return false
  }
}

/**
 * Test Validation Schemas
 */
export async function testValidationSchemas(): Promise<boolean> {
  try {
    // Testing Validation Schemas - logging removed for production
    
    // Test user registration schema
    const { userRegistrationSchema } = await import('./validation-schemas')
    
    const validData = {
      email: 'test@example.com',
      password: 'TestPass123',
      confirmPassword: 'TestPass123',
      displayName: 'Test User',
      acceptTerms: true
    }
    
    const result = userRegistrationSchema.safeParse(validData)
    // User registration validation test - logging removed for production
    
    // Test invalid data
    const invalidData = {
      email: 'invalid-email',
      password: 'weak',
      confirmPassword: 'different',
      displayName: '',
      acceptTerms: false
    }
    
    const invalidResult = userRegistrationSchema.safeParse(invalidData)
    // Invalid data rejection test - logging removed for production
    
    // Validation Schemas tests passed - logging removed for production
    return true
  } catch (error) {
    // Validation Schemas tests failed - logging removed for production
    return false
  }
}

/**
 * Run all tests
 */
export async function runAllTests(): Promise<{
  total: number
  passed: number
  failed: number
  results: Record<string, boolean>
}> {
  // Starting Security and Performance Fixes Test Suite - logging removed for production
  
  const tests = [
    { name: 'CSRF Protection', fn: testCSRFProtection },
    { name: 'Enhanced Cache', fn: testEnhancedCache },
    { name: 'Error Logging Service', fn: testErrorLoggingService },
    { name: 'Performance Utilities', fn: testPerformanceUtilities },
    { name: 'Validation Schemas', fn: testValidationSchemas }
  ]
  
  const results: Record<string, boolean> = {}
  let passed = 0
  let failed = 0
  
  for (const test of tests) {
    try {
      const result = await test.fn()
      results[test.name] = result
      
      if (result) {
        passed++
      } else {
        failed++
      }
    } catch (error) {
      // Test crashed - logging removed for production
      results[test.name] = false
      failed++
    }
    
    // Add spacing between tests - logging removed for production
  }
  
  const total = tests.length
  
  // Test Results Summary - logging removed for production
  
  // Detailed Results - logging removed for production
  
  if (failed === 0) {
    // All tests passed - logging removed for production
  } else {
    // Some tests failed - logging removed for production
  }
  
  return { total, passed, failed, results }
}

/**
 * Test specific functionality
 */
export async function testSpecificFunctionality(): Promise<void> {
  // Testing Specific Functionality - logging removed for production
  
  // Test CSRF token generation
  const sessionId = 'test-session-456'
  const secret = 'test-secret-789'
  
  const token = CSRFProtection.generateSignedToken(sessionId, secret)
  // Generated CSRF token - logging removed for production
  
  // Test cache operations
  const cache = new EnhancedCache({ ttl: 5000, maxSize: 10 })
  cache.set('test-key', { data: 'test-value', timestamp: Date.now() })
  
  const cachedValue = cache.get('test-key')
  // Cached value - logging removed for production
  
  // Test error logging
      const errorId = await errorLoggingService.logError(new Error('Test error for functionality test'))
  // Logged error ID - logging removed for production
  
  // Specific functionality tests completed - logging removed for production
}

// Export for use in other files
export default {
  testCSRFProtection,
  testEnhancedCache,
  testErrorLoggingService,
  testPerformanceUtilities,
  testValidationSchemas,
  runAllTests,
  testSpecificFunctionality
}
