'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { ImageIcon } from 'lucide-react'

interface EnhancedImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

export default function EnhancedImage({
  src,
  alt,
  className = '',
  priority = false,
  fill = false,
  width,
  height,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 75,
  placeholder = 'empty',
  blurDataURL
}: EnhancedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  // Fallback placeholder image
  const placeholderSrc = '/images/placeholder-product.jpg'

  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <ImageIcon className="h-8 w-8 mx-auto mb-2" />
          <span className="text-sm">Image not available</span>
        </div>
      </div>
    )
  }

  const imageProps = {
    src: src || placeholderSrc,
    alt,
    className: `${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    onLoad: handleLoad,
    onError: handleError,
    priority,
    quality,
    placeholder,
    blurDataURL,
    sizes
  }

  if (fill) {
    return (
      <div className={`relative ${className}`}>
        <Image
          {...imageProps}
          fill
          style={{ objectFit: 'cover' }}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <Image
        {...imageProps}
        width={width || 500}
        height={height || 500}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}
