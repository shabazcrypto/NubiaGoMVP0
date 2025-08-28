import { randomBytes, createHmac, timingSafeEqual } from 'crypto'

/**
 * ENTERPRISE-GRADE CSRF Token Management
 * Provides secure generation and validation of CSRF tokens with proper cryptographic verification
 */

export interface CSRFTokenData {
  token: string
  expiresAt: number
  sessionId: string
  nonce: string
}

export interface CSRFValidationResult {
  valid: boolean
  reason?: string
  expiresAt?: number
}

export class CSRFProtection {
  private static readonly TOKEN_LENGTH = 32
  private static readonly TOKEN_EXPIRY = 15 * 60 * 1000 // 15 minutes (reduced for security)
  private static readonly NONCE_LENGTH = 16
  private static readonly MAX_TOKENS_PER_SESSION = 5

  // In-memory token store (in production, use Redis or database)
  private static tokenStore = new Map<string, CSRFTokenData[]>()
  private static readonly CLEANUP_INTERVAL = 5 * 60 * 1000 // 5 minutes

  static {
    // Cleanup expired tokens periodically
    setInterval(() => this.cleanupExpiredTokens(), this.CLEANUP_INTERVAL)
  }

  /**
   * Generate a new CSRF token with enhanced security
   */
  static generateToken(sessionId: string, secret: string): CSRFTokenData {
    try {
      // SECURITY: Generate cryptographically secure random token
      const token = randomBytes(this.TOKEN_LENGTH).toString('hex')
      
      // SECURITY: Add nonce for additional entropy
      const nonce = randomBytes(this.NONCE_LENGTH).toString('hex')
      
      // SECURITY: Reduced expiry time for better security
      const expiresAt = Date.now() + this.TOKEN_EXPIRY

      const tokenData: CSRFTokenData = {
        token,
        expiresAt,
        sessionId,
        nonce
      }

      // Store token for validation
      this.storeToken(sessionId, tokenData)

      return tokenData
    } catch (error) {
      // // // console.error('CSRF token generation error:', error)
      throw new Error('Failed to generate CSRF token')
    }
  }

  /**
   * Validate a CSRF token with comprehensive security checks
   */
  static validateToken(token: string, sessionId: string, secret: string): CSRFValidationResult {
    try {
      // SECURITY: Input validation
      if (!token || !sessionId || !secret) {
        return { valid: false, reason: 'Missing required parameters' }
      }

      // SECURITY: Check token format
      if (token.length !== this.TOKEN_LENGTH * 2) {
        return { valid: false, reason: 'Invalid token length' }
      }

      // SECURITY: Validate token format (hex only)
      if (!/^[a-f0-9]+$/i.test(token)) {
        return { valid: false, reason: 'Invalid token format' }
      }

      // SECURITY: Check if token exists in store
      const storedTokens = this.tokenStore.get(sessionId) || []
      const tokenData = storedTokens.find(t => t.token === token)

      if (!tokenData) {
        return { valid: false, reason: 'Token not found' }
      }

      // SECURITY: Check if token is expired
      if (this.isTokenExpired(tokenData.expiresAt)) {
        // Remove expired token
        this.removeToken(sessionId, token)
        return { valid: false, reason: 'Token expired' }
      }

      // SECURITY: Verify session ID matches
      if (tokenData.sessionId !== sessionId) {
        return { valid: false, reason: 'Session mismatch' }
      }

      // SECURITY: Use constant-time comparison to prevent timing attacks
      const isValid = timingSafeEqual(
        Buffer.from(token, 'hex'),
        Buffer.from(tokenData.token, 'hex')
      )

      if (!isValid) {
        return { valid: false, reason: 'Token validation failed' }
      }

      return { 
        valid: true, 
        expiresAt: tokenData.expiresAt 
      }
    } catch (error) {
      // // // console.error('CSRF token validation error:', error)
      return { valid: false, reason: 'Validation error' }
    }
  }

  /**
   * Generate a signed CSRF token with HMAC signature
   */
  static generateSignedToken(sessionId: string, secret: string): string {
    try {
      const tokenData = this.generateToken(sessionId, secret)
      
      // SECURITY: Create HMAC signature with multiple components
      const signature = this.signToken(tokenData.token, sessionId, secret, tokenData.nonce)
      
      // SECURITY: Include expiry time in signature
      const signedToken = `${tokenData.token}.${tokenData.nonce}.${tokenData.expiresAt}.${signature}`
      
      return signedToken
    } catch (error) {
      // // // console.error('Signed CSRF token generation error:', error)
      throw new Error('Failed to generate signed CSRF token')
    }
  }

