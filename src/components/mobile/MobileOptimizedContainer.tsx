'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MobileOptimizedContainerProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  background?: 'transparent' | 'white' | 'gray'
}

export function MobileOptimizedContainer({
  children,
  className,
  padding = 'md',
  background = 'transparent'
}: MobileOptimizedContainerProps) {
  const paddingClasses = {
    none: '',
    sm: 'px-3 py-2',
    md: 'px-4 py-3', 
    lg: 'px-6 py-4'
  }

  const backgroundClasses = {
    transparent: '',
    white: 'bg-white',
    gray: 'bg-gray-50'
  }

  return (
    <div className={cn(
      'mobile-optimized-container',
      paddingClasses[padding],
      backgroundClasses[background],
      'smooth-scroll',
      className
    )}>
      {children}
    </div>
  )
}

export default MobileOptimizedContainer
