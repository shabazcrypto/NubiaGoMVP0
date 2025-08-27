# 🔥 Firebase Setup Guide for NubiaGo

## 📋 Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# ========================================
# FIREBASE CONFIGURATION
# ========================================

# Firebase Configuration (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCrdNo31J54779co1uhxVKCZEybgKK6hII
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nubiago-latest.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nubiago-latest
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nubiago-latest.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1071680034258
NEXT_PUBLIC_FIREBASE_APP_ID=1:1071680034258:web:e7b95de06ce571dbc0240b
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XE1YM7HV2J

# Firebase Admin SDK (Server-side only)
FIREBASE_PROJECT_ID=nubiago-latest
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@nubiago-latest.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=NubiaGo
NEXT_PUBLIC_SUPPORT_EMAIL=support@nubiago.com
NEXT_PUBLIC_SUPPORT_PHONE=+1234567890

# Email Service Configuration
EMAIL_SERVICE_PROVIDER=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key_here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Security Configuration
JWT_SECRET=nubiago-jwt-secret-key-2024
SESSION_SECRET=nubiago-session-secret-2024
CSRF_SECRET=nubiago-csrf-secret-2024

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Audit Logging
AUDIT_LOG_RETENTION_DAYS=365
ENABLE_AUDIT_LOGGING=true

# Storage Configuration
MAX_FILE_SIZE_MB=10
MAX_IMAGE_SIZE_MB=5
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png,webp,doc,docx

# Feature Flags
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_AUDIT_LOGGING=true
ENABLE_RATE_LIMITING=true
ENABLE_CSRF_PROTECTION=true
ENABLE_FILE_UPLOAD=true

# Development Settings
ENABLE_MOCK_SERVICES=false
ENABLE_DEBUG_LOGGING=true

# Error Monitoring
SENTRY_DSN=your_sentry_dsn_here
LOG_LEVEL=info

# Payment Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Mobile Money Configuration
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

## 🚀 Setup Steps

1. **Create `.env.local` file** in project root
2. **Copy the above variables** into the file
3. **Replace placeholder values** with your actual credentials
4. **Restart the development server**

## 🔧 Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `nubiago-latest`
3. Go to Project Settings
4. Copy the configuration values
5. Enable Authentication methods
6. Set up Firestore Database
7. Configure Storage rules

## 📧 Email Service Setup

### SendGrid (Recommended)
1. Create account at [SendGrid](https://sendgrid.com)
2. Generate API key
3. Verify sender email
4. Add API key to environment variables

### Alternative: Gmail SMTP
1. Enable 2-factor authentication
2. Generate app password
3. Use SMTP configuration above

## 🔒 Security Notes

- Never commit `.env.local` to version control
- Use strong, unique secrets for production
- Rotate API keys regularly
- Enable Firebase Security Rules
