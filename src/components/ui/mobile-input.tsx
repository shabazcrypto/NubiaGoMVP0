'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'

interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(
  ({ 
    className, 
    type = 'text', 
    label, 
    error, 
    helperText, 
    leftIcon, 
    rightIcon, 
    fullWidth = true,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword && showPassword ? 'text' : type

    return (
      <div className={cn('space-y-2', fullWidth && 'w-full')}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          
          <input
            type={inputType}
            className={cn(
              // Base mobile-first styles
              'mobile-input',
              'w-full px-4 py-3 text-base', // 16px font size prevents iOS zoom
              'border border-gray-300 rounded-lg',
              'bg-white text-gray-900 placeholder-gray-500',
              'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              'transition-colors duration-200',
              
              // Touch-friendly sizing
              'min-h-[44px]', // Minimum touch target
              
              // Icon spacing
              leftIcon && 'pl-10',
              (rightIcon || isPassword) && 'pr-10',
              
              // Error state
              error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
              
              // Disabled state
              'disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed',
              
              className
            )}
            ref={ref}
            {...props}
          />
          
          {/* Password toggle or right icon */}
          {isPassword ? (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 touch-target p-1"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          ) : rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {/* Error message */}
        {error && (
          <p className="text-sm text-red-600 mt-1 flex items-center">
            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        
        {/* Helper text */}
        {helperText && !error && (
          <p className="text-sm text-gray-500 mt-1">{helperText}</p>
        )}
      </div>
    )
  }
)

MobileInput.displayName = 'MobileInput'

interface MobileTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
}

const MobileTextarea = forwardRef<HTMLTextAreaElement, MobileTextareaProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    fullWidth = true,
    rows = 4,
    ...props 
  }, ref) => {
    return (
      <div className={cn('space-y-2', fullWidth && 'w-full')}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <textarea
          rows={rows}
          className={cn(
            // Base mobile-first styles
            'w-full px-4 py-3 text-base', // 16px font size prevents iOS zoom
            'border border-gray-300 rounded-lg',
            'bg-white text-gray-900 placeholder-gray-500',
            'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'transition-colors duration-200',
            'resize-vertical',
            
            // Touch-friendly sizing
            'min-h-[100px]',
            
            // Error state
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            
            // Disabled state
            'disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed',
            
            className
          )}
          ref={ref}
          {...props}
        />
        
        {/* Error message */}
        {error && (
          <p className="text-sm text-red-600 mt-1 flex items-center">
            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        
        {/* Helper text */}
        {helperText && !error && (
          <p className="text-sm text-gray-500 mt-1">{helperText}</p>
        )}
      </div>
    )
  }
)

MobileTextarea.displayName = 'MobileTextarea'

interface MobileSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
  options: { value: string; label: string }[]
  placeholder?: string
}

const MobileSelect = forwardRef<HTMLSelectElement, MobileSelectProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    fullWidth = true,
    options,
    placeholder,
    ...props 
  }, ref) => {
    return (
      <div className={cn('space-y-2', fullWidth && 'w-full')}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <select
            className={cn(
              // Base mobile-first styles
              'w-full px-4 py-3 text-base', // 16px font size prevents iOS zoom
              'border border-gray-300 rounded-lg',
              'bg-white text-gray-900',
              'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              'transition-colors duration-200',
              'appearance-none cursor-pointer',
              
              // Touch-friendly sizing
              'min-h-[44px]', // Minimum touch target
              
              // Error state
              error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
              
              // Disabled state
              'disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed',
              
              className
            )}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Dropdown arrow */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <p className="text-sm text-red-600 mt-1 flex items-center">
            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        
        {/* Helper text */}
        {helperText && !error && (
          <p className="text-sm text-gray-500 mt-1">{helperText}</p>
        )}
      </div>
    )
  }
)

MobileSelect.displayName = 'MobileSelect'

export { MobileInput, MobileTextarea, MobileSelect }
