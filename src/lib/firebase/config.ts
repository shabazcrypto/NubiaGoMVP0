import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Safe environment variable access with fallbacks
const getEnvVar = (key: string, fallback: string) => {
  if (typeof window !== 'undefined') {
    // Client-side: use NEXT_PUBLIC_ variables
    const value = process.env[`NEXT_PUBLIC_${key}`]
    console.log(`Firebase Config: ${key} = ${value ? '***' : 'undefined (using fallback)'}`)
    return value || fallback
  }
  // Server-side: use fallback
  console.log(`Firebase Config: ${key} = fallback (server-side)`)
  return fallback
}

// Check if we're in a browser environment and if Firebase should be initialized
const shouldInitializeFirebase = () => {
  console.log('Firebase Config: Checking if should initialize Firebase')
  if (typeof window === 'undefined') {
    console.log('Firebase Config: Server-side, skipping initialization')
    return false // Don't initialize on server-side
  }
  
  // Always return true since we have fallback values
  // The fallback values will be used if environment variables are not set
  console.log('Firebase Config: Client-side, will initialize with fallbacks')
  return true
}

const firebaseConfig = {
  apiKey: getEnvVar('FIREBASE_API_KEY', 'AIzaSyCrdNo31J54779co1uhxVKCZEybgKK6hII'),
  authDomain: getEnvVar('FIREBASE_AUTH_DOMAIN', 'nubiago-latest.firebaseapp.com'),
  projectId: getEnvVar('FIREBASE_PROJECT_ID', 'nubiago-latest'),
  storageBucket: getEnvVar('FIREBASE_STORAGE_BUCKET', 'nubiago-latest.firebasestorage.app'),
  messagingSenderId: getEnvVar('FIREBASE_MESSAGING_SENDER_ID', '1071680034258'),
  appId: getEnvVar('FIREBASE_APP_ID', '1:1071680034258:web:e7b95de06ce571dbc0240b'),
  measurementId: getEnvVar('FIREBASE_MEASUREMENT_ID', 'G-XE1YM7HV2J')
}

console.log('Firebase Config: Configuration object created:', {
  apiKey: firebaseConfig.apiKey ? '***' : 'missing',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
  measurementId: firebaseConfig.measurementId
})

// Initialize Firebase with error handling
let app: FirebaseApp | null = null
let auth: any = null
let db: any = null
let storage: any = null

// Create mock services for when Firebase is not available
const createMockServices = () => {
  console.warn('Firebase: Using mock services - Firebase not properly configured')
  
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

try {
  if (shouldInitializeFirebase()) {
    // Check if Firebase is already initialized
    const existingApps = getApps()
    if (existingApps.length > 0) {
      app = existingApps[0]
      console.log('Firebase: Using existing app instance')
    } else {
      console.log('Firebase: Initializing with config', {
        apiKey: firebaseConfig.apiKey ? '***' : 'missing',
        authDomain: firebaseConfig.authDomain,
        projectId: firebaseConfig.projectId
      })
      app = initializeApp(firebaseConfig)
      console.log('Firebase: Successfully initialized')
    }

    // Initialize services
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
  } else {
    console.warn('Firebase: Skipping initialization - missing required environment variables')
    const { mockAuth, mockDb, mockStorage } = createMockServices()
    auth = mockAuth
    db = mockDb
    storage = mockStorage
  }

} catch (error) {
  console.error('Firebase: Failed to initialize', error)
  
  // Create mock services as fallback
  const { mockAuth, mockDb, mockStorage } = createMockServices()
  auth = mockAuth
  db = mockDb
  storage = mockStorage
}

export { auth, db, storage }
export default app 
