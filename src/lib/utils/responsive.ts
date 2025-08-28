import { useMobileOptimization, type Breakpoint } from '@/components/providers/mobile-optimization-provider'
import { useEffect, useState, useRef, useCallback } from 'react'

/**
 * Hook to conditionally render components based on viewport size
 * @example
 * const ShowOnMobile = () => {
 *   const isMobile = useMediaQuery('(max-width: 767px)')
 *   return isMobile ? <MobileComponent /> : null
 * }
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  const queryRef = useRef<MediaQueryList>() 

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    queryRef.current = window.matchMedia(query)
    setMatches(queryRef.current.matches)

    const handleChange = (e: MediaQueryListEvent) => setMatches(e.matches)
    queryRef.current.addEventListener('change', handleChange)
    
    return () => {
      if (queryRef.current) {
        queryRef.current.removeEventListener('change', handleChange)
      }
    }
  }, [query])

  return matches
}

/**
 * Hook to get the current breakpoint
 * @returns The current breakpoint key (e.g., 'sm', 'md', 'lg')
 */
export function useBreakpoint(): Breakpoint {
  const { breakpoint } = useMobileOptimization()
  return breakpoint
}

/**
 * Hook to check if the current viewport is at least the specified breakpoint
 * @example
 * const isTabletOrLarger = useBreakpointUp('md')
 */
export function useBreakpointUp(breakpoint: Breakpoint): boolean {
  const current = useBreakpoint()
  const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
  return breakpoints.indexOf(current) >= breakpoints.indexOf(breakpoint)
}

/**
 * Hook to check if the current viewport is at most the specified breakpoint
 * @example
 * const isMobile = useBreakpointDown('sm')
 */
export function useBreakpointDown(breakpoint: Breakpoint): boolean {
  const current = useBreakpoint()
  const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
  return breakpoints.indexOf(current) <= breakpoints.indexOf(breakpoint)
}

/**
 * Hook to check if the current viewport is between two breakpoints (inclusive)
 * @example
 * const isTablet = useBreakpointBetween('sm', 'lg')
 */
export function useBreakpointBetween(start: Breakpoint, end: Breakpoint): boolean {
  const current = useBreakpoint()
  const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
  const currentIndex = breakpoints.indexOf(current)
  return currentIndex >= breakpoints.indexOf(start) && currentIndex <= breakpoints.indexOf(end)
}

/**
 * Higher-Order Component for responsive rendering
 * @example
 * const ResponsiveComponent = withResponsive(({ isMobile }) => (
 *   isMobile ? <MobileView /> : <DesktopView />
 * ))
 */
export function withResponsive<P extends { isMobile?: boolean; isTablet?: boolean; isDesktop?: boolean }>(
  Component: React.ComponentType<P>
) {
  return function ResponsiveWrapper(props: Omit<P, 'isMobile' | 'isTablet' | 'isDesktop'>) {
    const { isMobile, isTablet, isDesktop } = useMobileOptimization()
    return <Component {...(props as P)} isMobile={isMobile} isTablet={isTablet} isDesktop={isDesktop} />
  }
}

/**
 * Component that renders children only on mobile
 */
export function Mobile({ children }: { children: React.ReactNode }) {
  const { isMobile } = useMobileOptimization()
  return isMobile ? <>{children}</> : null
}

/**
 * Component that renders children only on tablet and larger
 */
export function TabletAndUp({ children }: { children: React.ReactNode }) {
  const { isTablet, isDesktop } = useMobileOptimization()
  return isTablet || isDesktop ? <>{children}</> : null
}

/**
 * Component that renders children only on desktop
 */
export function Desktop({ children }: { children: React.ReactNode }) {
  const { isDesktop } = useMobileOptimization()
  return isDesktop ? <>{children}</> : null
}

/**
 * Component that renders different content based on viewport size
 */
type ResponsiveProps = {
  mobile?: React.ReactNode
  tablet?: React.ReactNode
  desktop?: React.ReactNode
  children?: React.ReactNode
}

export function Responsive({ mobile, tablet, desktop, children }: ResponsiveProps) {
  const { isMobile, isTablet, isDesktop } = useMobileOptimization()
  
  if (isMobile && mobile !== undefined) return <>{mobile}</>
  if (isTablet && tablet !== undefined) return <>{tablet}</>
  if (isDesktop && desktop !== undefined) return <>{desktop}</>
  
  return <>{children}</>
}

/**
 * Hook to get the current device pixel ratio
 * Useful for serving higher resolution images on high-DPI displays
 */
export function usePixelRatio(): number {
  const [pixelRatio, setPixelRatio] = useState(1)
  
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const updatePixelRatio = () => {
      setPixelRatio(window.devicePixelRatio || 1)
    }
    
    updatePixelRatio()
    
    // Listen for changes in device pixel ratio (e.g., when moving between displays)
    const media = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
    media.addEventListener('change', updatePixelRatio, { once: true })
    
    return () => {
      media.removeEventListener('change', updatePixelRatio)
    }
  }, [])
  
  return pixelRatio
}

/**
 * Hook to detect if the user has reduced motion preference
 * Useful for disabling animations for users who prefer reduced motion
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false)
  
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)
    
    const handleChange = () => setReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])
  
  return reducedMotion
}

/**
 * Hook to get the current viewport size
 * @returns Object containing width and height of the viewport
 */
export function useViewportSize() {
  const { width, height } = useMobileOptimization()
  return { width, height }
}

/**
 * Hook to debounce a function based on viewport size changes
 * Useful for performance optimization when handling resize events
 */
export function useDebouncedResize(callback: () => void, delay: number = 100) {
  const timeoutRef = useRef<NodeJS.Timeout>()
  
  const handleResize = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      callback()
    }, delay)
  }, [callback, delay])
  
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    window.addEventListener('resize', handleResize, { passive: true })
    
    return () => {
      window.removeEventListener('resize', handleResize)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [handleResize])
  
  return handleResize
}
