'use client'

import { useEffect, useState } from 'react'
import { auth, db, storage } from '@/lib/firebase/config'
import { collection, doc, getDoc } from 'firebase/firestore'
import { ref } from 'firebase/storage'

export default function TestFirebase() {
  const [status, setStatus] = useState<string>('Testing...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testFirebase = async () => {
      try {
        // Test Auth
        const authUser = auth.currentUser
        console.log('Auth initialized:', !!auth)
        
        // Test Firestore
        const testDocRef = doc(db, 'test', 'connection')
        const testDoc = await getDoc(testDocRef)
        console.log('Firestore connected:', !!db)
        
        // Test Storage
        const storageRef = ref(storage)
        console.log('Storage initialized:', !!storage)
        
        setStatus('✅ Firebase configuration is working correctly!')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setStatus('❌ Firebase configuration failed')
      }
    }

    testFirebase()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Firebase Configuration Test
        </h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">Status:</p>
            <p className="font-medium">{status}</p>
          </div>
          
          {error && (
            <div className="p-4 bg-red-100 rounded border border-red-200">
              <p className="text-sm text-red-600">Error:</p>
              <p className="text-red-800">{error}</p>
            </div>
          )}
          
          <div className="text-sm text-gray-500">
            <p>Check the browser console for detailed logs.</p>
          </div>
        </div>
      </div>
    </div>
  )
} 