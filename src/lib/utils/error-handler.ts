export interface AppError extends Error {
  code?: string
  statusCode?: number
  details?: any
  isOperational?: boolean
}

export class ErrorHandler {
  /**
   * Create a standardized application error
   */
  static createError(
    message: string,
    code?: string,
    statusCode: number = 500,
    details?: any
  ): AppError {
    const error = new Error(message) as AppError
    error.code = code || 'INTERNAL_ERROR'
    error.statusCode = statusCode
    error.details = details
    error.isOperational = true
    return error
  }

  /**
   * Handle and log errors
   */
  static handleError(error: Error | AppError, context?: string): void {
    const appError = error as AppError
    const errorInfo = {
      message: appError.message,
      code: appError.code || 'UNKNOWN_ERROR',
      statusCode: appError.statusCode || 500,
      details: appError.details,
      context,
      timestamp: new Date().toISOString(),
      stack: appError.stack
    }

    // Log error based on severity
    if (appError.statusCode && appError.statusCode >= 500) {
      console.error('❌ CRITICAL ERROR:', errorInfo)
    } else if (appError.statusCode && appError.statusCode >= 400) {
      console.warn('⚠️ CLIENT ERROR:', errorInfo)
    } else {
      console.log('ℹ️ INFO ERROR:', errorInfo)
    }

    // In production, you might want to send errors to a monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Send to monitoring service (e.g., Sentry, LogRocket, etc.)
      this.sendToMonitoring(errorInfo)
    }
  }

  /**
   * Send error to monitoring service
   */
  private static sendToMonitoring(errorInfo: any): void {
    // Implementation for monitoring service integration
    // This is a placeholder - implement based on your monitoring solution
    try {
      // Example: Sentry.captureException(errorInfo)
      console.log('📊 Error sent to monitoring service:', errorInfo.code)
    } catch (monitoringError) {
      console.error('❌ Failed to send error to monitoring:', monitoringError)
    }
  }

  /**
   * Format error for API response
   */
  static formatErrorForResponse(error: Error | AppError, includeDetails: boolean = false): {
    error: string
    code?: string
    details?: any
  } {
    const appError = error as AppError
    const response: any = {
      error: appError.message || 'An unexpected error occurred'
    }

    if (appError.code) {
      response.code = appError.code
    }

    if (includeDetails && appError.details) {
      response.details = appError.details
    }

    return response
  }

  /**
   * Validate required fields
   */
  static validateRequiredFields(data: any, requiredFields: string[]): void {
    const missingFields = requiredFields.filter(field => !data[field])
    
    if (missingFields.length > 0) {
      throw this.createError(
        `Missing required fields: ${missingFields.join(', ')}`,
        'VALIDATION_ERROR',
        400,
        { missingFields }
      )
    }
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw this.createError(
        'Invalid email address format',
        'VALIDATION_ERROR',
        400,
        { field: 'email', value: email }
      )
    }
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): void {
    if (password.length < 8) {
      throw this.createError(
        'Password must be at least 8 characters long',
        'VALIDATION_ERROR',
        400,
        { field: 'password', requirement: 'minLength' }
      )
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      throw this.createError(
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'VALIDATION_ERROR',
        400,
        { field: 'password', requirement: 'complexity' }
      )
    }
  }

  /**
   * Handle async errors
   */
  static async handleAsyncError<T>(
    promise: Promise<T>,
    context?: string
  ): Promise<T> {
    try {
      return await promise
    } catch (error) {
      this.handleError(error as Error, context)
      throw error
    }
  }

  /**
   * Wrap async functions with error handling
   */
  static withErrorHandling<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context?: string
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      try {
        return await fn(...args)
      } catch (error) {
        this.handleError(error as Error, context)
        throw error
      }
    }
  }

  /**
   * Common error codes
   */
  static readonly ErrorCodes = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
    CONFLICT_ERROR: 'CONFLICT_ERROR',
    RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR'
  } as const

  /**
   * Common error messages
   */
  static readonly ErrorMessages = {
    VALIDATION_ERROR: 'Validation failed',
    AUTHENTICATION_ERROR: 'Authentication required',
    AUTHORIZATION_ERROR: 'Insufficient permissions',
    NOT_FOUND_ERROR: 'Resource not found',
    CONFLICT_ERROR: 'Resource conflict',
    RATE_LIMIT_ERROR: 'Rate limit exceeded',
    INTERNAL_ERROR: 'Internal server error',
    NETWORK_ERROR: 'Network error',
    DATABASE_ERROR: 'Database error',
    EXTERNAL_SERVICE_ERROR: 'External service error'
  } as const
}

/**
 * Utility function to create validation errors
 */
export function createValidationError(message: string, field?: string, value?: any): AppError {
  return ErrorHandler.createError(
    message,
    ErrorHandler.ErrorCodes.VALIDATION_ERROR,
    400,
    { field, value }
  )
}

/**
 * Utility function to create authentication errors
 */
export function createAuthenticationError(message?: string): AppError {
  return ErrorHandler.createError(
    message || ErrorHandler.ErrorMessages.AUTHENTICATION_ERROR,
    ErrorHandler.ErrorCodes.AUTHENTICATION_ERROR,
    401
  )
}

/**
 * Utility function to create authorization errors
 */
export function createAuthorizationError(message?: string): AppError {
  return ErrorHandler.createError(
    message || ErrorHandler.ErrorMessages.AUTHORIZATION_ERROR,
    ErrorHandler.ErrorCodes.AUTHORIZATION_ERROR,
    403
  )
}

/**
 * Utility function to create not found errors
 */
export function createNotFoundError(resource?: string): AppError {
  const message = resource ? `${resource} not found` : ErrorHandler.ErrorMessages.NOT_FOUND_ERROR
  return ErrorHandler.createError(
    message,
    ErrorHandler.ErrorCodes.NOT_FOUND_ERROR,
    404,
    { resource }
  )
}

/**
 * Utility function to create conflict errors
 */
export function createConflictError(message?: string): AppError {
  return ErrorHandler.createError(
    message || ErrorHandler.ErrorMessages.CONFLICT_ERROR,
    ErrorHandler.ErrorCodes.CONFLICT_ERROR,
    409
  )
}
