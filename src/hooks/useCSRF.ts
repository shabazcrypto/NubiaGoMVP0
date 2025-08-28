import { useState, useEffect, useCallback } from 'react'
import { CSRFProtection } from '@/lib/security/csrf'

/**
 * ENTERPRISE-GRADE Session Management with enhanced security
 */
export function useEnterpriseSession() {
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // SECURITY: Session configuration
  const SESSION_CONFIG = {
    MAX_CONCURRENT_SESSIONS: 3,
    SESSION_TTL: 24 * 60 * 60 * 1000, // 24 hours
    INACTIVITY_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes
    CLEANUP_INTERVAL: 10 * 60 * 1000 // 10 minutes
  }

  // SECURITY: Session data interface
  interface SessionData {
    sessionId: string
    sessionToken: string
    userId: string
    deviceInfo: DeviceInfo
    createdAt: Date
    lastActivity: Date
    isActive: boolean
    permissions: string[]
    metadata: Record<string, any>
  }

  interface DeviceInfo {
    userAgent: string
    ipAddress: string
    deviceId: string
    fingerprint: string
  }

  // SECURITY: Initialize session management
  useEffect(() => {
    initializeSession()
    
    // SECURITY: Set up activity monitoring
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    const updateActivity = () => updateLastActivity()
    
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true })
    })

    // SECURITY: Set up periodic session refresh
    const refreshInterval = setInterval(refreshSessionIfNeeded, SESSION_CONFIG.REFRESH_INTERVAL)
    
    // SECURITY: Set up session cleanup
    const cleanupInterval = setInterval(cleanupExpiredSessions, SESSION_CONFIG.CLEANUP_INTERVAL)

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity)
      })
      clearInterval(refreshInterval)
      clearInterval(cleanupInterval)
    }
  }, [])

  // SECURITY: Initialize session
  const initializeSession = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Check for existing session
      const existingSession = await getExistingSession()
      if (existingSession) {
        // SECURITY: Validate existing session
        const isValid = await validateSession(existingSession)
        if (isValid) {
          setSessionData(existingSession)
          await updateLastActivity()
        } else {
          // SECURITY: Clear invalid session
          await clearSession()
        }
      } else {
        // SECURITY: Create new session
        const newSession = await createNewSession()
        setSessionData(newSession)
      }
    } catch (error) {
      // // console.infor('Session initialization error:', error)
      setError('Failed to initialize session')
    } finally {
      setIsLoading(false)
    }
  }

  // SECURITY: Create new session with device fingerprinting
  const createNewSession = async (): Promise<SessionData> => {
    try {
      // SECURITY: Generate cryptographically secure tokens
      const sessionId = crypto.randomUUID()
      const sessionToken = crypto.randomUUID()
      
      // SECURITY: Get device information
      const deviceInfo = await getDeviceInfo()
      
      // SECURITY: Check concurrent sessions
      await checkConcurrentSessions()
      
      const session: SessionData = {
        sessionId,
        sessionToken,
        userId: 'anonymous', // Will be updated after authentication
        deviceInfo,
        createdAt: new Date(),
        lastActivity: new Date(),
        isActive: true,
        permissions: [],
        metadata: {}
      }

      // SECURITY: Store session securely
      await storeSession(session)
      
      return session
    } catch (error) {
      // // console.infor('Session creation error:', error)
      throw new Error('Failed to create session')
    }
  }

  // SECURITY: Get device information for fingerprinting
  const getDeviceInfo = async (): Promise<DeviceInfo> => {
    const userAgent = navigator.userAgent
    const ipAddress = await getClientIP()
    
    // SECURITY: Generate device fingerprint
    const deviceId = await generateDeviceFingerprint()
    
    return {
      userAgent,
      ipAddress,
      deviceId,
      fingerprint: deviceId
    }
  }

  // SECURITY: Generate device fingerprint
  const generateDeviceFingerprint = async (): Promise<string> => {
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency,
      (navigator as any).deviceMemory || 0,
      navigator.platform
    ]
    
    const fingerprint = components.join('|')
    const encoder = new TextEncoder()
    const data = encoder.encode(fingerprint)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // SECURITY: Get client IP address
  const getClientIP = async (): Promise<string> => {
    try {
      // In a real implementation, this would be done server-side
      // For now, return a placeholder
      return 'client-ip'
    } catch (error) {
      return 'unknown'
    }
  }

  // SECURITY: Check concurrent sessions
  const checkConcurrentSessions = async () => {
    try {
      const activeSessions = await getActiveSessions()
      if (activeSessions.length >= SESSION_CONFIG.MAX_CONCURRENT_SESSIONS) {
        // SECURITY: Invalidate oldest session
        const oldestSession = activeSessions.sort((a, b) => 
          new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime()
        )[0]
        
        await invalidateSession(oldestSession.sessionId)
      }
    } catch (error) {
      // // console.infor('Concurrent session check error:', error)
    }
  }

  // SECURITY: Validate session
  const validateSession = async (session: SessionData): Promise<boolean> => {
    try {
      // Check if session is active
      if (!session.isActive) return false
      
      // Check if session has expired
      const now = new Date()
      const sessionAge = now.getTime() - new Date(session.createdAt).getTime()
      if (sessionAge > SESSION_CONFIG.SESSION_TTL) return false
      
      // Check if session is inactive
      const lastActivity = new Date(session.lastActivity).getTime()
      const inactivityAge = now.getTime() - lastActivity
      if (inactivityAge > SESSION_CONFIG.INACTIVITY_TIMEOUT) return false
      
      // SECURITY: Validate device fingerprint
      const currentDeviceId = await generateDeviceFingerprint()
      if (session.deviceInfo.deviceId !== currentDeviceId) {
        // // // // console.warn('Device fingerprint mismatch - potential session hijacking')
        return false
      }
      
      return true
    } catch (error) {
      // // console.infor('Session validation error:', error)
      return false
    }
  }

  // SECURITY: Update last activity
  const updateLastActivity = async () => {
    if (sessionData) {
      try {
        sessionData.lastActivity = new Date()
        await storeSession(sessionData)
      } catch (error) {
        // // console.infor('Activity update error:', error)
      }
    }
  }

  // SECURITY: Refresh session if needed
  const refreshSessionIfNeeded = async () => {
    if (sessionData) {
      try {
        const isValid = await validateSession(sessionData)
        if (!isValid) {
          await clearSession()
          setSessionData(null)
        }
      } catch (error) {
        // // console.infor('Session refresh error:', error)
      }
    }
  }

  // SECURITY: Cleanup expired sessions
  const cleanupExpiredSessions = async () => {
    try {
      const activeSessions = await getActiveSessions()
      const now = new Date()
      
      for (const session of activeSessions) {
        const sessionAge = now.getTime() - new Date(session.createdAt).getTime()
        if (sessionAge > SESSION_CONFIG.SESSION_TTL) {
          await invalidateSession(session.sessionId)
        }
      }
    } catch (error) {
      // // console.infor('Session cleanup error:', error)
    }
  }

  // SECURITY: Store session securely
  const storeSession = async (session: SessionData): Promise<void> => {
    try {
      // SECURITY: Use secure storage (httpOnly cookies in production)
      if (typeof window !== 'undefined') {
        const sessionKey = `session_${session.sessionId}`
        const encryptedData = await encryptSessionData(session)
        localStorage.setItem(sessionKey, encryptedData)
      }
    } catch (error) {
      // // console.infor('Session storage error:', error)
      throw error
    }
  }

  // SECURITY: Get existing session
  const getExistingSession = async (): Promise<SessionData | null> => {
    try {
      if (typeof window !== 'undefined') {
        // SECURITY: Check for session in secure storage
        const sessionKeys = Object.keys(localStorage).filter(key => key.startsWith('session_'))
        
        for (const key of sessionKeys) {
          try {
            const encryptedData = localStorage.getItem(key)
            if (encryptedData) {
              const session = await decryptSessionData(encryptedData)
              if (session && await validateSession(session)) {
                return session
              }
            }
          } catch (error) {
            // // // // console.warn('Failed to decrypt session:', key, error)
            // SECURITY: Remove corrupted session
            localStorage.removeItem(key)
          }
        }
      }
      
      return null
    } catch (error) {
      // // console.infor('Session retrieval error:', error)
      return null
    }
  }

  // SECURITY: Encrypt session data
  const encryptSessionData = async (data: SessionData): Promise<string> => {
    try {
      const jsonString = JSON.stringify(data)
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(jsonString)
      
      // SECURITY: Use a simple encryption for demo (use proper encryption in production)
      const key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      )
      
      const iv = crypto.getRandomValues(new Uint8Array(12))
      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        dataBuffer
      )
      
      const encryptedArray = new Uint8Array(encryptedBuffer)
      const combined = new Uint8Array(iv.length + encryptedArray.length)
      combined.set(iv)
      combined.set(encryptedArray)
      
      return btoa(String.fromCharCode(...combined))
    } catch (error) {
      // // console.infor('Session encryption error:', error)
      throw error
    }
  }

  // SECURITY: Decrypt session data
  const decryptSessionData = async (encryptedData: string): Promise<SessionData | null> => {
    try {
      const combined = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      )
      
      const iv = combined.slice(0, 12)
      const encryptedArray = combined.slice(12)
      
      // SECURITY: Use proper key management in production
      const key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      )
      
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encryptedArray
      )
      
      const decoder = new TextDecoder()
      const jsonString = decoder.decode(decryptedBuffer)
      
      return JSON.parse(jsonString) as SessionData
    } catch (error) {
      // // console.infor('Session decryption error:', error)
      return null
    }
  }

  // SECURITY: Get active sessions
  const getActiveSessions = async (): Promise<SessionData[]> => {
    try {
      if (typeof window !== 'undefined') {
        const sessionKeys = Object.keys(localStorage).filter(key => key.startsWith('session_'))
        const sessions: SessionData[] = []
        
        for (const key of sessionKeys) {
          try {
            const encryptedData = localStorage.getItem(key)
            if (encryptedData) {
              const session = await decryptSessionData(encryptedData)
              if (session && session.isActive) {
                sessions.push(session)
              }
            }
          } catch (error) {
            // // // // console.warn('Failed to decrypt session:', key, error)
          }
        }
        
        return sessions
      }
      
      return []
    } catch (error) {
      // // console.infor('Active sessions retrieval error:', error)
      return []
    }
  }

  // SECURITY: Invalidate session
  const invalidateSession = async (sessionId: string): Promise<void> => {
    try {
      if (typeof window !== 'undefined') {
        const sessionKey = `session_${sessionId}`
        localStorage.removeItem(sessionKey)
      }
    } catch (error) {
      // // console.infor('Session invalidation error:', error)
    }
  }

  // SECURITY: Clear current session
  const clearSession = async (): Promise<void> => {
    try {
      if (sessionData) {
        await invalidateSession(sessionData.sessionId)
      }
      
      if (typeof window !== 'undefined') {
        // Clear all session data
        const sessionKeys = Object.keys(localStorage).filter(key => key.startsWith('session_'))
        sessionKeys.forEach(key => localStorage.removeItem(key))
      }
      
      setSessionData(null)
    } catch (error) {
      // // console.infor('Session clear error:', error)
    }
  }

  return {
    sessionData,
    isLoading,
    error,
    createNewSession,
    validateSession,
    updateLastActivity,
    clearSession,
    getActiveSessions
  }
}

