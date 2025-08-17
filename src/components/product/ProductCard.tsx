'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Eye,
  Share2,
  Zap
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { useCartStore } from '@/hooks/useCartStore'
import { toast } from '@/hooks/use-toast'

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  images?: string[]
  category: string
  rating: number
  reviewCount: number
  discount?: number
  inStock: boolean
  isFeatured?: boolean
  isNew?: boolean
  isBestSeller?: boolean
  brand?: string
  tags: string[]
}

interface ProductCardProps {
  product: Product
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showQuickActions?: boolean
  showWishlist?: boolean
  onQuickView?: (product: Product) => void
}

export function ProductCard({ 
  product, 
  className,
  size = 'md',
  showQuickActions = true,
  showWishlist = true,
  onQuickView
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { addItem } = useCartStore()

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsLoading(true)
    try {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      })
      
      toast({
        title: "Added to cart!",
        description: `${product.name} has been added to your cart.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
    
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: `${product.name} has been ${isWishlisted ? 'removed from' : 'added to'} your wishlist.`,
    })
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onQuickView?.(product)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: `/products/${product.id}`,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/products/${product.id}`)
      toast({
        title: "Link copied!",
        description: "Product link has been copied to clipboard.",
      })
    }
  }

  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount

  const sizeClasses = {
    sm: 'w-full max-w-xs',
    md: 'w-full max-w-sm',
    lg: 'w-full max-w-md'
  }

  return (
    <Card className={cn(
      "group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
      sizeClasses[size],
      className
    )}>
      <Link href={`/products/${product.id}`}>
        {/* Product Image */}
        <div className="relative overflow-hidden">
          <div className="aspect-square bg-muted">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discountPercent && discountPercent > 0 && (
              <Badge variant="destructive" className="text-xs">
                -{discountPercent}%
              </Badge>
            )}
            {product.isNew && (
              <Badge className="text-xs bg-green-500 hover:bg-green-600">
                New
              </Badge>
            )}
            {product.isBestSeller && (
              <Badge className="text-xs bg-orange-500 hover:bg-orange-600">
                <Zap className="w-3 h-3 mr-1" />
                Best Seller
              </Badge>
            )}
            {product.isFeatured && (
              <Badge variant="secondary" className="text-xs">
                Featured
              </Badge>
            )}
          </div>
          
          {/* Quick Actions */}
          {showQuickActions && (
            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {showWishlist && (
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="h-8 w-8 bg-white/90 hover:bg-white"
                  onClick={handleWishlistToggle}
                >
                  <Heart 
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
                    )} 
                  />
                </Button>
              )}
              
              {onQuickView && (
                <Button 
                  size="icon" 
                  variant="secondary"
                  className="h-8 w-8 bg-white/90 hover:bg-white"
                  onClick={handleQuickView}
                >
                  <Eye className="h-4 w-4 text-gray-600" />
                </Button>
              )}
              
              <Button 
                size="icon" 
                variant="secondary"
                className="h-8 w-8 bg-white/90 hover:bg-white"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
          )}
          
          {/* Stock Status */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Badge variant="destructive" className="text-sm">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <CardContent className="p-4">
          {/* Brand */}
          {product.brand && (
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
              {product.brand}
            </p>
          )}
          
          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={cn(
                    "h-3 w-3",
                    i < Math.floor(product.rating) 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "text-gray-300"
                  )} 
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>
          
          {/* Product Name */}
          <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="font-bold text-lg text-primary">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </CardContent>
        
        {/* Actions */}
        <CardFooter className="p-4 pt-0">
          <div className="flex gap-2 w-full">
            <Button 
              className="flex-1" 
              size="sm"
              onClick={handleAddToCart}
              disabled={!product.inStock || isLoading}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isLoading ? 'Adding...' : 'Add to Cart'}
            </Button>
            {size !== 'sm' && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/products/${product.id}`}>
                  View Details
                </Link>
              </Button>
            )}
          </div>
        </CardFooter>
      </Link>
    </Card>
  )
}

export default ProductCard
