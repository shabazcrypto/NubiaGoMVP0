/**
 * NubiaGo Device Detection Utilities
 * Handles mobile detection and redirects for optimized user experience
 */

export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  userAgent: string
  screenWidth: number
  touchEnabled: boolean
}

/**
 * Detect if current device is mobile
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const userAgent = navigator.userAgent.toLowerCase()
  const mobileRegex = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i
  const screenWidth = window.innerWidth
  
  return mobileRegex.test(userAgent) || screenWidth <= 768
}

/**
 * Detect if current device is tablet
 */
export const isTabletDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const userAgent = navigator.userAgent.toLowerCase()
  const tabletRegex = /ipad|tablet|kindle|playbook|silk|android(?!.*mobile)/i
  const screenWidth = window.innerWidth
  
  return tabletRegex.test(userAgent) || (screenWidth > 768 && screenWidth <= 1024)
}

/**
 * Get comprehensive device information
 */
export const getDeviceInfo = (): DeviceInfo => {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      userAgent: '',
      screenWidth: 1920,
      touchEnabled: false
    }
  }

  const isMobile = isMobileDevice()
  const isTablet = isTabletDevice()
  const isDesktop = !isMobile && !isTablet

  return {
    isMobile,
    isTablet,
    isDesktop,
    userAgent: navigator.userAgent,
    screenWidth: window.innerWidth,
    touchEnabled: 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }
}

/**
 * Mobile-optimized redirect with parameter preservation
 */
export const redirectToMobileProducts = (searchParams?: URLSearchParams) => {
  if (typeof window === 'undefined') return
  
  const baseUrl = '/products'
  let redirectUrl = baseUrl
  
  // Preserve URL parameters
  if (searchParams && searchParams.toString()) {
    redirectUrl += `?${searchParams.toString()}`
  }
  
  // Add mobile optimization flag
  const params = new URLSearchParams(searchParams)
  params.set('mobile', 'true')
  redirectUrl = `${baseUrl}?${params.toString()}`
  
  window.location.href = redirectUrl
}

/**
 * Check if user prefers mobile experience
 */
export const prefersMobileExperience = (): boolean => {
  if (typeof localStorage === 'undefined') return false
  
  const preference = localStorage.getItem('nubiago-mobile-preference')
  return preference === 'mobile' || isMobileDevice()
}
