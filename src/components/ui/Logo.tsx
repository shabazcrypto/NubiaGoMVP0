'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'horizontal' | 'vertical' | 'icon-only'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  href?: string
}

export function Logo({ 
  variant = 'horizontal', 
  size = 'md', 
  className,
  href = '/'
}: LogoProps) {
  const sizeClasses = {
    sm: {
      icon: 'w-6 h-6',
      text: 'text-sm',
      container: 'space-x-2'
    },
    md: {
      icon: 'w-8 h-8',
      text: 'text-lg',
      container: 'space-x-2'
    },
    lg: {
      icon: 'w-10 h-10',
      text: 'text-xl',
      container: 'space-x-3'
    }
  }

                                                                                               const IconComponent = () => (
                <img 
                  src="/favicon.svg" 
                  alt="NubiaGo Logo"
                  className={cn(
                    "object-contain",
                    sizeClasses[size].icon
                  )}
                />
              )

            const TextComponent = () => (
            <span className={cn(
              "font-bold text-slate-900",
              sizeClasses[size].text
            )}>
              NubiaGo
            </span>
          )

  const content = (
    <div className={cn(
      "flex items-center",
      variant === 'horizontal' && sizeClasses[size].container,
      variant === 'vertical' && 'flex-col space-y-1',
      className
    )}>
      <IconComponent />
      {variant !== 'icon-only' && <TextComponent />}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {content}
      </Link>
    )
  }

  return content
}
