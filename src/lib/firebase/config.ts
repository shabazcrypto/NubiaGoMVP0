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

function initializeFirebase() {
  // Only initialize Firebase on the client side
  if (typeof window === 'undefined') {
    return {
      app: null,
      auth: createMockAuth() as Auth,
      db: createMockFirestore() as Firestore,
      storage: createMockStorage() as FirebaseStorage
    }
  }

  try {
    // Check if Firebase is already initialized
    const existingApps = getApps()
    const app = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig)

    // Initialize services
    const auth = getAuth(app)
    const db = getFirestore(app)
    const storage = getStorage(app)

    return { app, auth, db, storage }
  } catch (error) {
    console.error('Failed to initialize Firebase:', error)
    
    // Return mock services if initialization fails
    return {
      app: null,
      auth: createMockAuth() as Auth,
      db: createMockFirestore() as Firestore,
      storage: createMockStorage() as FirebaseStorage
    }
  }
}

// Initialize Firebase and get services
const { app, auth, db, storage } = initializeFirebase()

// Export initialized services
export { auth, db, storage }
export default app