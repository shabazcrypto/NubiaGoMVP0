'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, Sparkles, Smartphone, Home, Palette, Shirt, ShoppingBag, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  subcategories?: Category[]
}

const categories: Category[] = [
  {
    id: 'fashion',
    name: 'Fashion',
    href: '/products?category=fashion',
    icon: Shirt,
    subcategories: [
      { id: 'women', name: 'Women', href: '/products?category=women' },
      { id: 'men', name: 'Men', href: '/products?category=men' },
      { id: 'kids', name: 'Kids', href: '/products?category=kids' },
      { id: 'accessories', name: 'Accessories', href: '/products?category=accessories' }
    ]
  },
  {
    id: 'electronics',
    name: 'Electronics',
    href: '/products?category=electronics',
    icon: Smartphone,
    subcategories: [
      { id: 'phones', name: 'Phones', href: '/products?category=phones' },
      { id: 'laptops', name: 'Laptops', href: '/products?category=laptops' },
      { id: 'tablets', name: 'Tablets', href: '/products?category=tablets' },
      { id: 'accessories', name: 'Accessories', href: '/products?category=electronics-accessories' }
    ]
  },
  {
    id: 'home-living',
    name: 'Home & Living',
    href: '/products?category=home-living',
    icon: Home,
    subcategories: [
      { id: 'furniture', name: 'Furniture', href: '/products?category=furniture' },
      { id: 'decor', name: 'Decor', href: '/products?category=decor' },
      { id: 'kitchen', name: 'Kitchen', href: '/products?category=kitchen' },
      { id: 'bathroom', name: 'Bathroom', href: '/products?category=bathroom' }
    ]
  },
  {
    id: 'beauty',
    name: 'Beauty & Cosmetics',
    href: '/products?category=beauty',
    icon: Palette,
    subcategories: [
      { id: 'skincare', name: 'Skincare', href: '/products?category=skincare' },
      { id: 'makeup', name: 'Makeup', href: '/products?category=makeup' },
      { id: 'haircare', name: 'Haircare', href: '/products?category=haircare' },
      { id: 'fragrances', name: 'Fragrances', href: '/products?category=fragrances' }
    ]
  },
  {
    id: 'shoes-bags',
    name: 'Shoes & Bags',
    href: '/products?category=shoes-bags',
    icon: ShoppingBag,
    subcategories: [
      { id: 'shoes', name: 'Shoes', href: '/products?category=shoes' },
      { id: 'bags', name: 'Bags', href: '/products?category=bags' },
      { id: 'wallets', name: 'Wallets', href: '/products?category=wallets' },
      { id: 'belts', name: 'Belts', href: '/products?category=belts' }
    ]
  },
  {
    id: 'sports',
    name: 'Sports & Outdoors',
    href: '/products?category=sports',
    icon: Zap,
    subcategories: [
      { id: 'fitness', name: 'Fitness', href: '/products?category=fitness' },
      { id: 'outdoor', name: 'Outdoor', href: '/products?category=outdoor' },
      { id: 'team-sports', name: 'Team Sports', href: '/products?category=team-sports' },
      { id: 'equipment', name: 'Equipment', href: '/products?category=sports-equipment' }
    ]
  }
]

interface CategoriesDropdownProps {
  className?: string
}

export function CategoriesDropdown({ className }: CategoriesDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setActiveCategory(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCategoryHover = (categoryId: string) => {
    setActiveCategory(categoryId)
  }

  const handleCategoryLeave = () => {
    setActiveCategory(null)
  }

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center space-x-2 border-slate-300 text-slate-700 hover:bg-slate-50"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
      >
        <span className="text-sm font-medium">Shop By Categories</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-[600px]"
          onMouseLeave={() => {
            setIsOpen(false)
            setActiveCategory(null)
          }}
        >
          <div className="flex">
            {/* Main Categories */}
            <div className="w-1/2 border-r border-slate-200">
              {categories.map((category) => {
                const IconComponent = category.icon
                return (
                  <div
                    key={category.id}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors",
                      activeCategory === category.id && "bg-slate-50"
                    )}
                    onMouseEnter={() => handleCategoryHover(category.id)}
                  >
                    <Link
                      href={category.href}
                      className="flex items-center space-x-3 flex-1 text-slate-700 hover:text-slate-900"
                      onClick={() => setIsOpen(false)}
                    >
                      {IconComponent && <IconComponent className="h-4 w-4 text-slate-500" />}
                      <span className="font-medium">{category.name}</span>
                    </Link>
                    {category.subcategories && (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Subcategories */}
            {activeCategory && (
              <div className="w-1/2 p-4">
                <h3 className="font-semibold text-slate-900 mb-3 text-sm">
                  {categories.find(c => c.id === activeCategory)?.name}
                </h3>
                <div className="space-y-1">
                  {categories
                    .find(c => c.id === activeCategory)
                    ?.subcategories?.map((subcategory) => (
                      <Link
                        key={subcategory.id}
                        href={subcategory.href}
                        className="block py-2 px-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors text-sm"
                        onClick={() => setIsOpen(false)}
                      >
                        {subcategory.name}
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
