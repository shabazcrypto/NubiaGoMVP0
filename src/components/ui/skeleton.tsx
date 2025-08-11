import React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
}

const Skeleton = ({ className, width, height }: SkeletonProps) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 rounded',
        className
      )}
      style={{
        width: width,
        height: height,
      }}
    />
  )
}

// Predefined skeleton components
export const CardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
    <Skeleton className="h-48 w-full rounded-lg" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-6 w-1/3" />
    </div>
  </div>
)

export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
    <Skeleton className="h-48 w-full rounded-t-xl" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-6 w-1/3" />
      <div className="flex gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
    </div>
  </div>
)

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200">
      <Skeleton className="h-6 w-1/4" />
    </div>
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  </div>
)

export const ListSkeleton = ({ items = 3 }: { items?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
    ))}
  </div>
)

export const AvatarSkeleton = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }
  
  return <Skeleton className={cn('rounded-full', sizeClasses[size])} />
}

export const TextSkeleton = ({ lines = 1, className }: { lines?: number; className?: string }) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className="h-4 w-full" />
    ))}
  </div>
)

export { Skeleton } 
