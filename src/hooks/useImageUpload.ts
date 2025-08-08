import { useState, useCallback } from 'react'
import { getImagePath, preloadImage, getImageDimensions } from '@/lib/image-utils'

interface UseImageUploadReturn {
  isUploading: boolean
  uploadProgress: number
  error: string | null
  uploadImage: (file: File) => Promise<string>
  validateImage: (file: File) => Promise<boolean>
  preloadImages: (urls: string[]) => Promise<void>
}

export function useImageUpload(): UseImageUploadReturn {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const validateImage = useCallback(async (file: File): Promise<boolean> => {
    // Reset error state
    setError(null)

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError('File size must be less than 5MB')
      return false
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, WebP, and GIF files are allowed')
      return false
    }

    // Check image dimensions
    try {
      const dimensions = await getImageDimensions(URL.createObjectURL(file))
      if (dimensions.width > 1920 || dimensions.height > 1080) {
        setError('Image dimensions must be less than 1920x1080')
        return false
      }
    } catch (err) {
      setError('Failed to validate image dimensions')
      return false
    }

    return true
  }, [])

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      // Validate image first
      const isValid = await validateImage(file)
      if (!isValid) {
        throw new Error(error || 'Image validation failed')
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      // For now, return a local path since we're using local images
      // In a real app, this would upload to Firebase Storage
      const fileName = file.name
      const imagePath = getImagePath(fileName)
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      return imagePath
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      throw err
    } finally {
      setIsUploading(false)
    }
  }, [validateImage, error])

  const preloadImages = useCallback(async (urls: string[]): Promise<void> => {
    try {
      await Promise.all(urls.map(url => preloadImage(url)))
    } catch (err) {
      console.warn('Failed to preload some images:', err)
    }
  }, [])

  return {
    isUploading,
    uploadProgress,
    error,
    uploadImage,
    validateImage,
    preloadImages
  }
} 