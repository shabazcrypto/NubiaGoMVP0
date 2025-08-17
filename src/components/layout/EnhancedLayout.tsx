'use client'

import React from 'react'
import { MainNavigation } from '@/components/navigation/MainNav'
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav'
// import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'

interface EnhancedLayoutProps {
  children: React.ReactNode
  className?: string
  showMobileNav?: boolean
  showHeader?: boolean
}

export function EnhancedLayout({ 
  children, 
  className,
  showMobileNav = true,
  showHeader = true 
}: EnhancedLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      {showHeader && <MainNavigation />}
      
      {/* Main Content */}
      <main className={cn("flex-1", className)}>
        {children}
      </main>
      
      {/* Mobile Bottom Navigation */}
      {showMobileNav && <MobileBottomNav />}
      
      {/* Toast Notifications */}
      {/* <Toaster /> */}
    </div>
  )
}

export default EnhancedLayout
