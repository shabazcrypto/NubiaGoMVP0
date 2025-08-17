// Feature Components - Centralized exports for better organization

// Auth Components
export { default as LoginForm } from '../auth/login-form'
export { OAuthButtons } from '../auth/oauth-buttons'
export { default as EmailVerificationStatus } from '../auth/EmailVerificationStatus'
export { RoleChangeHandler } from '../auth/role-change-handler'

// Product Components
export { default as ProductSearch } from '../product/product-search'
export { default as ProductReviews } from '../product/product-reviews'
export { AdvancedSearch } from '../product/advanced-search'
export { default as ProductFormBase } from '../product/forms/base/ProductFormBase'
export { default as AdminProductForm } from '../product/forms/admin/AdminProductForm'
export { default as SupplierProductForm } from '../product/forms/supplier/SupplierProductForm'

// Cart Components
export { default as ShoppingCart } from '../cart/shopping-cart'
export { default as Recommendations } from '../cart/recommendations'

// Checkout Components
export { CreditCardForm } from '../payment/credit-card-form'
export { MobileMoneyForm } from '../payment/mobile-money-form'
export { EnhancedMobileMoneyPayment } from '../payment/enhanced-mobile-money-payment'

// Admin Components
export { default as AdminAuthGuard } from '../admin/AdminAuthGuard'

// Supplier Components
export { default as BulkProductUpload } from '../supplier/BulkProductUpload'
export { default as SupplierAnalytics } from '../supplier/supplier-analytics'
export { SupplierImageManager } from '../supplier/supplier-image-manager'

// Chat Components
export { default as ChatInterface } from '../chat/chat-interface'
export { default as ChatWidget } from '../chat/chat-widget'
export { default as AdminModeration } from '../chat/admin-moderation'

// Customer Components
export { default as CustomerProfile } from '../customer/customer-profile'

// FAQ Components
export { default as FAQSearch } from '../faq/faq-search'

// Wishlist Components
export { default as Wishlist } from '../wishlist/wishlist'

// Shipping Components
export { ShippingCalculator } from '../shipping/shipping-calculator'
export { LiveTracking } from '../shipping/live-tracking'
export { LabelGenerator } from '../shipping/label-generator'

// Mobile Components
export { default as BottomNavigation } from '../mobile/BottomNavigation'
export { default as CategoryPills } from '../mobile/CategoryPills'
export { ConnectionAwareLoader } from '../mobile/ConnectionAwareLoader'
export { default as MobileHeader } from '../mobile/MobileHeader'
export { default as MobileHomepage } from '../mobile/MobileHomepage'
