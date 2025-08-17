// JWT verification utility for Edge Runtime
// SECURE IMPLEMENTATION - Fixed critical signature verification bypass

interface JWTPayload {
  iss: string
  aud: string
  auth_time: number
  user_id: string
  sub: string
  iat: number
  exp: number
  email: string
  email_verified: boolean
  firebase: {
    identities: Record<string, any>
    sign_in_provider: string
  }
}

interface VerificationResult {
  valid: boolean
  payload?: JWTPayload
  error?: string
}

interface JWTHeader {
  alg: string
  kid: string
  typ: string
}

export class JWTVerifier {
  private static readonly FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  private static readonly FIREBASE_AUTH_DOMAIN = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  private static readonly PUBLIC_KEYS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
  
  // Cache for public keys to avoid repeated fetches
  private static publicKeysCache: Record<string, string> = {}
  private static cacheExpiry: number = 0
  private static readonly CACHE_TTL = 60 * 60 * 1000 // 1 hour

  /**
   * Verify Firebase JWT token with proper signature verification
   */
  static async verifyToken(token: string): Promise<VerificationResult> {
    try {
      if (!token) {
        return { valid: false, error: 'No token provided' }
      }

      // Decode the JWT token
      const decoded = this.decodeJWT(token)
      
      if (!decoded) {
        return { valid: false, error: 'Invalid token format' }
      }

      // Basic validation
      if (!this.isValidPayload(decoded)) {
        return { valid: false, error: 'Invalid token payload' }
      }

      // Check expiration
      if (this.isExpired(decoded)) {
        return { valid: false, error: 'Token expired' }
      }

      // Check issuer
      if (!this.isValidIssuer(decoded)) {
        return { valid: false, error: 'Invalid issuer' }
      }

      // Check audience
      if (!this.isValidAudience(decoded)) {
        return { valid: false, error: 'Invalid audience' }
      }

      // CRITICAL FIX: Verify signature cryptographically
      if (!await this.verifySignature(token)) {
        return { valid: false, error: 'Invalid signature' }
      }

      return { valid: true, payload: decoded }
    } catch (error) {
      console.error('JWT verification error:', error)
      return { valid: false, error: 'Token verification failed' }
    }
  }

  /**
   * Decode JWT token (base64 decode only)
   */
  private static decodeJWT(token: string): JWTPayload | null {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        return null
      }

      // Decode payload
      const payload = parts[1]
      const decoded = JSON.parse(atob(payload))
      
