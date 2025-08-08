import { NextRequest, NextResponse } from 'next/server'
import { storageService } from '@/lib/services/storage.service'
import { z } from 'zod'

const uploadSchema = z.object({
  type: z.enum(['product', 'avatar', 'document']),
  userId: z.string().optional(),
  productId: z.string().optional(),
  files: z.array(z.any()).min(1, 'At least one file is required')
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const type = formData.get('type') as string
    const userId = formData.get('userId') as string
    const productId = formData.get('productId') as string
    const files = formData.getAll('files') as File[]

    // Validate input
    const validatedData = uploadSchema.parse({
      type,
      userId,
      productId,
      files
    })

    // Validate file types and sizes
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp']
    const allowedDocumentTypes = ['application/pdf', 'image/jpeg', 'image/png']
    const maxFileSize = 5 // 5MB

    for (const file of files) {
      // Check file size
      if (!storageService.validateFileSize(file, maxFileSize)) {
        return NextResponse.json(
          { 
            success: false, 
            error: `File ${file.name} is too large. Maximum size is ${maxFileSize}MB` 
          },
          { status: 400 }
        )
      }

      // Check file type based on upload type
      if (type === 'product' || type === 'avatar') {
        if (!storageService.validateFileType(file, allowedImageTypes)) {
          return NextResponse.json(
            { 
              success: false, 
              error: `File ${file.name} is not a valid image type. Allowed: JPEG, PNG, WebP` 
            },
            { status: 400 }
          )
        }
      } else if (type === 'document') {
        if (!storageService.validateFileType(file, allowedDocumentTypes)) {
          return NextResponse.json(
            { 
              success: false, 
              error: `File ${file.name} is not a valid document type. Allowed: PDF, JPEG, PNG` 
            },
            { status: 400 }
          )
        }
      }
    }

    let uploadResult

    // Upload based on type
    switch (type) {
      case 'product':
        if (!productId) {
          return NextResponse.json(
            { success: false, error: 'Product ID is required for product uploads' },
            { status: 400 }
          )
        }
        uploadResult = await storageService.uploadProductImages(productId, files)
        break

      case 'avatar':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'User ID is required for avatar uploads' },
            { status: 400 }
          )
        }
        const avatarUrl = await storageService.uploadProfileImage(userId, files[0])
        uploadResult = { mainImage: avatarUrl.url, gallery: [] }
        break

      case 'document':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'User ID is required for document uploads' },
            { status: 400 }
          )
        }
        const documentUrls = await storageService.uploadBusinessDocuments(userId, files)
        uploadResult = { mainImage: documentUrls[0]?.url || '', gallery: documentUrls.slice(1).map(doc => doc.url) }
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid upload type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: uploadResult,
      message: 'Files uploaded successfully'
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to upload files' 
      },
      { status: 500 }
    )
  }
} 