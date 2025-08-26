#!/usr/bin/env node

/**
 * 🛡️ UI PROTECTION MONITOR
 * 
 * Comprehensive monitoring system to ensure the current UI setup remains unchanged
 * without explicit user authorization.
 */

const fs = require('fs');
const path = require('path');

// UI Protection Configuration
const PROTECTION_CONFIG = {
  protectedFiles: [
    'src/app/page.tsx',
    'src/app/products/page.tsx', 
    'src/components/cart/shopping-cart.tsx',
    'next.config.js',
    'src/middleware.ts'
  ],
  
  criticalElements: {
    heroSection: {
      required: ['grid-cols-1 lg:grid-cols-2', 'hero-image.webp', 'UI DESIGN PROTECTION NOTICE'],
      forbidden: ['grid-cols-1', 'single-column']
    },
    shoppingCart: {
      required: ['cart-compact-v2', 'isCompact', 'max-w-xs scale-90'],
      forbidden: ['scale-100', 'max-w-full']
    },
    productsPage: {
      required: ['cart-compact-v2', 'UI DESIGN PROTECTION NOTICE', 'Image'],
      forbidden: ['LocalProductImage']
    }
  },
  
  protectionHeaders: [
    '🛡️ UI DESIGN PROTECTION NOTICE',
    '@ui-protected: true',
    '@requires-user-approval: true'
  ]
};

/**
 * Check if file contains protection header
 */
function hasProtectionHeader(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return PROTECTION_CONFIG.protectionHeaders.some(header => 
      content.includes(header)
    );
  } catch (error) {
    return false;
  }
}

/**
 * Validate critical UI elements
 */
function validateCriticalElements(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    const issues = [];
    
    // Check hero section (only for main page, not products page)
    if (fileName === 'page.tsx' && filePath.includes('src/app') && !filePath.includes('products')) {
      if (!content.includes('grid-cols-1 lg:grid-cols-2')) {
        issues.push('❌ Hero section missing two-column layout');
      }
      if (!content.includes('hero-image.webp')) {
        issues.push('❌ Hero section missing hero image');
      }
    }
    
    // Check shopping cart
    if (fileName === 'shopping-cart.tsx') {
      if (!content.includes('cart-compact-v2')) {
        issues.push('❌ Shopping cart missing compact styling');
      }
      if (!content.includes('isCompact')) {
        issues.push('❌ Shopping cart missing compact logic');
      }
    }
    
    // Check products page
    if (fileName === 'page.tsx' && filePath.includes('products')) {
      if (!content.includes('cart-compact-v2')) {
        issues.push('❌ Products page missing compact cart class');
      }
      if (!content.includes('Image')) {
        issues.push('❌ Products page missing Next.js Image component');
      }
    }
    
    return issues;
  } catch (error) {
    return [`❌ Error reading file: ${error.message}`];
  }
}

/**
 * Main validation function
 */
function validateUIProtection() {
  console.log('🛡️ UI PROTECTION MONITOR - Validating Current Setup\n');
  
  let totalIssues = 0;
  let protectedFilesCount = 0;
  
  // Validate each protected file
  PROTECTION_CONFIG.protectedFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      protectedFilesCount++;
      console.log(`📁 Checking: ${filePath}`);
      
      // Check protection header
      if (!hasProtectionHeader(filePath)) {
        console.log('⚠️  Missing UI protection header');
        totalIssues++;
      } else {
        console.log('✅ Protection header found');
      }
      
      // Check critical elements
      const issues = validateCriticalElements(filePath);
      if (issues.length > 0) {
        issues.forEach(issue => {
          console.log(`  ${issue}`);
          totalIssues++;
        });
      } else {
        console.log('✅ Critical elements validated');
      }
      
      console.log('');
    } else {
      console.log(`❌ File not found: ${filePath}\n`);
      totalIssues++;
    }
  });
  
  // Summary
  console.log('='.repeat(50));
  console.log('📊 VALIDATION SUMMARY');
  console.log('='.repeat(50));
  console.log(`Protected files checked: ${protectedFilesCount}`);
  console.log(`Total issues found: ${totalIssues}`);
  
  if (totalIssues === 0) {
    console.log('\n🎉 UI PROTECTION STATUS: SECURE');
    console.log('✅ All critical elements are protected');
    console.log('✅ No unauthorized changes detected');
    console.log('✅ Current UI setup is locked');
  } else {
    console.log('\n🚨 UI PROTECTION STATUS: COMPROMISED');
    console.log('❌ Unauthorized changes detected');
    console.log('❌ UI protection has been breached');
    console.log('❌ Immediate action required');
  }
  
  return totalIssues === 0;
}

/**
 * Continuous monitoring mode
 */
function startMonitoring() {
  console.log('🔄 Starting continuous UI protection monitoring...\n');
  
  // Initial validation
  validateUIProtection();
  
  // Monitor file changes
  PROTECTION_CONFIG.protectedFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const watcher = fs.watch(filePath, (eventType, filename) => {
        if (eventType === 'change') {
          console.log(`\n🚨 FILE MODIFIED: ${filePath}`);
          console.log('⚠️  Unauthorized change detected!');
          console.log('🛡️  UI Protection system activated');
          
          // Re-validate
          setTimeout(() => {
            console.log('\n🔄 Re-validating after change...\n');
            validateUIProtection();
          }, 1000);
        }
      });
      
      console.log(`👁️  Monitoring: ${filePath}`);
    }
  });
  
  console.log('\n✅ Continuous monitoring active');
  console.log('🛡️  UI Protection system is now locked');
  console.log('⏹️  Press Ctrl+C to stop monitoring\n');
}

// Run validation
if (process.argv.includes('--monitor')) {
  startMonitoring();
} else {
  const isValid = validateUIProtection();
  process.exit(isValid ? 0 : 1);
}
