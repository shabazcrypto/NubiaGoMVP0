'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { localImageService } from '@/lib/services/local-image.service'

interface LocalImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fallbackType?: 'product' | 'category' | 'avatar' | 'banner'
}

export function LocalImage({
  src,
  alt,
  width = 400,
  height = 300,
  className = '',
  priority = false,
  fallbackType = 'product'
}: LocalImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const fallbackSrc = localImageService.getFallbackImage(fallbackType)

  useEffect(() => {
    setCurrentSrc(src)
    setHasError(false)
    setIsLoading(true)
  }, [src])

  const handleError = () => {
    if (!hasError && currentSrc !== fallbackSrc) {
      console.warn(`Image failed to load: ${currentSrc}, falling back to: ${fallbackSrc}`)
      setCurrentSrc(fallbackSrc)
      setHasError(true)
      setIsLoading(false)
    }
  }

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleLoadStart = () => {
    setIsLoading(true)
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {/* Loading skeleton */}
      {isLoading && !hasError && (
        <div 
          className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="text-gray-400 text-xs">Loading...</div>
        </div>
      )}
      
      {/* Error state */}
      {hasError && (
        <div 
          className="absolute inset-0 bg-gray-100 flex items-center justify-center border border-gray-200"
          style={{ width, height }}
        >
          <div className="text-gray-400 text-xs text-center">
            <div>Image</div>
            <div>unavailable</div>
          </div>
        </div>
      )}

      <Image
        src={currentSrc || fallbackSrc}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        priority={priority}
        onError={handleError}
        onLoad={handleLoad}
        onLoadStart={handleLoadStart}
        unoptimized={currentSrc?.endsWith('.svg')}
        style={{ objectFit: 'cover' }}
      />
    </div>
  )
}

interface ProductImageProps {
  productCategory?: string
  variant?: number
  alt?: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export function ProductImage({
  productCategory = 'default',
  variant = 0,
  alt = 'Product',
  width = 400,
  height = 500,
  className = '',
  priority = false
}: ProductImageProps) {
  const src = localImageService.getProductImage(productCategory, variant)

  return (
    <LocalImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      fallbackType="product"
    />
  )
}

interface CategoryImageProps {
  categoryName?: string
  variant?: number
  alt?: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export function CategoryImage({
  categoryName = 'default',
  variant = 0,
  alt = 'Category',
  width = 300,
  height = 200,
  className = '',
  priority = false
}: CategoryImageProps) {
  const src = localImageService.getCategoryImage(categoryName, variant)

  return (
    <LocalImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      fallbackType="category"
    />
  )
}

interface HeroImageProps {
  variant?: number
  alt?: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export function HeroImage({
  variant = 0,
  alt = 'Hero Banner',
  width = 1920,
  height = 1080,
  className = '',
  priority = true
}: HeroImageProps) {
  const src = localImageService.getHeroImage(variant)

  return (
    <LocalImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      fallbackType="banner"
    />
  )
}

interface AvatarImageProps {
  seed?: string
  size?: number
  alt?: string
  className?: string
}

export function AvatarImage({
  seed = 'user',
  size = 120,
  alt = 'Avatar',
  className = ''
}: AvatarImageProps) {
  const src = localImageService.getAvatarImage(seed, size)

  return (
    <LocalImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      fallbackType="avatar"
    />
  )
}
