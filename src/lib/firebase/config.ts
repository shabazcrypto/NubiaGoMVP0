import { getApps, initializeApp, FirebaseApp } from 'firebase/app'
import { Auth, getAuth } from 'firebase/auth'
import { Firestore, getFirestore } from 'firebase/firestore'
import { FirebaseStorage, getStorage } from 'firebase/storage'
import { createMockAuth, createMockFirestore, createMockStorage } from './mock-services'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

let app: FirebaseApp | null = null
let auth: Auth
let db: Firestore
let storage: FirebaseStorage

function initializeFirebase() {
  try {
    // Only initialize Firebase on the client side
    if (typeof window !== 'undefined') {
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

      return { auth, db, storage }
    }
  } catch (error) {
    console.error('Failed to initialize Firebase:', error)
  }

  // Return mock services if initialization fails or on server side
  const mockAuth = createMockAuth() as Auth
  const mockDb = createMockFirestore() as Firestore
  const mockStorage = createMockStorage() as FirebaseStorage

  return { auth: mockAuth, db: mockDb, storage: mockStorage }
}

// Initialize Firebase and get services
const { auth: initializedAuth, db: initializedDb, storage: initializedStorage } = initializeFirebase()

// Export initialized services
export const auth = initializedAuth
export const db = initializedDb
export const storage = initializedStorage
export default app