import { z } from 'zod'

// User Registration Schema
export const registerSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits')
    .regex(/^[\d\s\-\+\(\)]+$/, 'Phone number can only contain digits, spaces, hyphens, and parentheses'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .max(128, 'Password must be less than 128 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// User Login Schema
export const loginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  password: z.string()
    .min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

// Address Schema
export const addressSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  company: z.string().optional(),
  address1: z.string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must be less than 200 characters'),
  address2: z.string().optional(),
  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must be less than 100 characters'),
  state: z.string()
    .min(2, 'State must be at least 2 characters')
    .max(100, 'State must be less than 100 characters'),
  postalCode: z.string()
    .min(3, 'Postal code must be at least 3 characters')
    .max(20, 'Postal code must be less than 20 characters'),
  country: z.string()
    .min(2, 'Country must be at least 2 characters')
    .max(100, 'Country must be less than 100 characters'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits'),
  email: z.string()
    .email('Please enter a valid email address')
    .optional(),
})

// Product Schema
export const productSchema = z.object({
  name: z.string()
    .min(3, 'Product name must be at least 3 characters')
    .max(100, 'Product name must be less than 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  price: z.number()
    .min(0.01, 'Price must be greater than 0')
    .max(999999.99, 'Price must be less than 1,000,000'),
  originalPrice: z.number()
    .min(0.01, 'Original price must be greater than 0')
    .max(999999.99, 'Original price must be less than 1,000,000')
    .optional(),
  category: z.string()
    .min(1, 'Category is required'),
  subcategory: z.string().optional(),
  brand: z.string()
    .min(2, 'Brand must be at least 2 characters')
    .max(50, 'Brand must be less than 50 characters')
    .optional(),
  sku: z.string()
    .min(3, 'SKU must be at least 3 characters')
    .max(50, 'SKU must be less than 50 characters')
    .optional(),
  stock: z.number()
    .min(0, 'Stock cannot be negative')
    .max(999999, 'Stock must be less than 1,000,000'),
  tags: z.array(z.string()).optional(),
  specifications: z.record(z.string()).optional(),
  images: z.array(z.string().url('Invalid image URL')).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
})

// Review Schema
export const reviewSchema = z.object({
  rating: z.number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  comment: z.string()
    .min(10, 'Comment must be at least 10 characters')
    .max(500, 'Comment must be less than 500 characters'),
  productId: z.string().min(1, 'Product ID is required'),
})

// Contact Form Schema
export const contactSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .email('Please enter a valid email address'),
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),
  phone: z.string().optional(),
  company: z.string().optional(),
})

// Payment Method Schema
export const paymentMethodSchema = z.object({
  cardNumber: z.string()
    .regex(/^\d{16}$/, 'Card number must be 16 digits'),
  expiryMonth: z.string()
    .regex(/^(0[1-9]|1[0-2])$/, 'Expiry month must be 01-12'),
  expiryYear: z.string()
    .regex(/^\d{4}$/, 'Expiry year must be 4 digits')
    .refine((year) => parseInt(year) >= new Date().getFullYear(), 'Card has expired'),
  cvv: z.string()
    .regex(/^\d{3,4}$/, 'CVV must be 3-4 digits'),
  cardholderName: z.string()
    .min(2, 'Cardholder name must be at least 2 characters')
    .max(100, 'Cardholder name must be less than 100 characters'),
  billingAddress: addressSchema,
})

// Supplier Application Schema
export const supplierApplicationSchema = z.object({
  businessName: z.string()
    .min(3, 'Business name must be at least 3 characters')
    .max(100, 'Business name must be less than 100 characters'),
  businessType: z.string()
    .min(1, 'Business type is required'),
  registrationNumber: z.string()
    .min(5, 'Registration number must be at least 5 characters')
    .max(50, 'Registration number must be less than 50 characters'),
  taxId: z.string()
    .min(5, 'Tax ID must be at least 5 characters')
    .max(50, 'Tax ID must be less than 50 characters'),
  contactPerson: z.string()
    .min(2, 'Contact person must be at least 2 characters')
    .max(100, 'Contact person must be less than 100 characters'),
  email: z.string()
    .email('Please enter a valid email address'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits'),
  website: z.string()
    .url('Please enter a valid website URL')
    .optional(),
  address: addressSchema,
  businessDescription: z.string()
    .min(20, 'Business description must be at least 20 characters')
    .max(500, 'Business description must be less than 500 characters'),
  productCategories: z.array(z.string())
    .min(1, 'At least one product category is required'),
  annualRevenue: z.string()
    .min(1, 'Annual revenue is required'),
  employeeCount: z.string()
    .min(1, 'Employee count is required'),
})

// Search Filters Schema
export const searchFiltersSchema = z.object({
  category: z.string().optional(),
  priceRange: z.object({
    min: z.number().min(0, 'Minimum price cannot be negative'),
    max: z.number().min(0, 'Maximum price cannot be negative'),
  }).optional(),
  rating: z.number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5')
    .optional(),
  brand: z.array(z.string()).optional(),
  availability: z.enum(['in-stock', 'out-of-stock']).optional(),
  sortBy: z.enum(['price-asc', 'price-desc', 'name-asc', 'name-desc', 'rating', 'newest']).optional(),
})

// User Profile Schema
export const userProfileSchema = z.object({
  displayName: z.string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be less than 50 characters'),
  email: z.string()
    .email('Please enter a valid email address'),
  phoneNumber: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits')
    .optional(),
  bio: z.string()
    .max(200, 'Bio must be less than 200 characters')
    .optional(),
  preferences: z.object({
    emailNotifications: z.boolean().optional(),
    smsNotifications: z.boolean().optional(),
    marketingEmails: z.boolean().optional(),
  }).optional(),
})

// Order Schema
export const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    price: z.number().min(0.01, 'Price must be greater than 0'),
  })).min(1, 'At least one item is required'),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
})

// API Configuration Schema
export const apiConfigurationSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters'),
  type: z.enum(['logistics', 'payment', 'communication', 'analytics', 'storage', 'other']),
  provider: z.string()
    .min(2, 'Provider must be at least 2 characters')
    .max(50, 'Provider must be less than 50 characters'),
  apiKey: z.string()
    .min(1, 'API key is required'),
  apiSecret: z.string().optional(),
  baseUrl: z.string().url('Invalid base URL').optional(),
  webhookUrl: z.string().url('Invalid webhook URL').optional(),
  isActive: z.boolean().optional(),
  isTestMode: z.boolean().optional(),
  config: z.record(z.any()).optional(),
})

// Export types
export type RegisterFormData = z.infer<typeof registerSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type AddressFormData = z.infer<typeof addressSchema>
export type ProductFormData = z.infer<typeof productSchema>
export type ReviewFormData = z.infer<typeof reviewSchema>
export type ContactFormData = z.infer<typeof contactSchema>
export type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>
export type SupplierApplicationFormData = z.infer<typeof supplierApplicationSchema>
export type SearchFiltersFormData = z.infer<typeof searchFiltersSchema>
export type UserProfileFormData = z.infer<typeof userProfileSchema>
export type OrderFormData = z.infer<typeof orderSchema>
export type ApiConfigurationFormData = z.infer<typeof apiConfigurationSchema> 