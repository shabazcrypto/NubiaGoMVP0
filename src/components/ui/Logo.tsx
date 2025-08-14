'use client'

import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'horizontal' | 'vertical' | 'icon-only'
  className?: string
}

export const Logo = ({ size = 'md', variant = 'horizontal', className = '' }: LogoProps) => {
  const sizeClasses = {
    sm: variant === 'horizontal' ? 'w-32 h-10' : variant === 'vertical' ? 'w-20 h-24' : 'w-10 h-10',
    md: variant === 'horizontal' ? 'w-44 h-12' : variant === 'vertical' ? 'w-24 h-32' : 'w-12 h-12',
    lg: variant === 'horizontal' ? 'w-56 h-16' : variant === 'vertical' ? 'w-32 h-40' : 'w-16 h-16',
    xl: variant === 'horizontal' ? 'w-72 h-20' : variant === 'vertical' ? 'w-40 h-48' : 'w-20 h-20',
  }

  // Icon SVG component
  const IconSVG = ({ iconSize }: { iconSize: string }) => (
    <div className={`${iconSize} bg-primary-600 rounded-lg flex items-center justify-center overflow-hidden shadow-sm`}>
      <svg
        data-testid="logo-svg"
        viewBox="0 0 512 512"
        className="w-4/5 h-4/5"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="white">
          {/* Center tall arrow */}
          <path d="M256 128 C256 128, 238 128, 238 146 L238 302 C238 320, 256 320, 256 320 C256 320, 274 320, 274 302 L274 146 C274 128, 256 128, 256 128 Z" />
          <path d="M256 128 L220 164 C208 176, 220 188, 232 176 L256 152 L280 176 C292 188, 304 176, 292 164 L256 128 Z" />
          {/* Left arrow */}
          <path d="M190 220 C190 220, 172 220, 172 238 L172 320 C172 338, 190 338, 190 338 C190 338, 208 338, 208 320 L208 238 C208 220, 190 220, 190 220 Z" />
          <path d="M190 220 L154 256 C142 268, 154 280, 166 268 L190 244 L214 268 C226 280, 238 268, 226 256 L190 220 Z" />
          {/* Right arrow */}
          <path d="M322 260 C322 260, 304 260, 304 278 L304 360 C304 378, 322 378, 322 378 C322 378, 340 378, 340 360 L340 278 C340 260, 322 260, 322 260 Z" />
          <path d="M322 260 L286 296 C274 308, 286 320, 298 308 L322 284 L346 308 C358 320, 370 308, 358 296 L322 260 Z" />
          {/* Partial circle */}
          <path
            d="M256 100 C158 100, 78 180, 78 278 C78 376, 158 456, 256 456 C354 456, 434 376, 434 278"
            fill="none"
            stroke="white"
            strokeWidth="36"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  )

  // Icon-only variant
  if (variant === 'icon-only') {
    return (
      <div data-testid="logo-container" className={className}>
        <IconSVG iconSize={sizeClasses[size]} />
      </div>
    )
  }

  // Horizontal variant
  if (variant === 'horizontal') {
    const iconSize = size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-10 h-10' : size === 'lg' ? 'w-14 h-14' : 'w-18 h-18'
    const textSize = size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : size === 'lg' ? 'text-3xl' : 'text-4xl'
    
    return (
      <div data-testid="logo-container" className={`flex items-center space-x-3 ${className}`}>
        <IconSVG iconSize={iconSize} />
        <span className={`font-bold text-nubia-black ${textSize}`}>NubiaGo</span>
      </div>
    )
  }

  // Vertical variant
  if (variant === 'vertical') {
    const iconSize = size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-10 h-10' : size === 'lg' ? 'w-14 h-14' : 'w-18 h-18'
    const textSize = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-3xl'
    
    return (
      <div data-testid="logo-container" className={`flex flex-col items-center space-y-2 ${className}`}>
        <IconSVG iconSize={iconSize} />
        <span className={`font-bold text-nubia-black ${textSize}`}>NubiaGo</span>
      </div>
    )
  }

  return null
}

// Legacy export for backward compatibility
export default Logo