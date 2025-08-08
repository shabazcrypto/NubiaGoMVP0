// ============================================================================
// FIREBASE SERVICE SINGLETON MANAGER
// ============================================================================

import { ProductService } from '@/lib/services/product.service'
import { UserService } from '@/lib/services/user.service'
import { CartService } from '@/lib/services/cart.service'
import { WishlistService } from '@/lib/services/wishlist.service'
import { OrderService } from '@/lib/services/order.service'
import { AuthService } from '@/lib/services/auth.service'
import { ApiService } from '@/lib/services/api.service'
import { LogisticsService } from '@/lib/services/logistics.service'
import { StorageService } from '@/lib/services/storage.service'
import { AuditService } from '@/lib/services/audit.service'
import { EmailService } from '@/lib/services/email.service'
import { AnalyticsService } from '@/lib/services/analytics.service'
import { SearchService } from '@/lib/services/search.service'
import { PerformanceService } from '@/lib/services/performance.service'
import { logger } from '@/lib/logger'

type ServiceConstructor<T = any> = new (...args: any[]) => T

class ServiceManager {
  private static instances = new Map<ServiceConstructor, any>()
  private static initializationPromises = new Map<ServiceConstructor, Promise<any>>()

  /**
   * Get singleton instance of a service
   */
  static getInstance<T>(ServiceClass: ServiceConstructor<T>): T {
    if (!this.instances.has(ServiceClass)) {
      logger.debug(`Initializing service: ${ServiceClass.name}`)
      const instance = new ServiceClass()
      this.instances.set(ServiceClass, instance)
      
      // Track service initialization for performance monitoring
      logger.performance(`Service initialized: ${ServiceClass.name}`, 0)
    }
    
    return this.instances.get(ServiceClass)
  }

  /**
   * Get singleton instance with async initialization
   */
  static async getInstanceAsync<T>(ServiceClass: ServiceConstructor<T>): Promise<T> {
    if (!this.initializationPromises.has(ServiceClass)) {
      const promise = this.initializeServiceAsync(ServiceClass)
      this.initializationPromises.set(ServiceClass, promise)
    }
    
    return this.initializationPromises.get(ServiceClass)
  }

  /**
   * Initialize service asynchronously
   */
  private static async initializeServiceAsync<T>(ServiceClass: ServiceConstructor<T>): Promise<T> {
    const startTime = performance.now()
    
    try {
      const instance = new ServiceClass()
      
      // If service has an initialize method, call it
      if (typeof (instance as any).initialize === 'function') {
        await (instance as any).initialize()
      }
      
      this.instances.set(ServiceClass, instance)
      
      const duration = performance.now() - startTime
      logger.performance(`Service async initialized: ${ServiceClass.name}`, duration)
      
      return instance
    } catch (error) {
      logger.error(`Failed to initialize service: ${ServiceClass.name}`, error as Error)
      throw error
    }
  }

  /**
   * Preload critical services
   */
  static preloadCriticalServices() {
    const criticalServices: ServiceConstructor[] = [
      ProductService,
      UserService,
      AuthService,
      CartService,
      WishlistService
    ]

    criticalServices.forEach(ServiceClass => {
      this.getInstance(ServiceClass)
    })

    logger.info('Critical services preloaded')
  }

  /**
   * Clear all service instances (useful for testing)
   */
  static clearInstances() {
    this.instances.clear()
    this.initializationPromises.clear()
    logger.debug('All service instances cleared')
  }

  /**
   * Get service health status
   */
  static getServiceHealth() {
    const services = Array.from(this.instances.entries()).map(([ServiceClass, instance]) => ({
      name: ServiceClass.name,
      initialized: !!instance,
      hasHealthCheck: typeof (instance as any).healthCheck === 'function'
    }))

    return {
      totalServices: this.instances.size,
      services
    }
  }

  /**
   * Perform health check on all services
   */
  static async performHealthCheck() {
    const results = []
    
    for (const [ServiceClass, instance] of this.instances.entries()) {
      const serviceName = ServiceClass.name
      
      try {
        if (typeof (instance as any).healthCheck === 'function') {
          const startTime = performance.now()
          const isHealthy = await (instance as any).healthCheck()
          const duration = performance.now() - startTime
          
          results.push({
            service: serviceName,
            healthy: isHealthy,
            responseTime: duration
          })
        } else {
          results.push({
            service: serviceName,
            healthy: true,
            responseTime: 0,
            note: 'No health check method'
          })
        }
      } catch (error) {
        logger.error(`Health check failed for ${serviceName}`, error as Error)
        results.push({
          service: serviceName,
          healthy: false,
          error: (error as Error).message
        })
      }
    }

    return results
  }
}

// Preload critical services on initialization
if (typeof window !== 'undefined') {
  // Client-side initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      ServiceManager.preloadCriticalServices()
    })
  } else {
    ServiceManager.preloadCriticalServices()
  }
}

export default ServiceManager

// Convenience exports for common services
export const getProductService = () => ServiceManager.getInstance(ProductService)
export const getUserService = () => ServiceManager.getInstance(UserService)
export const getCartService = () => ServiceManager.getInstance(CartService)
export const getWishlistService = () => ServiceManager.getInstance(WishlistService)
export const getOrderService = () => ServiceManager.getInstance(OrderService)
export const getAuthService = () => ServiceManager.getInstance(AuthService)
export const getApiService = () => ServiceManager.getInstance(ApiService)
export const getLogisticsService = () => ServiceManager.getInstance(LogisticsService)
export const getStorageService = () => ServiceManager.getInstance(StorageService)
export const getAuditService = () => ServiceManager.getInstance(AuditService)
export const getEmailService = () => ServiceManager.getInstance(EmailService)
export const getAnalyticsService = () => ServiceManager.getInstance(AnalyticsService)
export const getSearchService = () => ServiceManager.getInstance(SearchService)
export const getPerformanceService = () => ServiceManager.getInstance(PerformanceService)
