// Feature Components - Centralized exports for better organization

// Auth Components
export { LoginForm } from '../auth/login-form'
export { OAuthButtons } from '../auth/oauth-buttons'
export { EmailVerificationStatus } from '../auth/EmailVerificationStatus'
export { RoleChangeHandler } from '../auth/role-change-handler'

// Product Components
export { ProductSearch } from '../product/product-search'
export { ProductReviews } from '../product/product-reviews'
export { AdvancedSearch } from '../product/advanced-search'
export { ProductFormBase } from '../product/forms/base/ProductFormBase'
export { AdminProductForm } from '../product/forms/admin/AdminProductForm'
export { SupplierProductForm } from '../product/forms/supplier/SupplierProductForm'

// Cart Components
export { ShoppingCart } from '../cart/shopping-cart'
export { Recommendations } from '../cart/recommendations'

// Checkout Components
export { CreditCardForm } from '../payment/credit-card-form'
export { MobileMoneyForm } from '../payment/mobile-money-form'
export { EnhancedMobileMoneyPayment } from '../payment/enhanced-mobile-money-payment'

// Admin Components
export { AdminAuthGuard } from '../admin/AdminAuthGuard'

// Supplier Components
export { BulkProductUpload } from '../supplier/BulkProductUpload'
export { SupplierAnalytics } from '../supplier/supplier-analytics'
export { SupplierImageManager } from '../supplier/supplier-image-manager'

// Chat Components
export { ChatInterface } from '../chat/chat-interface'
export { ChatWidget } from '../chat/chat-widget'
export { AdminModeration } from '../chat/admin-moderation'

// Customer Components
export { CustomerProfile } from '../customer/customer-profile'

// FAQ Components
export { FAQSearch } from '../faq/faq-search'

// Wishlist Components
export { Wishlist } from '../wishlist/wishlist'

// Shipping Components
export { ShippingCalculator } from '../shipping/shipping-calculator'
export { LiveTracking } from '../shipping/live-tracking'
export { LabelGenerator } from '../shipping/label-generator'

// Mobile Components
export { BottomNavigation } from '../mobile/BottomNavigation'
export { CategoryPills } from '../mobile/CategoryPills'
export { ConnectionAwareLoader } from '../mobile/ConnectionAwareLoader'
export { MobileHeader } from '../mobile/MobileHeader'
export { MobileHomepage } from '../mobile/MobileHomepage'
