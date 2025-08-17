'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, ChevronDown, Sparkles, Smartphone, Home, Palette, Shirt, ShoppingBag, Zap } from 'lucide-react'
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

interface MobileCategoriesMenuProps {
  onClose?: () => void
}

export function MobileCategoriesMenu({ onClose }: MobileCategoriesMenuProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleCategoryClick = (href: string) => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <div className="space-y-1">
      {categories.map((category) => {
        const IconComponent = category.icon
        return (
          <div key={category.id} className="border-b border-slate-100 last:border-b-0">
            <div className="flex items-center justify-between py-3">
              <Link
                href={category.href}
                className="flex items-center space-x-3 flex-1 text-slate-900 font-medium"
                onClick={() => handleCategoryClick(category.href)}
              >
                {IconComponent && <IconComponent className="h-4 w-4 text-slate-500" />}
                <span>{category.name}</span>
              </Link>
              {category.subcategories && (
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="p-2 -m-2"
                >
                  {expandedCategories.includes(category.id) ? (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  )}
                </button>
              )}
            </div>
            
            {expandedCategories.includes(category.id) && category.subcategories && (
              <div className="pl-4 pb-3 space-y-2">
                {category.subcategories.map((subcategory) => (
                  <Link
                    key={subcategory.id}
                    href={subcategory.href}
                    className="block py-2 text-slate-600 hover:text-slate-900"
                    onClick={() => handleCategoryClick(subcategory.href)}
                  >
                    {subcategory.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
