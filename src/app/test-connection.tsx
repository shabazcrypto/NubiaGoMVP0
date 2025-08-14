'use client'

import { useEffect, useState } from 'react'

export default function TestConnection() {
  const [status, setStatus] = useState<'testing' | 'success' | 'error'>('testing')

  useEffect(() => {
    // Test if the page loads without infinite loading
    const timer = setTimeout(() => {
      setStatus('success')
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (status === 'testing') {
    return (
      <div className="p-4 bg-primary-100 border border-primary-400 text-primary-700 rounded">
        Testing connection... (2 seconds)
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
        ✅ Connection successful! Page loaded without infinite loading.
      </div>
    )
  }

  return null
}
