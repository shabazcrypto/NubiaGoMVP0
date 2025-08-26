#!/usr/bin/env node

/**
 * 🚀 Edge Request Optimization - Test Script
 * 
 * Validates the optimization implementation and provides performance metrics
 */

const https = require('https');
const http = require('http');
const { performance } = require('perf_hooks');

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const TEST_ITERATIONS = 10;

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${colors.bold}${'='.repeat(60)}${colors.reset}`);
  log(`${colors.bold}${message}${colors.reset}`);
  log(`${colors.bold}${'='.repeat(60)}${colors.reset}\n`);
}

/**
 * Make HTTP request and measure performance
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    const urlObj = new URL(url, BASE_URL);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 3000),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Edge-Optimization-Test/1.0',
        ...options.headers
      }
    };

    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const req = protocol.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        resolve({
          status: res.statusCode,
          duration,
          headers: res.headers,
          data: data,
          size: data.length
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

/**
 * Test single API endpoint
 */
async function testEndpoint(endpoint, options = {}) {
  const results = [];
  
  log(`Testing ${endpoint}...`, 'blue');
  
  for (let i = 0; i < TEST_ITERATIONS; i++) {
    try {
      const result = await makeRequest(endpoint, options);
      results.push(result);
      
      // Add small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      log(`Error testing ${endpoint}: ${error.message}`, 'red');
    }
  }
  
  return results;
}

/**
 * Test batch API
 */
async function testBatchAPI() {
  log('Testing Batch API...', 'blue');
  
  const batchRequest = {
    id: 'test-batch-' + Date.now(),
    requests: [
      { method: 'GET', url: '/api/products' },
      { method: 'GET', url: '/api/categories' },
      { method: 'GET', url: '/api/featured' }
    ]
  };
  
  const results = [];
  
  for (let i = 0; i < TEST_ITERATIONS; i++) {
    try {
      const result = await makeRequest('/api/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchRequest)
      });
      
      results.push(result);
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      log(`Error testing batch API: ${error.message}`, 'red');
    }
  }
  
  return results;
}

/**
 * Test caching
 */
async function testCaching() {
  log('Testing Caching...', 'blue');
  
  const results = [];
  
  // First request (cache miss)
  const firstRequest = await makeRequest('/api/products');
  results.push({ type: 'cache-miss', ...firstRequest });
  
  // Second request (should be cache hit)
  const secondRequest = await makeRequest('/api/products');
  results.push({ type: 'cache-hit', ...secondRequest });
  
  return results;
}

/**
 * Calculate statistics
 */
function calculateStats(results) {
  const durations = results.map(r => r.duration);
  const sizes = results.map(r => r.size);
  
  return {
    count: results.length,
    avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
    minDuration: Math.min(...durations),
    maxDuration: Math.max(...durations),
    avgSize: sizes.reduce((a, b) => a + b, 0) / sizes.length,
    successRate: results.filter(r => r.status >= 200 && r.status < 300).length / results.length * 100
  };
}

/**
 * Test performance monitoring
 */
async function testPerformanceMonitoring() {
  log('Testing Performance Monitoring...', 'blue');
  
  try {
    const result = await makeRequest('/api/analytics/performance');
    return result;
  } catch (error) {
    log(`Error testing performance monitoring: ${error.message}`, 'red');
    return null;
  }
}

/**
 * Main test function
 */
async function runTests() {
  logHeader('🚀 Edge Request Optimization Test Suite');
  
  const testResults = {};
  
  // Test 1: Basic API endpoints
  logHeader('1. Testing Basic API Endpoints');
  
  const endpoints = [
    '/api/products',
    '/api/categories',
    '/api/featured'
  ];
  
  for (const endpoint of endpoints) {
    const results = await testEndpoint(endpoint);
    const stats = calculateStats(results);
    
    testResults[endpoint] = stats;
    
    log(`${endpoint}:`, 'green');
    log(`  Average Duration: ${stats.avgDuration.toFixed(2)}ms`);
    log(`  Min/Max Duration: ${stats.minDuration.toFixed(2)}ms / ${stats.maxDuration.toFixed(2)}ms`);
    log(`  Success Rate: ${stats.successRate.toFixed(1)}%`);
    log(`  Average Size: ${(stats.avgSize / 1024).toFixed(2)}KB`);
  }
  
  // Test 2: Batch API
  logHeader('2. Testing Batch API');
  
  const batchResults = await testBatchAPI();
  const batchStats = calculateStats(batchResults);
  
  testResults['batch-api'] = batchStats;
  
  log(`Batch API:`, 'green');
  log(`  Average Duration: ${batchStats.avgDuration.toFixed(2)}ms`);
  log(`  Min/Max Duration: ${batchStats.minDuration.toFixed(2)}ms / ${batchStats.maxDuration.toFixed(2)}ms`);
  log(`  Success Rate: ${batchStats.successRate.toFixed(1)}%`);
  
  // Test 3: Caching
  logHeader('3. Testing Caching');
  
  const cacheResults = await testCaching();
  
  if (cacheResults.length >= 2) {
    const cacheMiss = cacheResults[0];
    const cacheHit = cacheResults[1];
    
    log(`Cache Performance:`, 'green');
    log(`  Cache Miss: ${cacheMiss.duration.toFixed(2)}ms`);
    log(`  Cache Hit: ${cacheHit.duration.toFixed(2)}ms`);
    log(`  Improvement: ${((cacheMiss.duration - cacheHit.duration) / cacheMiss.duration * 100).toFixed(1)}%`);
  }
  
  // Test 4: Performance Monitoring
  logHeader('4. Testing Performance Monitoring');
  
  const monitoringResult = await testPerformanceMonitoring();
  
  if (monitoringResult && monitoringResult.status === 200) {
    log(`Performance Monitoring: ${colors.green}✅ Working${colors.reset}`);
  } else {
    log(`Performance Monitoring: ${colors.red}❌ Not Working${colors.reset}`);
  }
  
  // Summary
  logHeader('📊 Test Summary');
  
  const overallStats = Object.values(testResults).reduce((acc, stats) => {
    acc.totalRequests += stats.count;
    acc.avgDuration += stats.avgDuration * stats.count;
    acc.totalSuccess += stats.count * (stats.successRate / 100);
    return acc;
  }, { totalRequests: 0, avgDuration: 0, totalSuccess: 0 });
  
  overallStats.avgDuration /= overallStats.totalRequests;
  overallStats.successRate = (overallStats.totalSuccess / overallStats.totalRequests) * 100;
  
  log(`Total Requests: ${overallStats.totalRequests}`, 'bold');
  log(`Average Response Time: ${overallStats.avgDuration.toFixed(2)}ms`, 'bold');
  log(`Overall Success Rate: ${overallStats.successRate.toFixed(1)}%`, 'bold');
  
  // Performance recommendations
  logHeader('💡 Performance Recommendations');
  
  if (overallStats.avgDuration > 500) {
    log('⚠️  Average response time is high. Consider:', 'yellow');
    log('   - Optimizing database queries');
    log('   - Implementing more aggressive caching');
    log('   - Using CDN for static assets');
  } else {
    log('✅ Response times are good!', 'green');
  }
  
  if (overallStats.successRate < 95) {
    log('⚠️  Success rate is below 95%. Check for errors:', 'yellow');
    log('   - Review server logs');
    log('   - Check API endpoints');
    log('   - Verify environment configuration');
  } else {
    log('✅ Success rate is excellent!', 'green');
  }
  
  log('\n🎉 Test completed successfully!', 'green');
}

// Run tests
if (require.main === module) {
  runTests().catch(error => {
    log(`Test failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runTests, testEndpoint, testBatchAPI, testCaching };