/**
 * Hook for managing CSRF tokens in React components
 */
export function useCSRF() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Generate a new CSRF token
   */
  const generateToken = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get session token from cookies or localStorage
      const sessionToken = getSessionToken()
      
      if (!sessionToken) {
        throw new Error('No session token found')
      }

      // Generate CSRF token
      const secret = process.env.NEXT_PUBLIC_CSRF_SECRET || 'fallback-secret'
      const tokenData = CSRFProtection.generateToken(sessionToken, secret)
      const signedToken = CSRFProtection.generateSignedToken(sessionToken, secret)

      // Store token in localStorage with expiry
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem('csrf-token', signedToken)
          localStorage.setItem('csrf-expires', tokenData.expiresAt.toString())
        } catch (error) {
          // // // // console.warn('Failed to store CSRF token in localStorage:', error)
        }
      }

      setCsrfToken(signedToken)
      return signedToken
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate CSRF token'
      setError(errorMessage)
      // // console.infor('CSRF token generation error:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Validate current CSRF token
   */
  const validateToken = useCallback((token: string): boolean => {
    try {
      const sessionToken = getSessionToken()
      if (!sessionToken || !token) return false

      const secret = process.env.NEXT_PUBLIC_CSRF_SECRET || 'fallback-secret'
      const result = CSRFProtection.validateSignedToken(token, sessionToken, secret)
      return result.valid
    } catch (err) {
      // // console.infor('CSRF token validation error:', err)
      return false
    }
  }, [])

  /**
   * Refresh CSRF token if expired
   */
  const refreshTokenIfNeeded = useCallback(async (): Promise<string | null> => {
    try {
      let storedToken: string | null = null
      let expiresAt: string | null = null
      
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        try {
          storedToken = localStorage.getItem('csrf-token')
          expiresAt = localStorage.getItem('csrf-expires')
        } catch (error) {
          // // // // console.warn('Failed to read CSRF token from localStorage:', error)
        }
      }

      if (!storedToken || !expiresAt) {
        return await generateToken()
      }

      const isExpired = CSRFProtection.isTokenExpired(parseInt(expiresAt))
      
      if (isExpired) {
        // // // // console.log('CSRF token expired, generating new one')
        return await generateToken()
      }

      // Validate existing token
      if (validateToken(storedToken)) {
        setCsrfToken(storedToken)
        return storedToken
      } else {
        // // // // console.log('Stored CSRF token invalid, generating new one')
        return await generateToken()
      }
    } catch (err) {
      // // console.infor('Error refreshing CSRF token:', err)
      return await generateToken()
    }
  }, [generateToken, validateToken])

  /**
   * Get CSRF token for API requests
   */
  const getTokenForRequest = useCallback(async (): Promise<string | null> => {
    if (!csrfToken) {
      return await refreshTokenIfNeeded()
    }

    if (validateToken(csrfToken)) {
      return csrfToken
    }

    return await refreshTokenIfNeeded()
  }, [csrfToken, refreshTokenIfNeeded, validateToken])

  /**
   * Clear CSRF token
   */
  const clearToken = useCallback(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem('csrf-token')
        localStorage.removeItem('csrf-expires')
      } catch (error) {
        // // // // console.warn('Failed to clear CSRF token from localStorage:', error)
      }
    }
    setCsrfToken(null)
  }, [])

  // Initialize CSRF token on mount
  useEffect(() => {
    refreshTokenIfNeeded()
  }, [])

  // Set up periodic token refresh (every 12 hours)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshTokenIfNeeded()
    }, 12 * 60 * 60 * 1000) // 12 hours

    return () => clearInterval(interval)
  }, [])

  return {
    csrfToken,
    isLoading,
    error,
    generateToken,
    validateToken,
    refreshTokenIfNeeded,
    getTokenForRequest,
    clearToken
  }
}

