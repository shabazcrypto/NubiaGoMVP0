#!/usr/bin/env node

/**
 * UI Change Validation Script
 * 
 * This script validates that any UI changes are authorized according to
 * the UI protection mechanism.
 */

const fs = require('fs');
const path = require('path');

// Load protection configuration
const configPath = path.join(__dirname, '..', 'ui-protection-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

function validateUIChange(filePath, changeType) {
  console.log('🔍 Validating UI change...');
  console.log(`File: ${filePath}`);
  console.log(`Change Type: ${changeType}`);
  
  // Check if file is protected
  const isProtected = config.uiProtection.protectedFiles.includes(filePath);
  
  if (isProtected) {
    console.log('⚠️  WARNING: This file is PROTECTED under UI design freeze!');
    console.log('❌ UI changes are NOT ALLOWED without explicit user authorization.');
    console.log('');
    console.log('To make changes, you must:');
    console.log('1. Get explicit user request');
    console.log('2. Get user confirmation');
    console.log('3. Document the change in UI_DESIGN_PROTECTION.md');
    console.log('');
    console.log('🚫 CHANGE BLOCKED');
    return false;
  }
  
  console.log('✅ File is not protected - change allowed');
  return true;
}

function checkProtectionStatus() {
  console.log('🛡️  UI Protection Status Check');
  console.log(`Status: ${config.uiProtection.status}`);
  console.log(`Protection Level: ${config.uiProtection.protectionLevel}`);
  console.log(`Design Freeze Date: ${config.uiProtection.designFreezeDate}`);
  console.log(`Requires User Approval: ${config.uiProtection.requiresUserApproval}`);
  console.log('');
  console.log('Protected Files:');
  config.uiProtection.protectedFiles.forEach(file => {
    console.log(`  - ${file}`);
  });
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'validate':
    const filePath = args[1];
    const changeType = args[2] || 'unknown';
    if (!filePath) {
      console.error('❌ Please provide a file path');
      process.exit(1);
    }
    validateUIChange(filePath, changeType);
    break;
    
  case 'status':
    checkProtectionStatus();
    break;
    
  default:
    console.log('UI Change Validation Script');
    console.log('');
    console.log('Usage:');
    console.log('  node validate-ui-changes.js validate <file-path> [change-type]');
    console.log('  node validate-ui-changes.js status');
    console.log('');
    console.log('Examples:');
    console.log('  node validate-ui-changes.js validate src/app/page.tsx styling');
    console.log('  node validate-ui-changes.js status');
}

module.exports = { validateUIChange, checkProtectionStatus };
