import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'mock-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'mock.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mock-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'mock.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:mock',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-MOCK'
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
      console.warn(`Missing required environment variable: ${envVar}`)
    }
  }
}

// Initialize Firebase
let app: FirebaseApp
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
} catch (error) {
  console.error('Failed to initialize Firebase:', error)
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
    throw new Error('Firebase initialization failed')
  }
}

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Add connection timeout and retry settings
if (typeof window !== 'undefined') {
  try {
    auth.settings.appVerificationDisabledForTesting = false
  } catch (error) {
    console.warn('Failed to configure auth settings:', error)
  }
}

export default app 
