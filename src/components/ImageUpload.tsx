'use client'

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';

// SECURITY: Secure file upload configuration
const SECURE_UPLOAD_CONFIG = {
  // Allowed file types with MIME type validation
  ALLOWED_TYPES: new Set([
    'image/jpeg',
    'image/png', 
    'image/webp',
    'image/gif',
    'image/svg+xml'
  ]),
  
  // File size limits (5MB max)
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  
  // Magic bytes for file type validation
  MAGIC_BYTES: {
    jpeg: [0xFF, 0xD8, 0xFF],
    png: [0x89, 0x50, 0x4E, 0x47],
    webp: [0x52, 0x49, 0x46, 0x46],
    gif: [0x47, 0x49, 0x46],
    svg: [0x3C, 0x3F, 0x78, 0x6D, 0x6C] // <?xml
  },
  
  // Maximum dimensions for images
  MAX_DIMENSIONS: {
    width: 4096,
    height: 4096
  },
  
  // Content validation
  MIN_FILE_SIZE: 100, // 100 bytes minimum
  MAX_FILENAME_LENGTH: 255
};

// ============================================================================
// TYPES
// ============================================================================

export interface ImageUploadProps {
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxFileSize?: number;
  allowedTypes?: string[];
  storagePath?: string;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  aspectRatio?: 'free' | '1:1' | '16:9' | '4:3';
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

// ============================================================================
// IMAGE UPLOAD COMPONENT
// ============================================================================

export default function ImageUpload({
  onImagesChange,
  maxImages = 5,
  maxFileSize = SECURE_UPLOAD_CONFIG.MAX_FILE_SIZE,
  allowedTypes = Array.from(SECURE_UPLOAD_CONFIG.ALLOWED_TYPES),
  storagePath = 'uploads',
  className = '',
  disabled = false,
  showPreview = true,
  aspectRatio = 'free'
}: ImageUploadProps) {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // SECURE FILE VALIDATION
  // ============================================================================

  /**
   * SECURITY: Comprehensive file validation with multiple security layers
   */
  const validateFile = async (file: File): Promise<ValidationResult> => {
    try {
      // 1. Basic file validation
      if (!file || !(file instanceof File)) {
        return { isValid: false, error: 'Invalid file object' };
      }

      // 2. File size validation
      if (file.size < SECURE_UPLOAD_CONFIG.MIN_FILE_SIZE) {
        return { isValid: false, error: 'File too small (minimum 100 bytes)' };
      }

      if (file.size > maxFileSize) {
        return { isValid: false, error: `File size exceeds ${Math.round(maxFileSize / 1024 / 1024)}MB limit` };
      }

      // 3. Filename validation
      if (file.name.length > SECURE_UPLOAD_CONFIG.MAX_FILENAME_LENGTH) {
        return { isValid: false, error: 'Filename too long' };
      }

      // SECURITY: Prevent path traversal attacks
      if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
        return { isValid: false, error: 'Invalid filename' };
      }

      // 4. MIME type validation
      if (!allowedTypes.includes(file.type)) {
        return { isValid: false, error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` };
      }

      // 5. File extension validation
      const extension = file.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
      
      if (!extension || !allowedExtensions.includes(extension)) {
        return { isValid: false, error: 'Invalid file extension' };
      }

      // 6. SECURITY: Magic bytes validation (file content verification)
      const isValidContent = await validateFileContent(file);
      if (!isValidContent.isValid) {
        return { isValid: false, error: `File content validation failed: ${isValidContent.error}` };
      }

      // 7. Check if we've reached max images
      if (uploadProgress.length >= maxImages) {
        return { isValid: false, error: `Maximum ${maxImages} images allowed` };
      }

      // 8. SECURITY: Image dimension validation
      if (file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
        const dimensions = await getImageDimensions(file);
        if (dimensions) {
          if (dimensions.width > SECURE_UPLOAD_CONFIG.MAX_DIMENSIONS.width || 
              dimensions.height > SECURE_UPLOAD_CONFIG.MAX_DIMENSIONS.height) {
            return { isValid: false, error: `Image dimensions too large (max: ${SECURE_UPLOAD_CONFIG.MAX_DIMENSIONS.width}x${SECURE_UPLOAD_CONFIG.MAX_DIMENSIONS.height})` };
          }
        }
      }

      return { isValid: true };
    } catch (error) {
      console.error('File validation error:', error);
      return { isValid: false, error: 'File validation failed' };
    }
  };

  /**
   * SECURITY: Validate file content using magic bytes
   */
  const validateFileContent = async (file: File): Promise<ValidationResult> => {
    try {
      const buffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      
      // Check magic bytes for different file types
      const fileType = getFileTypeFromMagicBytes(uint8Array);
      
      if (!fileType) {
        return { isValid: false, error: 'Unknown file type' };
      }

      // Verify MIME type matches magic bytes
      const expectedMimeType = getMimeTypeFromExtension(fileType);
      if (file.type !== expectedMimeType) {
        return { isValid: false, error: 'File content does not match declared type' };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Content validation error:', error);
      return { isValid: false, error: 'Content validation failed' };
    }
  };

  /**
   * Get file type from magic bytes
   */
  const getFileTypeFromMagicBytes = (bytes: Uint8Array): string | null => {
    // Check JPEG
    if (bytes.length >= 3 && 
        bytes[0] === SECURE_UPLOAD_CONFIG.MAGIC_BYTES.jpeg[0] &&
        bytes[1] === SECURE_UPLOAD_CONFIG.MAGIC_BYTES.jpeg[1] &&
        bytes[2] === SECURE_UPLOAD_CONFIG.MAGIC_BYTES.jpeg[2]) {
      return 'jpeg';
    }

    // Check PNG
    if (bytes.length >= 4 &&
        bytes[0] === SECURE_UPLOAD_CONFIG.MAGIC_BYTES.png[0] &&
        bytes[1] === SECURE_UPLOAD_CONFIG.MAGIC_BYTES.png[1] &&
        bytes[2] === SECURE_UPLOAD_CONFIG.MAGIC_BYTES.png[2] &&
        bytes[3] === SECURE_UPLOAD_CONFIG.MAGIC_BYTES.png[3]) {
      return 'png';
    }

    // Check WebP
    if (bytes.length >= 4 &&
        bytes[0] === SECURE_UPLOAD_CONFIG.MAGIC_BYTES.webp[0] &&
        bytes[1] === SECURE_UPLOAD_CONFIG.MAGIC_BYTES.webp[1] &&
        bytes[2] === SECURE_UPLOAD_CONFIG.MAGIC_BYTES.webp[2] &&
        bytes[3] === SECURE_UPLOAD_CONFIG.MAGIC_BYTES.webp[3]) {
      return 'webp';
    }

    // Check GIF
    if (bytes.length >= 3 &&
        bytes[0] === SECURE_UPLOAD_CONFIG.MAGIC_BYTES.gif[0] &&
        bytes[1] === SECURE_UPLOAD_CONFIG.MAGIC_BYTES.gif[1] &&
        bytes[2] === SECURE_UPLOAD_CONFIG.MAGIC_BYTES.gif[2]) {
      return 'gif';
    }

    // Check SVG (XML)
    if (bytes.length >= 5 &&
        bytes[0] === SECURE_UPLOAD_CONFIG.MAGIC_BYTES.svg[0] &&
        bytes[1] === SECURE_UPLOAD_CONFIG.MAGIC_BYTES.svg[1] &&
        bytes[2] === SECURE_UPLOAD_CONFIG.MAGIC_BYTES.svg[2] &&
        bytes[3] === SECURE_UPLOAD_CONFIG.MAGIC_BYTES.svg[3] &&
        bytes[4] === SECURE_UPLOAD_CONFIG.MAGIC_BYTES.svg[4]) {
      return 'svg';
    }

    return null;
  };

  /**
   * Get MIME type from file extension
   */
  const getMimeTypeFromExtension = (extension: string): string => {
    const mimeTypes: Record<string, string> = {
      'jpeg': 'image/jpeg',
      'jpg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
      'gif': 'image/gif',
      'svg': 'image/svg+xml'
    };
    return mimeTypes[extension] || 'application/octet-stream';
  };

  /**
   * Get image dimensions for validation
   */
  const getImageDimensions = (file: File): Promise<{ width: number; height: number } | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        resolve(null);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  // ============================================================================
  // UPLOAD FUNCTIONS
  // ============================================================================

  const uploadFile = async (file: File): Promise<string> => {
    // SECURITY: Additional server-side validation should be implemented here
    // This is just a mock implementation for demonstration
    
    const fileName = `secure-${Date.now()}-${file.name}`;
    const path = `${storagePath}/${fileName}`;
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock URL
    return URL.createObjectURL(file);
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // SECURITY: Validate each file individually
    for (const file of fileArray) {
      const validation = await validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    }

    // Show errors if any
    if (errors.length > 0) {
      console.error('File validation errors:', errors);
      // You can add a toast notification here
    }

    if (validFiles.length === 0) return;

    // Add files to progress tracking
    const newProgress: UploadProgress[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }));

    setUploadProgress(prev => [...prev, ...newProgress]);

    // Upload files
    try {
      const uploadPromises = validFiles.map(async (file, index) => {
        const progressIndex = uploadProgress.length + index;
        
        try {
          const url = await uploadFile(file);
          
          setUploadProgress(prev => prev.map((item, i) => 
            i === progressIndex 
              ? { ...item, progress: 100, status: 'success' as const, url }
              : item
          ));
          
          return url;
        } catch (error) {
          setUploadProgress(prev => prev.map((item, i) => 
            i === progressIndex 
              ? { ...item, status: 'error' as const, error: 'Upload failed' }
              : item
          ));
          throw error;
        }
      });

      const urls = await Promise.all(uploadPromises);
      onImagesChange(urls);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFileUpload(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    const files = event.dataTransfer.files;
    if (files) {
      handleFileUpload(files);
    }
  }, []);

  const handleRemoveFile = (index: number) => {
    setUploadProgress(prev => prev.filter((_, i) => i !== index));
  };

  const handleRetryUpload = async (index: number) => {
    const item = uploadProgress[index];
    if (!item) return;

    setUploadProgress(prev => prev.map((p, i) => 
      i === index ? { ...p, status: 'uploading' as const, progress: 0, error: undefined }
      : p
    ));

    try {
      const url = await uploadFile(item.file);
      setUploadProgress(prev => prev.map((p, i) => 
        i === index ? { ...p, progress: 100, status: 'success' as const, url }
        : p
      ));
    } catch (error) {
      setUploadProgress(prev => prev.map((p, i) => 
        i === index ? { ...p, status: 'error' as const, error: error instanceof Error ? error.message : 'Upload failed' }
        : p
      ));
    }
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderUploadArea = () => (
    <div
      className={`
        relative border-2 border-dashed rounded-lg p-6 text-center transition-all
        ${isDragging 
          ? 'border-primary-500 bg-primary-50' 
          : 'border-gray-300 hover:border-primary-400'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={allowedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
      
      <div className="space-y-2">
        <div className="flex justify-center">
          <div className="p-3 bg-primary-100 rounded-full">
            <Upload className="h-6 w-6 text-primary-600" />
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-900">
            {isDragging ? 'Drop images here' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {allowedTypes.join(', ')} up to {Math.round(maxFileSize / 1024 / 1024)}MB
          </p>
          <p className="text-xs text-gray-500">
            {uploadProgress.length}/{maxImages} images
          </p>
        </div>
      </div>
    </div>
  );

  const renderProgress = () => (
    <div className="space-y-3 mt-4">
      {uploadProgress.map((item, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0">
            {item.status === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : item.status === 'error' ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              <ImageIcon className="h-5 w-5 text-gray-400" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {item.file.name}
            </p>
            
            {item.status === 'uploading' && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            )}
            
            {item.status === 'error' && item.error && (
              <p className="text-xs text-red-600 mt-1">{item.error}</p>
            )}
          </div>
          
          <div className="flex-shrink-0 flex space-x-1">
            {item.status === 'error' && (
              <button
                onClick={() => handleRetryUpload(index)}
                className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                title="Retry upload"
              >
                <Upload className="h-4 w-4" />
              </button>
            )}
            
            <button
              onClick={() => handleRemoveFile(index)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPreview = () => {
    if (!showPreview) return null;

    const successfulUploads = uploadProgress.filter(item => item.status === 'success' && item.url);
    
    if (successfulUploads.length === 0) return null;

    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Uploaded Images</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {successfulUploads.map((item, index) => (
            <div key={index} className="relative group aspect-square">
              <img
                src={item.url}
                alt={item.file.name}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => handleRemoveFile(uploadProgress.findIndex(p => p.file === item.file))}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="space-y-4">
      {renderUploadArea()}
      {uploadProgress.length > 0 && renderProgress()}
      {renderPreview()}
    </div>
  );
} 
