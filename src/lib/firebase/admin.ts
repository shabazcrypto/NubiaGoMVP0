import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

// Initialize Firebase Admin
const adminApp = getApps().length === 0 
  ? initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID || 'nubiago-aa411',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'nubiago-aa411.firebasestorage.app',
    })
  : getApps()[0]

// Initialize Admin services
export const adminAuth = getAuth(adminApp)
export const adminDb = getFirestore(adminApp)
export const adminStorage = getStorage(adminApp)

export default adminApp 