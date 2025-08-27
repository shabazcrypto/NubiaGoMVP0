import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'
import type { FirebaseStorage } from 'firebase/storage'

// Safe environment variable access with fallbacks
const getEnvVar = (key: string, fallback: string) => {
  if (typeof window !== 'undefined') {
    // Client-side: use NEXT_PUBLIC_ variables
    const value = process.env[`NEXT_PUBLIC_${key}`]
    return value || fallback
  }
  // Server-side: use fallback
  return fallback
}

// Check if we're in a browser environment and if Firebase should be initialized
const shouldInitializeFirebase = () => {
  if (typeof window === 'undefined') {
    return false // Don't initialize on server-side
  }
  
  // Always return true since we have fallback values
  return true
}

const firebaseConfig = {
  apiKey: getEnvVar('FIREBASE_API_KEY', 'AIzaSyCrdNo31J54779co1uhxVKCZEybgKK6hII'),
  authDomain: getEnvVar('FIREBASE_AUTH_DOMAIN', 'nubiago-latest.firebaseapp.com'),
  projectId: getEnvVar('FIREBASE_PROJECT_ID', 'nubiago-latest'),
  storageBucket: getEnvVar('FIREBASE_STORAGE_BUCKET', 'nubiago-latest.appspot.com'),
  messagingSenderId: getEnvVar('FIREBASE_MESSAGING_SENDER_ID', '1071680034258'),
  appId: getEnvVar('FIREBASE_APP_ID', '1:1071680034258:web:e7b95de06ce571dbc0240b'),
  measurementId: getEnvVar('FIREBASE_MEASUREMENT_ID', 'G-XE1YM7HV2J')
}

// Create mock services
const createMockServices = () => {
  const mockAuth = {
    onAuthStateChanged: (callback: any) => {
      callback(null)
      return () => {}
    },
    signOut: () => Promise.resolve(),
    currentUser: null,
    signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase not configured')),
    createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase not configured')),
    sendPasswordResetEmail: () => Promise.reject(new Error('Firebase not configured')),
    updateProfile: () => Promise.reject(new Error('Firebase not configured')),
    signInWithPopup: () => Promise.reject(new Error('Firebase not configured'))
  }
  
  const mockDb = {
    collection: () => ({
      doc: () => ({
        get: () => Promise.resolve({ exists: false, data: () => null }),
        set: () => Promise.resolve(),
        update: () => Promise.resolve(),
        delete: () => Promise.resolve()
      }),
      add: () => Promise.resolve({ id: 'mock-id' }),
      get: () => Promise.resolve({ docs: [], empty: true })
    })
  }
  
  const mockStorage = {
    ref: () => ({
      put: () => Promise.resolve({ ref: { getDownloadURL: () => Promise.resolve('mock-url') } }),
      getDownloadURL: () => Promise.resolve('mock-url')
    })
  }
  
  return { mockAuth, mockDb, mockStorage }
}

// Initialize with mock services as default
const { mockAuth, mockDb, mockStorage } = createMockServices()
let app: FirebaseApp = {} as FirebaseApp
let auth: Auth = mockAuth as Auth
let db: Firestore = mockDb as Firestore
let storage: FirebaseStorage = mockStorage as FirebaseStorage

// Initialize Firebase with better error handling
const initializeFirebase = () => {
  try {
    if (shouldInitializeFirebase()) {
      // Check if Firebase is already initialized
      const existingApps = getApps()
      if (existingApps.length > 0) {
        app = existingApps[0]
      } else {
        app = initializeApp(firebaseConfig)
      }

      // Initialize services
      auth = getAuth(app)
      db = getFirestore(app)
      storage = getStorage(app)
    }
  } catch (error) {
    console.error('Firebase: Failed to initialize', error)
  }
}

// Initialize Firebase
try {
  initializeFirebase()
} catch (error) {
  console.error('Failed to initialize Firebase:', error)
}

// Export services
export { auth, db, storage }
export default app