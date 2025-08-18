'use client'

import React from 'react'
import Link from 'next/link'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter 
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight,
  ShoppingBag,
  Truck,
  Shield
} from 'lucide-react'
import { useCartStore } from '@/hooks/useCartStore'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'

interface CartDrawerProps {
  children?: React.ReactNode
  className?: string
}

export function CartDrawer({ children, className }: CartDrawerProps) {
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    total
  } = useCartStore()

  // Calculate derived values
  const subtotal = total
  const tax = total * 0.1 // 10% tax
  const shipping = total > 50 ? 0 : 5.99 // Free shipping over $50

  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const isEmpty = items.length === 0

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      toast("Item has been removed from your cart.", "success")
    } else {
      updateQuantity(id, quantity)
    }
  }

  const handleRemoveItem = (id: string, name: string) => {
    removeItem(id)
    toast(`${name} has been removed from your cart.`, "success")
  }

  const handleClearCart = () => {
    clearCart()
    toast("All items have been removed from your cart.", "success")
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children || (
          <Button variant="ghost" className="h-8 w-8 p-0" className={cn("relative", className)}>
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs animate-cart-bounce"
                variant="destructive"
              >
                {itemCount > 99 ? '99+' : itemCount}
              </Badge>
            )}
            <span className="sr-only">Open shopping cart</span>
          </Button>
        )}
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart ({itemCount})
          </SheetTitle>
        </SheetHeader>
        
        {isEmpty ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg">Your cart is empty</h3>
              <p className="text-muted-foreground text-sm">
                Looks like you haven't added anything to your cart yet.
              </p>
            </div>
            <Button asChild>
              <Link href="/products">
                Start Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          /* Cart Items */
          <>
            <ScrollArea className="flex-1 -mr-6 pr-6">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                        {item.name}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        ${item.price.toFixed(2)} each
                      </p>
                      
                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            className="h-8 w-8 p-0" 
                            className="h-6 w-6"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-semibold min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <Button 
                            variant="outline" 
                            className="h-8 w-8 p-0" 
                            className="h-6 w-6"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveItem(item.id, item.name)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Item Total */}
                    <div className="text-right">
                      <p className="font-bold text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {/* Cart Footer */}
            <div className="border-t pt-4 space-y-4">
              {/* Promo Benefits */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Truck className="h-3 w-3" />
                  <span>Free shipping over $50</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span>Secure checkout</span>
                </div>
              </div>
              
              {/* Cart Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {shipping > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                )}
                {tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-2">
                <Button className="w-full" size="lg" asChild>
                  <Link href="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href="/cart">View Cart</Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleClearCart}
                    className="text-destructive hover:text-destructive"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default CartDrawer