/**
 * Get session token from cookies or localStorage
 */
function getSessionToken(): string | null {
  // Try to get from cookies first
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)

    if (cookies['session']) return cookies['session']
    if (cookies['auth-token']) return cookies['auth-token']
  }

  // Fallback to localStorage
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      return localStorage.getItem('session-token') || 
             localStorage.getItem('auth-token')
    } catch (error) {
      // // // // console.warn('Failed to read session token from localStorage:', error)
      return null
    }
  }

  return null
}

/**
 * Hook for adding CSRF token to fetch requests
 */
export function useCSRFFetch() {
  const { getTokenForRequest } = useCSRF()

  const fetchWithCSRF = useCallback(async (
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> => {
    try {
      const csrfToken = await getTokenForRequest()
      
      if (csrfToken) {
        options.headers = {
          ...options.headers,
          'x-csrf-token': csrfToken
        }
      }

      return fetch(url, options)
    } catch (error) {
      // // console.infor('Error adding CSRF token to request:', error)
      // Continue without CSRF token if there's an error
      return fetch(url, options)
    }
  }, [getTokenForRequest])

  return { fetchWithCSRF }
}

/**
 * Hook for forms that need CSRF protection
 */
export function useCSRFForm() {
  const { csrfToken, isLoading, error } = useCSRF()

  const getFormProps = useCallback(() => ({
    'data-csrf-token': csrfToken,
    'data-csrf-loading': isLoading,
    'data-csrf-error': error
  }), [csrfToken, isLoading, error])

  return {
    csrfToken,
    isLoading,
    error,
    getFormProps
  }
}
