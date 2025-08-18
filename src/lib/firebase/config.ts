import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { logger } from '@/lib/utils/logger'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCrdNo31J54779co1uhxVKCZEybgKK6hII',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'nubiago-latest.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'nubiago-latest',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'nubiago-latest.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1071680034258',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1071680034258:web:e7b95de06ce571dbc0240b',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-XE1YM7HV2J'
}

// Validate required environment variables only in production runtime
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
]

// Only validate in production runtime, not during build
if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PHASE) {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      logger.warn(`Missing required environment variable: ${envVar}`)
    }
  }
}

// Initialize Firebase - Prevent multiple initializations
let app: FirebaseApp
try {
  // Check if Firebase is already initialized
  const existingApps = getApps()
  if (existingApps.length > 0) {
    app = existingApps[0]
    console.log('Firebase: Using existing app instance')
  } else {
    console.log('Firebase: Initializing with config', firebaseConfig)
    app = initializeApp(firebaseConfig)
    console.log('Firebase: Successfully initialized')
  }
} catch (error) {
  console.error('Firebase: Failed to initialize', error)
  logger.error('Failed to initialize Firebase:', error)
  
  // During build time, create a minimal app
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
    app = initializeApp({
      apiKey: 'build-time-key',
      authDomain: 'build-time.firebaseapp.com',
      projectId: 'build-time',
      storageBucket: 'build-time.appspot.com',
      messagingSenderId: '123456789',
      appId: '1:123456789:web:build-time'
    })
  } else {
    // Create a minimal app for development when Firebase fails
    try {
      app = initializeApp({
        apiKey: 'fallback-key',
        authDomain: 'fallback.firebaseapp.com',
        projectId: 'fallback',
        storageBucket: 'fallback.appspot.com',
        messagingSenderId: '123456789',
        appId: '1:123456789:web:fallback'
      })
      logger.warn('Using fallback Firebase configuration')
    } catch (fallbackError) {
      logger.error('Failed to create fallback Firebase app:', fallbackError)
      throw new Error('Firebase initialization failed completely')
    }
  }
}

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Add connection timeout and retry settings - Only configure once
if (typeof window !== 'undefined' && !(window as any).__firebaseAuthConfigured) {
  try {
    console.log('Firebase: Configuring auth settings')
    // Configure auth settings for better error handling
    auth.settings.appVerificationDisabledForTesting = false
    
    // Add error listener for better debugging
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('Firebase: User authenticated:', user.email)
        logger.info('User authenticated:', user.email)
      } else {
        console.log('Firebase: No user authenticated')
      }
    }, (error) => {
      console.error('Firebase: Auth state change error:', error)
      logger.error('Auth state change error:', error)
    })
    
    // Store unsubscribe function to prevent memory leaks
    if (typeof window !== 'undefined') {
      (window as any).__firebaseAuthUnsubscribe = unsubscribe
    }
    console.log('Firebase: Auth settings configured successfully')
    
    // Mark as configured to prevent multiple setups
    (window as any).__firebaseAuthConfigured = true
  } catch (error) {
    console.error('Firebase: Failed to configure auth settings:', error)
    logger.warn('Failed to configure auth settings:', error)
  }
}

export default app 
