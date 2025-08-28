// Simplified error logging service without external dependencies
export interface ErrorLogOptions {
  category?: string
  context?: Record<string, any>
  tags?: string[]
  reportToExternal?: boolean
  saveToDatabase?: boolean
  notifyTeam?: boolean
  level?: 'info' | 'warn' | 'error'
}

export interface ErrorLogEntry {
  id: string
  timestamp: Date
  error: Error
  options: ErrorLogOptions
  userAgent?: string
  url?: string
}

class ErrorLoggingService {
  private errorQueue: ErrorLogEntry[] = []
  private maxQueueSize = 100
  private flushInterval = 30000 // 30 seconds
  private isFlushing = false

  constructor() {
    // Start periodic flushing
    if (typeof window !== 'undefined') {
      setInterval(() => this.flushQueue(), this.flushInterval)
    }
  }

  async logError(error: Error, options: ErrorLogOptions = {}): Promise<string> {
    const errorId = this.generateErrorId()
    
    const logEntry: ErrorLogEntry = {
      id: errorId,
      timestamp: new Date(),
      error,
      options: {
        level: 'error',
        ...options
      },
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    }

    // Add to queue
    this.errorQueue.push(logEntry)

    // Console logging for immediate visibility
    // // // console.error(`[${options.category || 'app'}] Error logged:`, {
    //   id: errorId,
    //   message: error.message,
    //   stack: error.stack,
    //   context: options.context,
    //   tags: options.tags
    // })

    // Process immediately if critical
    if (options.level === 'error' && options.reportToExternal !== false) {
      this.processErrorImmediately(logEntry)
    }

    // Flush queue if it's getting large
    if (this.errorQueue.length >= this.maxQueueSize) {
      this.flushQueue()
    }

    return errorId
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async processErrorImmediately(logEntry: ErrorLogEntry): Promise<void> {
    try {
      // For now, just log to console
      // // // console.error('Critical error processed immediately:', logEntry)
      
      // In the future, this could send to external services
      // await this.sendToExternalService(logEntry)
    } catch (error) {
      // // // console.error('Failed to process error immediately:', error)
    }
  }

  private async flushQueue(): Promise<void> {
    if (this.isFlushing || this.errorQueue.length === 0) {
      return
    }

    this.isFlushing = true

    try {
      const errorsToFlush = [...this.errorQueue]
      this.errorQueue = []

      // For now, just log to console
      // // // console.log(`Flushing ${errorsToFlush.length} errors from queue`)
      
      // In the future, this could save to database or send to external services
      // await this.saveToDatabase(errorsToFlush)
      // await this.sendToExternalServices(errorsToFlush)
    } catch (error) {
      // // // console.error('Failed to flush error queue:', error)
      // Restore errors to queue
      this.errorQueue.unshift(...this.errorQueue)
    } finally {
      this.isFlushing = false
    }
  }

  // Public method to manually flush queue
  async flush(): Promise<void> {
    await this.flushQueue()
  }

  // Get current queue size
  getQueueSize(): number {
    return this.errorQueue.length
  }

  // Get all errors in queue
  getErrors(): ErrorLogEntry[] {
    return [...this.errorQueue]
  }
}

// Export singleton instance
export const errorLoggingService = new ErrorLoggingService()

// Convenience function
export const logError = (error: Error, options: ErrorLogOptions = {}): Promise<string> => {
  return errorLoggingService.logError(error, options)
}