      return decoded as JWTPayload
    } catch (error) {
      console.error('JWT decode error:', error)
      return null
    }
  }

  /**
   * Decode JWT header to get algorithm and key ID
   */
  private static decodeJWTHeader(token: string): JWTHeader | null {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        return null
      }

      const header = parts[0]
      const decoded = JSON.parse(atob(header))
      
      return decoded as JWTHeader
    } catch (error) {
      console.error('JWT header decode error:', error)
      return null
    }
  }

  /**
   * Check if payload has required fields
   */
  private static isValidPayload(payload: any): payload is JWTPayload {
    return (
      payload &&
      typeof payload === 'object' &&
      typeof payload.sub === 'string' &&
      typeof payload.iat === 'number' &&
      typeof payload.exp === 'number' &&
      typeof payload.user_id === 'string' &&
      typeof payload.email === 'string'
    )
  }

  /**
   * Check if token is expired
   */
  private static isExpired(payload: JWTPayload): boolean {
    const now = Math.floor(Date.now() / 1000)
    return payload.exp < now
  }

  /**
   * Check if issuer is valid
   */
  private static isValidIssuer(payload: JWTPayload): boolean {
    const expectedIssuer = `https://securetoken.google.com/${this.FIREBASE_PROJECT_ID}`
    return payload.iss === expectedIssuer
  }

  /**
   * Check if audience is valid
   */
  private static isValidAudience(payload: JWTPayload): boolean {
    return payload.aud === this.FIREBASE_PROJECT_ID
  }

  /**
   * SECURE IMPLEMENTATION: Verify JWT signature cryptographically
   */
  private static async verifySignature(token: string): Promise<boolean> {
    try {
      // 1. Decode header to get key ID and algorithm
      const header = this.decodeJWTHeader(token)
      if (!header || !header.kid || !header.alg) {
        console.error('Invalid JWT header')
        return false
      }

      // 2. Validate algorithm (only allow RS256)
      if (header.alg !== 'RS256') {
        console.error(`Unsupported algorithm: ${header.alg}`)
        return false
      }

      // 3. Fetch Firebase public keys
      const publicKeys = await this.fetchFirebasePublicKeys()
      if (!publicKeys || !publicKeys[header.kid]) {
        console.error(`Public key not found for kid: ${header.kid}`)
        return false
      }

      // 4. Get the public key
      const publicKey = publicKeys[header.kid]
      
      // 5. Verify signature using crypto module
      const isValid = await this.verifyRSASignature(token, publicKey)
      
      if (!isValid) {
        console.error('Signature verification failed')
        return false
      }

      return true
    } catch (error) {
      console.error('Signature verification error:', error)
      return false
    }
  }

  /**
   * Fetch Firebase public keys from Google's metadata endpoint
   */
  private static async fetchFirebasePublicKeys(): Promise<Record<string, string>> {
    try {
      // Check cache first
      if (this.publicKeysCache && Object.keys(this.publicKeysCache).length > 0 && Date.now() < this.cacheExpiry) {
        return this.publicKeysCache
      }

      // Fetch from Google's metadata endpoint
      const response = await fetch(this.PUBLIC_KEYS_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NubiaGo-JWT-Verifier/1.0'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch public keys: ${response.status}`)
      }

      const keys = await response.json()
      
      // Cache the keys
      this.publicKeysCache = keys
      this.cacheExpiry = Date.now() + this.CACHE_TTL

      return keys
    } catch (error) {
      console.error('Failed to fetch Firebase public keys:', error)
      // Return cached keys if available, even if expired
      return this.publicKeysCache || {}
    }
  }

  /**
   * Verify RSA signature using Web Crypto API
   */
  private static async verifyRSASignature(token: string, publicKeyPEM: string): Promise<boolean> {
    try {
      // Parse the JWT parts
      const parts = token.split('.')
      if (parts.length !== 3) {
        return false
      }

      const header = parts[0]
      const payload = parts[1]
      const signature = parts[2]

      // Create the data to verify (header.payload)
      const data = `${header}.${payload}`
      
      // Convert PEM to ArrayBuffer
      const publicKeyBuffer = this.pemToArrayBuffer(publicKeyPEM)
      
      // Import the public key
      const cryptoKey = await crypto.subtle.importKey(
        'spki',
        publicKeyBuffer,
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: 'SHA-256'
        },
        false,
        ['verify']
      )

      // Convert base64url signature to ArrayBuffer
      const signatureBuffer = this.base64UrlToArrayBuffer(signature)
      
      // Convert data to ArrayBuffer
      const dataBuffer = new TextEncoder().encode(data)

      // Verify the signature
      const isValid = await crypto.subtle.verify(
        'RSASSA-PKCS1-v1_5',
        cryptoKey,
        signatureBuffer,
        dataBuffer
      )

      return isValid
    } catch (error) {
      console.error('RSA signature verification error:', error)
      return false
    }
  }

  /**
   * Convert PEM format to ArrayBuffer
   */
  private static pemToArrayBuffer(pem: string): ArrayBuffer {
    // Remove PEM headers and convert to base64
    const base64 = pem
      .replace(/-----BEGIN PUBLIC KEY-----/, '')
      .replace(/-----END PUBLIC KEY-----/, '')
      .replace(/\s/g, '')
    
    // Convert base64 to ArrayBuffer
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }

  /**
   * Convert base64url to ArrayBuffer
   */
  private static base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
        // Convert base64url to base64
    let base64 = base64url
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    // Add padding if needed
    while (base64.length % 4) {
      base64 += '='
    }
    
    // Convert base64 to ArrayBuffer
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }

  /**
   * Extract user data from JWT payload
   */
  static extractUserData(payload: JWTPayload) {
    return {
      uid: payload.user_id,
      email: payload.email,
      emailVerified: payload.email_verified
    }
  }

  /**
   * Clear public keys cache (useful for testing)
   */
  static clearCache(): void {
    this.publicKeysCache = {}
    this.cacheExpiry = 0
  }
} 
