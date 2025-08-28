# YellowCard Payment Integration

This document provides a comprehensive guide to integrating YellowCard's mobile money payment system into the NubiaGo e-commerce platform.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Webhook Setup](#webhook-setup)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [Deployment](#deployment)

## Features

- Support for multiple African countries and mobile money providers
- Real-time exchange rate conversion
- Secure payment processing
- Webhook notifications for payment status updates
- Comprehensive error handling and logging
- Admin dashboard for monitoring and management

## Prerequisites

- Node.js 16+ and npm/yarn
- Firebase project with Firestore database
- YellowCard merchant account and API credentials
- Server with HTTPS for webhook handling

## Installation

1. Install the required dependencies:

```bash
npm install @yellowcard/api-sdk axios crypto
# or
yarn add @yellowcard/api-sdk axios crypto
```

2. Copy the example environment file and update with your credentials:

```bash
cp .env.local.example .env.local
```

3. Update the Firebase configuration in your project.

## Configuration

### Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Required
YELLOWCARD_API_KEY=your_api_key_here
YELLOWCARD_API_SECRET=your_api_secret_here
YELLOWCARD_MERCHANT_ID=your_merchant_id_here
YELLOWCARD_WEBHOOK_SECRET=your_webhook_secret_here

# Optional
YELLOWCARD_DEBUG=true
YELLOWCARD_FEE_PERCENTAGE=1.5
YELLOWCARD_FIXED_FEE=100
```

### Firebase Rules

Update your Firestore security rules to include the following:

```
service cloud.firestore {
  match /databases/{database}/documents {
    // YellowCard payments collection
    match /yellowcard_payments/{paymentId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || isAdmin());
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.userId || isAdmin());
    }
  }
}

// Helper function to check admin status
function isAdmin() {
  return request.auth.token.admin == true;
}
```

## API Endpoints

### 1. Get Supported Countries

```
GET /api/yellowcard/countries
```

### 2. Get Providers by Country

```
GET /api/yellowcard/providers/:country
```

### 3. Get Exchange Rate

```
GET /api/yellowcard/exchange-rate?from=USDC&to=NGN
```

### 4. Initiate Payment

```
POST /api/yellowcard/payment
Content-Type: application/json
Authorization: Bearer <user_token>

{
  "amount": 10000,
  "currency": "NGN",
  "providerId": "mtn-ng",
  "phoneNumber": "08012345678",
  "country": "ng",
  "orderId": "order_123"
}
```

### 5. Check Payment Status

```
GET /api/yellowcard/payment?paymentId=pay_123
Authorization: Bearer <user_token>
```

## Webhook Setup

YellowCard will send payment status updates to your webhook endpoint. Configure the webhook URL in your YellowCard merchant dashboard:

```
https://yourdomain.com/api/yellowcard/webhook
```

## Testing

### Test Cards

Use the following test card numbers in development:

- **Success**: 4242 4242 4242 4242
- **Failure**: 4000 0000 0000 0002
- **3D Secure Required**: 4000 0000 0000 3220

### Test Webhooks

Use the following command to test webhooks locally:

```bash
curl -X POST https://yourdomain.com/api/yellowcard/webhook \
  -H "Content-Type: application/json" \
  -H "x-yellowcard-signature: your_webhook_secret" \
  -d '{
    "event": "payment.completed",
    "data": {
      "id": "pay_123",
      "status": "completed",
      "amount": 10000,
      "currency": "NGN",
      "reference": "YC-ABC123"
    }
  }'
```

## Troubleshooting

### Common Issues

1. **Webhook Notifications Not Received**
   - Verify the webhook URL is correctly configured in the YellowCard dashboard
   - Check your server logs for errors
   - Ensure your server is accessible from the internet

2. **Authentication Failures**
   - Verify your API key and secret are correct
   - Check that your server's clock is synchronized (NTP)

3. **Payment Processing Delays**
   - Some mobile money providers may take several minutes to process payments
   - Check the payment status using the API

## Security

- All API endpoints require authentication
- Webhook signatures are verified for all incoming requests
- Sensitive data is never logged
- API keys and secrets are stored securely in environment variables

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Disable debug mode: `YELLOWCARD_DEBUG=false`
- [ ] Enable signature verification: `YELLOWCARD_ENABLE_SIGNATURE_VERIFICATION=true`
- [ ] Set up IP whitelisting if required
- [ ] Configure proper logging and monitoring
- [ ] Set up alerts for failed payments

### Deployment Steps

1. Build your application:

```bash
npm run build
# or
yarn build
```

2. Start the production server:

```bash
npm start
# or
yarn start
```

## Support

For support, please contact:

- **Email**: support@nubiago.com
- **Phone**: +1 (555) 123-4567

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
