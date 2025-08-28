'use client'

import React, { Suspense } from 'react'
import { ErrorBoundary } from './error-boundary'
import { LoadingFallback } from './loading-fallback'
import { ErrorFallback } from './error-fallback'

// Lazy load the actual ImageUpload component for better performance
const ImageUpload = React.lazy(() => import('./image-upload').then(module => ({ default: module.ImageUpload })))

import { ImageCategory } from '@/lib/services/local-image.service'

interface SafeImageUploadProps {
  category: ImageCategory
  userId: string
  onUploadComplete?: (metadata: any) => void
  onUploadProgress?: (progress: number) => void
  onError?: (error: string) => void
  maxFiles?: number
  className?: string
}

export function SafeImageUpload(props: SafeImageUploadProps) {
  return (
    <ErrorBoundary
      fallback={
        <ErrorFallback 
          title="Image Upload Error"
          description="There was an issue with the image upload component. Please try refreshing the page."
          showDetails={false}
        />
      }
      onError={(error, errorInfo) => {
        // // // console.error('ImageUpload Error:', error, errorInfo)
        if (props.onError) {
          props.onError(error.message || 'Unknown error occurred')
        }
      }}
    >
      <Suspense fallback={<LoadingFallback message="Loading image upload..." />}>
        <ImageUpload {...props} />
      </Suspense>
    </ErrorBoundary>
  )
}

export default SafeImageUpload
