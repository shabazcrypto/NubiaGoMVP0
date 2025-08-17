'use client'

import { 
  ShoppingBag, 
  Laptop, 
  Shirt, 
  Home, 
  Heart, 
  Watch,
  Headphones,
  Palette,
  Star,
  Sparkles
} from 'lucide-react'

// ============================================================================
// BEAUTIFUL IMAGE PLACEHOLDERS
// ============================================================================

interface PlaceholderProps {
  width?: number
  height?: number
  className?: string
}

// 1. GRADIENT PRODUCT PLACEHOLDER
export function GradientProductPlaceholder({ 
  width = 400, 
  height = 500, 
  className = '' 
}: PlaceholderProps) {
  return (
    <div 
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{ width, height }}
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-80"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full backdrop-blur-sm"></div>
      <div className="absolute bottom-6 left-6 w-12 h-12 bg-white/10 rounded-lg backdrop-blur-sm"></div>
      
      {/* Center Icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white">
          <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-80" />
          <span className="text-sm font-medium">Premium Product</span>
        </div>
      </div>
      
      {/* Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse"></div>
    </div>
  )
}

// 2. CATEGORY ICON PLACEHOLDER
export function CategoryIconPlaceholder({ 
  categoryType = 'default',
  width = 400, 
  height = 300, 
  className = '' 
}: PlaceholderProps & { categoryType?: string }) {
  
  const categoryConfig = {
    electronics: { icon: Laptop, gradient: 'from-blue-400 to-cyan-400', name: 'Electronics' },
    fashion: { icon: Shirt, gradient: 'from-pink-400 to-rose-400', name: 'Fashion' },
    home: { icon: Home, gradient: 'from-green-400 to-emerald-400', name: 'Home & Living' },
    cosmetics: { icon: Palette, gradient: 'from-purple-400 to-pink-400', name: 'Beauty' },
    accessories: { icon: Watch, gradient: 'from-orange-400 to-amber-400', name: 'Accessories' },
    default: { icon: Star, gradient: 'from-gray-400 to-slate-400', name: 'Category' }
  }
  
  const config = categoryConfig[categoryType as keyof typeof categoryConfig] || categoryConfig.default
  const IconComponent = config.icon
  
  return (
    <div 
      className={`relative overflow-hidden rounded-xl ${className}`}
      style={{ width, height }}
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient}`}></div>
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               backgroundRepeat: 'repeat',
               backgroundSize: '30px 30px'
             }}>
        </div>
      </div>
      
      {/* Center Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
            <IconComponent className="h-8 w-8" />
          </div>
          <span className="text-lg font-semibold">{config.name}</span>
        </div>
      </div>
    </div>
  )
}

// 3. HERO BANNER PLACEHOLDER
export function HeroBannerPlaceholder({ 
  width = 1200, 
  height = 600, 
  className = '' 
}: PlaceholderProps) {
  return (
    <div 
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{ width, height }}
    >
      {/* Multi-layer Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
      
      {/* Geometric Shapes */}
      <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-1/3 left-1/5 w-24 h-24 bg-yellow-400/20 rounded-lg rotate-45 animate-pulse delay-1000"></div>
      
      {/* Center Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white">
          <Sparkles className="h-16 w-16 mx-auto mb-4 animate-pulse" />
          <h2 className="text-3xl font-bold mb-2">Featured Content</h2>
          <p className="text-lg opacity-80">Premium showcase area</p>
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-8 left-8 w-3 h-3 bg-white rounded-full animate-ping"></div>
      <div className="absolute bottom-8 right-8 w-2 h-2 bg-yellow-400 rounded-full animate-ping delay-500"></div>
    </div>
  )
}

// 4. AVATAR PLACEHOLDER
export function AvatarPlaceholder({ 
  width = 60, 
  height = 60, 
  className = '',
  initials = 'U'
}: PlaceholderProps & { initials?: string }) {
  return (
    <div 
      className={`relative overflow-hidden rounded-full ${className} bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center`}
      style={{ width, height }}
    >
      <span className="text-white font-bold text-xl">{initials}</span>
    </div>
  )
}

// 5. DEAL/OFFER PLACEHOLDER
export function DealPlaceholder({ 
  width = 400, 
  height = 300, 
  className = '',
  dealType = 'sale'
}: PlaceholderProps & { dealType?: string }) {
  
  const dealConfig = {
    sale: { gradient: 'from-red-500 to-orange-500', icon: '🔥', text: 'Hot Sale' },
    new: { gradient: 'from-green-500 to-emerald-500', icon: '✨', text: 'New Arrival' },
    flash: { gradient: 'from-yellow-500 to-amber-500', icon: '⚡', text: 'Flash Deal' }
  }
  
  const config = dealConfig[dealType as keyof typeof dealConfig] || dealConfig.sale
  
  return (
    <div 
      className={`relative overflow-hidden rounded-xl ${className}`}
      style={{ width, height }}
    >
      {/* Animated Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} animate-pulse`}></div>
      
      {/* Center Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-4xl mb-2">{config.icon}</div>
          <span className="text-xl font-bold">{config.text}</span>
        </div>
      </div>
      
      {/* Corner Decoration */}
      <div className="absolute top-2 right-2 w-6 h-6 bg-white/20 rounded-full"></div>
      <div className="absolute bottom-2 left-2 w-4 h-4 bg-white/10 rounded-full"></div>
    </div>
  )
}

// ============================================================================
// SIMPLE MINIMAL PLACEHOLDERS (Alternative)
// ============================================================================

export function MinimalProductPlaceholder({ 
  width = 400, 
  height = 500, 
  className = '' 
}: PlaceholderProps) {
  return (
    <div 
      className={`relative overflow-hidden rounded-lg bg-gray-50 border-2 border-dashed border-gray-200 ${className} flex items-center justify-center`}
      style={{ width, height }}
    >
      <div className="text-center text-gray-400">
        <ShoppingBag className="h-12 w-12 mx-auto mb-2" />
        <span className="text-sm">Product Image</span>
      </div>
    </div>
  )
}

export function MinimalCategoryPlaceholder({ 
  width = 400, 
  height = 300, 
  className = '' 
}: PlaceholderProps) {
  return (
    <div 
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 ${className} flex items-center justify-center`}
      style={{ width, height }}
    >
      <div className="text-center text-gray-500">
        <div className="w-12 h-12 bg-gray-300 rounded-lg mx-auto mb-2 flex items-center justify-center">
          <Laptop className="h-6 w-6 text-gray-600" />
        </div>
        <span className="text-sm font-medium">Category</span>
      </div>
    </div>
  )
}
