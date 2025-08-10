// ============================================================================
// MOBILE DETECTION AND RESPONSIVE COMPONENT RENDERING UTILITY
// ============================================================================

export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  screenWidth: number
  screenHeight: number
  userAgent: string
  touchSupport: boolean
  networkSpeed: 'slow' | 'medium' | 'fast'
}

export interface ResponsiveBreakpoints {
  mobile: number
  tablet: number
  desktop: number
}

export class MobileDetector {
  private static instance: MobileDetector
  private deviceInfo: DeviceInfo | null = null
  private breakpoints: ResponsiveBreakpoints = {
    mobile: 768,
    tablet: 1024,
    desktop: 1025
  }

  private constructor() {
    if (typeof window !== 'undefined') {
      this.detectDevice()
      this.setupResizeListener()
    }
  }

  static getInstance(): MobileDetector {
    if (!MobileDetector.instance) {
      MobileDetector.instance = new MobileDetector()
    }
    return MobileDetector.instance
  }

  /**
   * Detect device characteristics
   */
  private detectDevice(): void {
    if (typeof window === 'undefined') return

    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight
    const userAgent = navigator.userAgent

    // Check if device is mobile based on screen width and user agent
    const isMobile = screenWidth < this.breakpoints.mobile && 
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(userAgent)
    
    const isTablet = screenWidth >= this.breakpoints.mobile && 
      screenWidth < this.breakpoints.desktop && 
      /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/i.test(userAgent)
    
    const isDesktop = screenWidth >= this.breakpoints.desktop

    // Detect touch support
    const touchSupport = 'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 || 
      (navigator as any).msMaxTouchPoints > 0

    // Estimate network speed based on connection API
    const networkSpeed = this.estimateNetworkSpeed()

    this.deviceInfo = {
      isMobile,
      isTablet,
      isDesktop,
      screenWidth,
      screenHeight,
      userAgent,
      touchSupport,
      networkSpeed
    }
  }

  /**
   * Estimate network speed using available APIs
   */
  private estimateNetworkSpeed(): 'slow' | 'medium' | 'fast' {
    if (typeof window === 'undefined') return 'medium'

    // Check for Network Information API
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection.effectiveType) {
        switch (connection.effectiveType) {
          case 'slow-2g':
          case '2g':
            return 'slow'
          case '3g':
            return 'medium'
          case '4g':
            return 'fast'
          default:
            return 'medium'
        }
      }
    }

    // Check for device memory (rough indicator)
    if ('deviceMemory' in navigator) {
      const memory = (navigator as any).deviceMemory
      if (memory < 2) return 'slow'
      if (memory > 4) return 'fast'
      return 'medium'
    }

    // Check for hardware concurrency
    if ('hardwareConcurrency' in navigator) {
      const cores = (navigator as any).hardwareConcurrency
      if (cores < 2) return 'slow'
      if (cores > 4) return 'fast'
      return 'medium'
    }

    return 'medium'
  }

  /**
   * Setup resize listener for responsive updates
   */
  private setupResizeListener(): void {
    if (typeof window === 'undefined') return

    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        this.detectDevice()
      }, 250) // Debounce resize events
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
  }

  /**
   * Get current device information
   */
  getDeviceInfo(): DeviceInfo | null {
    return this.deviceInfo
  }

  /**
   * Check if current device is mobile
   */
  isMobile(): boolean {
    return this.deviceInfo?.isMobile || false
  }

  /**
   * Check if current device is tablet
   */
  isTablet(): boolean {
    return this.deviceInfo?.isTablet || false
  }

  /**
   * Check if current device is desktop
   */
  isDesktop(): boolean {
    return this.deviceInfo?.isDesktop || false
  }

  /**
   * Check if device supports touch
   */
  hasTouchSupport(): boolean {
    return this.deviceInfo?.touchSupport || false
  }

  /**
   * Get estimated network speed
   */
  getNetworkSpeed(): 'slow' | 'medium' | 'fast' {
    return this.deviceInfo?.networkSpeed || 'medium'
  }

  /**
   * Check if screen width is below a specific breakpoint
   */
  isBelowBreakpoint(breakpoint: number): boolean {
    if (typeof window === 'undefined') return false
    return window.innerWidth < breakpoint
  }

  /**
   * Check if screen width is above a specific breakpoint
   */
  isAboveBreakpoint(breakpoint: number): boolean {
    if (typeof window === 'undefined') return false
    return window.innerWidth >= breakpoint
  }

  /**
   * Get current screen dimensions
   */
  getScreenDimensions(): { width: number; height: number } {
    if (typeof window === 'undefined') {
      return { width: 1024, height: 768 }
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight
    }
  }

  /**
   * Check if device is in landscape mode
   */
  isLandscape(): boolean {
    if (typeof window === 'undefined') return false
    return window.innerWidth > window.innerHeight
  }

  /**
   * Check if device is in portrait mode
   */
  isPortrait(): boolean {
    if (typeof window === 'undefined') return false
    return window.innerHeight > window.innerWidth
  }

  /**
   * Get device pixel ratio
   */
  getPixelRatio(): number {
    if (typeof window === 'undefined') return 1
    return window.devicePixelRatio || 1
  }

  /**
   * Check if device is low-end (for performance optimization)
   */
  isLowEndDevice(): boolean {
    if (!this.deviceInfo) return false

    const { screenWidth, screenHeight } = this.deviceInfo
    const totalPixels = screenWidth * screenHeight
    
    // Consider devices with low resolution or small screens as low-end
    return totalPixels < 480 * 800 || // Small mobile screens
           this.deviceInfo.networkSpeed === 'slow' ||
           (navigator as any).deviceMemory < 2
  }

  /**
   * Get recommended image quality for current device
   */
  getRecommendedImageQuality(): number {
    if (this.isLowEndDevice()) return 60
    if (this.deviceInfo?.networkSpeed === 'slow') return 70
    if (this.deviceInfo?.networkSpeed === 'fast') return 85
    return 75
  }

  /**
   * Get recommended image format for current device
   */
  getRecommendedImageFormat(): 'webp' | 'avif' | 'jpeg' | 'png' {
    if (this.deviceInfo?.networkSpeed === 'slow') return 'jpeg' // Better compatibility
    return 'webp' // Better compression
  }
}

// Export singleton instance
export const mobileDetector = MobileDetector.getInstance()

// Export utility functions
export const isMobile = () => mobileDetector.isMobile()
export const isTablet = () => mobileDetector.isTablet()
export const isDesktop = () => mobileDetector.isDesktop()
export const hasTouchSupport = () => mobileDetector.hasTouchSupport()
export const getNetworkSpeed = () => mobileDetector.getNetworkSpeed()
export const getDeviceInfo = () => mobileDetector.getDeviceInfo()

export default mobileDetector
