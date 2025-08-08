# API Management Guide

## Overview

The API Management system allows administrators to configure and manage third-party API integrations for the NubiaGo e-commerce platform. This includes logistics APIs, payment processors, communication services, analytics platforms, and more.

## Features

### 🔌 Supported API Types

1. **Logistics APIs**
   - FedEx - Shipping and logistics services
   - UPS - United Parcel Service shipping
   - DHL - International shipping services

2. **Payment APIs**
   - Stripe - Payment processing platform
   - PayPal - Digital payment platform
   - Square - Payment and point-of-sale solutions

3. **Communication APIs**
   - SendGrid - Email delivery service
   - Twilio - SMS and voice communication
   - Mailchimp - Email marketing platform

4. **Analytics APIs**
   - Google Analytics - Web analytics service
   - Mixpanel - Product analytics platform

5. **Storage APIs**
   - AWS S3 - Cloud storage
   - Google Cloud Storage - Cloud storage
   - Azure Blob Storage - Cloud storage

6. **Other APIs**
   - Custom integrations

### 🎯 Key Features

- **API Configuration Management**: Add, edit, and delete API configurations
- **Test Mode Support**: Test APIs in sandbox/test mode before going live
- **Connection Testing**: Test API connections and view results
- **Status Monitoring**: Monitor API status and health
- **Search and Filtering**: Search APIs by name, provider, or filter by type/status
- **Secure Storage**: Encrypted storage of API keys and secrets
- **Webhook Management**: Configure webhook URLs for real-time updates

## Access

### Navigation

1. **From Admin Dashboard**:
   - Click the "APIs" icon in the left sidebar (⚡ icon)
   - Or click the "Manage APIs" button in the header

2. **Direct URL**: `/admin/apis`

### Permissions

- **Required Role**: Admin only
- **Access Control**: Protected by admin authentication middleware

## Usage

### Adding a New API

1. **Navigate to API Management**
   - Go to `/admin/apis`
   - Click "Add API" button

2. **Fill in API Details**
   - **API Name**: Descriptive name for the integration
   - **API Type**: Select from logistics, payment, communication, analytics, storage, or other
   - **Provider**: Choose from predefined providers or enter custom provider name
   - **API Key**: Enter the API key from the service provider
   - **API Secret**: Enter the API secret (if required)
   - **Base URL**: API base URL (optional)
   - **Webhook URL**: Webhook endpoint URL (optional)

3. **Configure Settings**
   - **Active**: Enable/disable the API integration
   - **Test Mode**: Enable test mode for sandbox testing

4. **Save Configuration**
   - Click "Add API" to save the configuration

### Editing an API

1. **Find the API**
   - Use search or filters to locate the API
   - Click the edit icon (✏️) on the API card

2. **Update Configuration**
   - Modify the required fields
   - Click "Update API" to save changes

### Testing an API

1. **Access Test Modal**
   - Click the test tube icon (🧪) on the API card
   - Or click "Test Connection" in the edit modal

2. **Run Test**
   - Click "Test Connection" button
   - View test results and response times
   - Check for any error messages

3. **Review Results**
   - Green checkmark: Connection successful
   - Red X: Connection failed (check error message)
   - Response time displayed in milliseconds

### Managing API Status

- **Active**: API is enabled and ready for use
- **Inactive**: API is disabled but configuration is preserved
- **Error**: API has encountered an error (check error message)
- **Testing**: API is currently being tested

## API Configuration Fields

### Required Fields
- **Name**: Unique identifier for the API
- **Type**: Category of the API (logistics, payment, etc.)
- **Provider**: Service provider name
- **API Key**: Authentication key

### Optional Fields
- **API Secret**: Additional authentication secret
- **Base URL**: API endpoint base URL
- **Webhook URL**: Webhook endpoint for real-time updates
- **Configuration**: Additional provider-specific settings

### Security Features
- API keys and secrets are encrypted in storage
- Passwords are masked in the UI
- Secure transmission of credentials
- Access logging for audit trails

## Best Practices

### Security
1. **Use Environment Variables**: Store sensitive data in environment variables
2. **Rotate Keys Regularly**: Update API keys periodically
3. **Monitor Access**: Review access logs regularly
4. **Test in Sandbox**: Always test in test mode first

### Configuration
1. **Descriptive Names**: Use clear, descriptive names for APIs
2. **Documentation**: Keep notes about configuration details
3. **Backup Configurations**: Export configurations for backup
4. **Version Control**: Track configuration changes

### Testing
1. **Test Before Production**: Always test in test mode
2. **Monitor Performance**: Check response times
3. **Error Handling**: Review error messages and logs
4. **Regular Testing**: Test APIs periodically

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check API key and secret
   - Verify base URL is correct
   - Ensure API is active and not in test mode
   - Check network connectivity

2. **Authentication Error**
   - Verify API credentials
   - Check if API key has expired
   - Ensure proper permissions are set

3. **Rate Limiting**
   - Check API usage limits
   - Implement rate limiting in your application
   - Contact service provider if needed

4. **Webhook Issues**
   - Verify webhook URL is accessible
   - Check webhook authentication
   - Ensure proper error handling

### Support

For technical support:
- Check the service provider's documentation
- Review error logs in the admin panel
- Contact the development team
- Submit an issue through the support system

## Integration Examples

### Stripe Payment Integration

```typescript
// Example configuration
{
  name: "Stripe Payments",
  type: "payment",
  provider: "Stripe",
  apiKey: "sk_test_...",
  apiSecret: "whsec_...",
  baseUrl: "https://api.stripe.com",
  webhookUrl: "https://api.nubiago.com/webhooks/stripe",
  isActive: true,
  isTestMode: true,
  config: {
    webhookSecret: "whsec_...",
    currency: "usd"
  }
}
```

### SendGrid Email Integration

```typescript
// Example configuration
{
  name: "SendGrid Email",
  type: "communication",
  provider: "SendGrid",
  apiKey: "SG...",
  baseUrl: "https://api.sendgrid.com",
  isActive: true,
  isTestMode: false,
  config: {
    fromEmail: "noreply@nubiago.com",
    fromName: "NubiaGo"
  }
}
```

## Future Enhancements

- **API Analytics**: Usage statistics and performance metrics
- **Automated Testing**: Scheduled API health checks
- **Webhook Management**: Advanced webhook configuration
- **API Versioning**: Support for multiple API versions
- **Integration Templates**: Pre-configured templates for common services
- **Bulk Operations**: Import/export multiple configurations
- **Advanced Security**: Multi-factor authentication for API access
- **Monitoring Dashboard**: Real-time API status monitoring
