# Access Control & User Management System

## Overview

This document outlines the comprehensive access control and user management system implemented for the NubiaGo marketplace platform. The system ensures proper role-based access control, user approval workflows, and secure dashboard access.

## System Architecture

### 1. User Roles & Permissions

#### **Customer Role**
- **Default Role**: All new registrations start as customers
- **Status**: `active` (immediate access)
- **Access**: 
  - Browse products
  - Place orders
  - Manage profile
  - Access customer dashboard
  - Use wishlist and cart features

#### **Supplier Role**
- **Registration**: Requires special registration process
- **Status**: `pending` → `active` (requires admin approval)
- **Access**:
  - Submit products for approval
  - Access supplier dashboard (only when approved)
  - Manage business profile
  - View orders and analytics

#### **Admin Role**
- **Creation**: Only by existing admins or system
- **Status**: `active` (immediate access)
- **Access**:
  - Full system access
  - User management
  - Supplier approval
  - Product management
  - Analytics and reporting

### 2. User Status Management

#### **Status Types**
- **`active`**: User can access their dashboard and features
- **`pending`**: User is waiting for approval (suppliers only)
- **`suspended`**: User account is temporarily disabled

#### **Status Transitions**
```
Customer: registered → active (immediate)
Supplier: registered → pending → active (after approval)
Admin: created → active (immediate)
```

## Implementation Details

### 1. Middleware Protection (`src/middleware.ts`)

The middleware provides route-level protection:

```typescript
// Protected routes with required roles
const protectedRoutes = {
  '/admin': ['admin'],
  '/supplier': ['supplier'],
  '/customer': ['customer', 'supplier', 'admin'],
  '/products/create': ['admin'],
  '/products/supplier/create': ['supplier']
}
```

**Features:**
- Route-based access control
- Role validation
- Status checking
- Automatic redirects for unauthorized access

### 2. Enhanced Authentication Service (`src/lib/services/auth.service.ts`)

#### **Key Methods:**
- `register()`: Customer registration with immediate access
- `registerSupplier()`: Supplier registration with approval workflow
- `createAdminAccount()`: Admin creation (admin-only)
- `approveSupplier()`: Admin approval of suppliers
- `suspendUser()`: Admin suspension of users
- `reactivateUser()`: Admin reactivation of users

#### **Registration Flow:**

**Customer Registration:**
```typescript
// Immediate access
const user = await authService.register(email, password, displayName, 'customer')
// Status: active, Role: customer
```

**Supplier Registration:**
```typescript
// Requires approval
const user = await authService.registerSupplier(
  email, password, displayName, 
  businessName, businessType, phoneNumber, documents
)
// Status: pending, Role: supplier
```

**Admin Creation:**
```typescript
// Admin-only creation
const admin = await authService.createAdminAccount(
  email, password, displayName, createdBy
)
// Status: active, Role: admin
```

### 3. API Endpoints

#### **Registration API (`/api/auth/register`)**
- Handles both customer and supplier registration
- Validates different schemas based on role
- Returns appropriate success messages

#### **Login API (`/api/auth/login`)**
- Validates user credentials
- Checks user status and role
- Returns user profile with permissions

### 4. Status Pages

#### **Unauthorized Page (`/unauthorized`)**
- Shown when users lack required permissions
- Provides navigation options
- Contact support information

#### **Account Suspended Page (`/account-suspended`)**
- Shown when user account is suspended
- Explains suspension reasons
- Contact support options

#### **Supplier Pending Approval Page (`/supplier/pending-approval`)**
- Shown to suppliers awaiting approval
- Application status timeline
- Contact information and FAQ

### 5. Admin User Management (`/admin/users`)

#### **Features:**
- View all users with filtering
- Approve/reject supplier applications
- Suspend/reactivate users
- Create new admin accounts
- View supplier business details

#### **Actions Available:**
- **Approve Supplier**: Changes status from `pending` to `active`
- **Reject Supplier**: Changes status to `suspended`
- **Suspend User**: Changes status to `suspended`
- **Reactivate User**: Changes status to `active`
- **Create Admin**: Creates new admin accounts

## Best Practices

### 1. Security Measures

#### **Role-Based Access Control (RBAC)**
- Every route is protected by middleware
- Role validation at both client and server
- Status checking prevents unauthorized access

#### **Admin Account Security**
- Only existing admins can create new admin accounts
- Admin creation is logged for audit trail
- Strong password requirements

#### **Supplier Approval Process**
- Business document verification
- Background checks (implemented)
- Manual review by admin team
- Email notifications for status changes

### 2. User Experience

#### **Clear Status Communication**
- Users understand their account status
- Clear messaging for pending approvals
- Easy access to support

#### **Graceful Error Handling**
- Informative error messages
- Appropriate redirects
- Contact support options

### 3. Scalability

#### **Modular Design**
- Separate services for different user types
- Reusable components
- Easy to extend with new roles

#### **Database Structure**
- Users collection for basic profiles
- Suppliers collection for business details
- Audit logs for admin actions

## Implementation Checklist

### ✅ Completed
- [x] Middleware route protection
- [x] Enhanced authentication service
- [x] Role-based registration
- [x] Supplier approval workflow
- [x] Admin user management
- [x] Status pages for different states
- [x] API endpoints for registration/login
- [x] User management dashboard

### 🔄 In Progress
- [ ] Firebase Auth integration
- [ ] Email notifications
- [ ] Document upload to Firebase Storage
- [ ] Audit logging system

### 📋 Future Enhancements
- [ ] Two-factor authentication
- [ ] Advanced role permissions
- [ ] Automated approval workflows
- [ ] User activity monitoring
- [ ] Advanced admin analytics

## Usage Examples

### Creating a Customer Account
```typescript
// Customer gets immediate access
const customer = await authService.register(
  'customer@example.com', 
  'password123', 
  'John Doe', 
  'customer'
)
// customer.status = 'active'
// customer.role = 'customer'
```

### Creating a Supplier Account
```typescript
// Supplier requires approval
const supplier = await authService.registerSupplier(
  'supplier@business.com',
  'password123',
  'Business Owner',
  'TechCorp Electronics',
  'retail',
  '+1234567890',
  [businessDocuments]
)
// supplier.status = 'pending'
// supplier.role = 'supplier'
```

### Admin Approving a Supplier
```typescript
// Admin approves supplier
await authService.approveSupplier(
  'supplier-uid',
  'admin-uid'
)
// Changes status from 'pending' to 'active'
```

### Admin Creating Another Admin
```typescript
// Only admins can create other admins
const newAdmin = await authService.createAdminAccount(
  'newadmin@company.com',
  'securePassword123',
  'New Admin',
  'existing-admin-uid'
)
// newAdmin.status = 'active'
// newAdmin.role = 'admin'
```

## Security Considerations

1. **Input Validation**: All user inputs are validated using Zod schemas
2. **Role Verification**: Server-side role checking prevents client-side manipulation
3. **Status Checking**: Users cannot access features if their status is not appropriate
4. **Audit Logging**: All admin actions are logged for security
5. **Secure Routes**: Middleware protects all sensitive routes
6. **Error Handling**: Secure error messages don't leak sensitive information

## Monitoring & Maintenance

### Regular Tasks
- Review pending supplier applications
- Monitor user suspension reasons
- Audit admin account creation
- Review security logs
- Update approval workflows as needed

### Metrics to Track
- Registration conversion rates
- Supplier approval times
- User suspension rates
- Admin action frequency
- Support ticket volume

This system provides a robust foundation for user management while maintaining security and user experience standards. 