// Simple JavaScript test script for CSRF token generation
const crypto = require('crypto');

// Simple CSRF token generation and verification
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function createCSRFToken(secret, token) {
  return crypto
    .createHmac('sha256', secret)
    .update(token)
    .digest('hex');
}

// Test
console.log('Testing CSRF token generation...\n');

const secret = process.env.CSRF_SECRET || 'your-secret-key';
const token = generateToken();
const tokenHash = createCSRFToken(secret, token);

console.log('Token:', token);
console.log('Token Hash:', tokenHash);

// Verify
const verifyToken = (token, tokenHash) => {
  const expectedHash = createCSRFToken(secret, token);
  return crypto.timingSafeEqual(
    Buffer.from(tokenHash, 'hex'),
    Buffer.from(expectedHash, 'hex')
  );
};

console.log('\nVerifying token...');
const isValid = verifyToken(token, tokenHash);
console.log('✅ Token is', isValid ? 'valid' : 'invalid');

// Test with invalid token
console.log('\nTesting with invalid token...');
const isInvalidValid = verifyToken('invalid-token', tokenHash);
console.log('✅ Invalid token is', !isInvalidValid ? 'correctly rejected' : 'incorrectly accepted');