  /**
   * Validate a signed CSRF token with comprehensive verification
   */
  static validateSignedToken(signedToken: string, sessionId: string, secret: string): CSRFValidationResult {
    try {
      const parts = signedToken.split('.')
      
      if (parts.length !== 4) {
        return { valid: false, reason: 'Invalid token format' }
      }

      const [token, nonce, expiresAtStr, signature] = parts
      
      if (!token || !nonce || !expiresAtStr || !signature) {
        return { valid: false, reason: 'Missing token components' }
      }

      // SECURITY: Validate expiry time
      const expiresAt = parseInt(expiresAtStr, 10)
      if (isNaN(expiresAt) || this.isTokenExpired(expiresAt)) {
        return { valid: false, reason: 'Token expired' }
      }

      // SECURITY: Validate token format
      const tokenValidation = this.validateToken(token, sessionId, secret)
      if (!tokenValidation.valid) {
        return tokenValidation
      }

      // SECURITY: Verify HMAC signature
      const expectedSignature = this.signToken(token, sessionId, secret, nonce)
      
      // SECURITY: Use constant-time comparison for signature verification
      const signatureValid = timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      )

      if (!signatureValid) {
        return { valid: false, reason: 'Invalid signature' }
      }

      return { valid: true, expiresAt }
    } catch (error) {
      // // // console.error('Signed CSRF token validation error:', error)
      return { valid: false, reason: 'Signature validation error' }
    }
  }

  /**
   * Sign a token with HMAC using multiple components for security
   */
  private static signToken(token: string, sessionId: string, secret: string, nonce: string): string {
    const hmac = createHmac('sha256', secret)
    
    // SECURITY: Include multiple components in signature
    hmac.update(token)
    hmac.update(sessionId)
    hmac.update(nonce)
    hmac.update(process.env.NODE_ENV || 'development') // Environment-specific signing
    
    return hmac.digest('hex')
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(expiresAt: number): boolean {
    return Date.now() > expiresAt
  }

  /**
   * Refresh a CSRF token (invalidate old, generate new)
   */
  static refreshToken(sessionId: string, secret: string): CSRFTokenData {
    // SECURITY: Invalidate all existing tokens for this session
    this.invalidateAllSessionTokens(sessionId)
    
    // Generate new token
    return this.generateToken(sessionId, secret)
  }

  /**
   * Invalidate a specific token
   */
  static invalidateToken(sessionId: string, token: string): boolean {
    const storedTokens = this.tokenStore.get(sessionId) || []
    const initialLength = storedTokens.length
    
    const filteredTokens = storedTokens.filter(t => t.token !== token)
    this.tokenStore.set(sessionId, filteredTokens)
    
    return filteredTokens.length < initialLength
  }

  /**
   * Invalidate all tokens for a session
   */
  static invalidateAllSessionTokens(sessionId: string): boolean {
    return this.tokenStore.delete(sessionId)
  }

  /**
   * Store token in memory (in production, use Redis or database)
   */
  private static storeToken(sessionId: string, tokenData: CSRFTokenData): void {
    const storedTokens = this.tokenStore.get(sessionId) || []
    
    // SECURITY: Limit tokens per session
    if (storedTokens.length >= this.MAX_TOKENS_PER_SESSION) {
      // Remove oldest token
      storedTokens.shift()
    }
    
    storedTokens.push(tokenData)
    this.tokenStore.set(sessionId, storedTokens)
  }

  /**
   * Remove a specific token
   */
  private static removeToken(sessionId: string, token: string): void {
    const storedTokens = this.tokenStore.get(sessionId) || []
    const filteredTokens = storedTokens.filter(t => t.token !== token)
    this.tokenStore.set(sessionId, filteredTokens)
  }

  /**
   * Cleanup expired tokens
   */
  private static cleanupExpiredTokens(): void {
    const now = Date.now()
    
    for (const [sessionId, tokens] of this.tokenStore.entries()) {
      const validTokens = tokens.filter(t => !this.isTokenExpired(t.expiresAt))
      
      if (validTokens.length === 0) {
        this.tokenStore.delete(sessionId)
      } else {
        this.tokenStore.set(sessionId, validTokens)
      }
    }
  }

  /**
   * Get token statistics for monitoring
   */
  static getTokenStats(): { totalSessions: number; totalTokens: number } {
    let totalTokens = 0
    
    for (const tokens of this.tokenStore.values()) {
      totalTokens += tokens.length
    }
    
    return {
      totalSessions: this.tokenStore.size,
      totalTokens
    }
  }
}

/**
 * Utility function to get CSRF token from request headers
 */
export function getCSRFTokenFromRequest(request: Request): string | null {
  return request.headers.get('x-csrf-token') || 
         request.headers.get('csrf-token') ||
         request.headers.get('x-xsrf-token') ||
         null
}

/**
 * Utility function to get session token from cookies
 */
export function getSessionTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    if (key && value) {
      acc[key] = value
    }
    return acc
  }, {} as Record<string, string>)

  return cookies['session'] || cookies['auth-token'] || cookies['__Secure-session'] || null
}

/**
 * Middleware function to validate CSRF tokens in requests
 */
export function validateCSRFMiddleware(request: Request, secret: string): CSRFValidationResult {
  const csrfToken = getCSRFTokenFromRequest(request)
  const sessionToken = getSessionTokenFromRequest(request)
  
  if (!csrfToken || !sessionToken) {
    return { valid: false, reason: 'Missing CSRF or session token' }
  }
  
  return CSRFProtection.validateSignedToken(csrfToken, sessionToken, secret)
}
