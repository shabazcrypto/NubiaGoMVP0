'use client'

import { usePathname } from 'next/navigation'
import Navigation from './navigation'

export default function ConditionalNavigation() {
  const pathname = usePathname()
  
  // Don't show navigation on dashboard pages (routes starting with /dashboard or in (dashboard) group)
  const isDashboardRoute = pathname.startsWith('/admin') ||
                           pathname.startsWith('/customer') ||
                           pathname.startsWith('/supplier')
  
  // Don't show navigation if it's a dashboard route
  if (isDashboardRoute) {
    return null
  }
  
  // Only show for desktop screens (2xl and above) as UnifiedHeader handles all smaller screens
  // This prevents duplicate headers on mobile/tablet/laptop
  return (
    <div className="hidden 2xl:block">
      <Navigation />
    </div>
  )
}
