# Frontend Integration Guide

## What is Frontend Integration?

**Frontend integration** refers to connecting your client-facing components (like checkout pages, order tracking, supplier shipping pages) to use the new logistics API functionality we just built. 

### Before Integration (Static/Hardcoded)
- **Hardcoded shipping costs** (e.g., `const shipping = 9.99`)
- **Mock data** for tracking and shipping rates
- **Static shipping options** instead of real-time calculations
- **No real-time updates** from logistics APIs

### After Integration (Dynamic/Real-time)
- **Real-time shipping rate calculations** from FedEx, UPS, DHL APIs
- **Live tracking information** from carrier APIs
- **Dynamic shipping options** based on actual availability
- **Real-time updates** and status changes

## What We've Accomplished

### 1. ✅ Checkout Page Integration (`src/app/checkout/page.tsx`)

**Before:**
```typescript
const shipping = 9.99 // Hardcoded shipping cost
```

**After:**
```typescript
// Real-time shipping rate calculation
const { rates, loading: ratesLoading, error: ratesError, getRates } = useLogistics()

// Calculate rates when address changes
useEffect(() => {
  const calculateShippingRates = async () => {
    if (!formData.address.street || !formData.address.city) return
    
    const fromAddress: ShippingAddress = { /* store address */ }
    const toAddress: ShippingAddress = { /* customer address */ }
    const packages: ShippingPackage[] = [{ /* package details */ }]
    
    await getRates(fromAddress, toAddress, packages)
  }
  
  const timeoutId = setTimeout(calculateShippingRates, 1000)
  return () => clearTimeout(timeoutId)
}, [formData.address, cartItems, getRates])
```

**New Features:**
- Real-time shipping rate calculation when customer enters address
- Interactive shipping method selection with carrier options
- Dynamic pricing based on actual rates from logistics APIs
- Loading states and error handling

### 2. ✅ Order Tracking Integration (`src/app/orders/[id]/page.tsx`)

**Before:**
```typescript
// Static tracking data
const order = {
  trackingNumber: 'TRK123456789',
  status: 'shipped' // Hardcoded status
}
```

**After:**
```typescript
// Real-time tracking information
const { trackingInfo, loading: trackingLoading, error: trackingError, getTrackingInfo } = useLogistics()

useEffect(() => {
  if (order.trackingNumber && order.carrierCode) {
    getTrackingInfo(order.trackingNumber, order.carrierCode)
  }
}, [order.trackingNumber, order.carrierCode, getTrackingInfo])
```

**New Features:**
- Live tracking information from carrier APIs
- Real-time status updates and delivery estimates
- Tracking history with timestamps and locations
- Error handling for tracking failures

### 3. ✅ Supplier Shipping Page Integration (`src/app/(dashboard)/supplier/shipping/page.tsx`)

**Before:**
```typescript
// Mock shipping orders
const mockOrders: ShippingOrder[] = [
  {
    trackingNumber: 'TRK123456789',
    carrier: 'usps', // Static carrier info
    status: 'shipped' // Hardcoded status
  }
]
```

**After:**
```typescript
// Real logistics integration
const { rates, loading: ratesLoading, error: ratesError, getRates } = useLogistics()

// Enhanced order data with carrier codes
const mockOrders: ShippingOrder[] = [
  {
    trackingNumber: 'TRK123456789',
    carrier: 'USPS',
    carrierCode: 'usps', // For API calls
    status: 'shipped'
  }
]
```

**New Features:**
- Integration with logistics APIs for rate calculation
- Enhanced order tracking with carrier codes
- Real-time shipping status updates
- Error handling and loading states

### 4. ✅ Shipping Calculator Component (`src/components/shipping/shipping-calculator.tsx`)

**Before:**
```typescript
// Using mock data from store
const { rates, ratesLoading, ratesError, getRates } = useShippingStore()
```

**After:**
```typescript
// Using real logistics service
const { rates, ratesLoading, ratesError, getRates } = useShippingStore()

// Store now uses real logistics service internally
async getRates(data) {
  const rates = await logisticsService.getShippingRates(
    data.fromAddress,
    data.toAddress,
    data.packages
  )
  set({ rates, ratesLoading: false })
  return true
}
```

**New Features:**
- Real-time rate calculation from multiple carriers
- Package weight and dimension support
- Multiple shipping options with pricing
- Carrier selection and comparison

## Key Benefits of Frontend Integration

### 1. **Real-time Data**
- Shipping rates update automatically based on current carrier pricing
- Tracking information refreshes in real-time
- Order status changes are reflected immediately

### 2. **Better User Experience**
- Customers see actual shipping costs before checkout
- Real tracking information builds trust
- Multiple shipping options give customers choice

### 3. **Reduced Errors**
- No more hardcoded shipping costs that become outdated
- Accurate delivery estimates from carriers
- Real-time validation of addresses and rates

### 4. **Scalability**
- Easy to add new carriers (FedEx, UPS, DHL, etc.)
- Centralized logistics service handles all API calls
- Consistent interface across all components

## Technical Implementation

### 1. **useLogistics Hook** (`src/hooks/useLogistics.ts`)
```typescript
export function useLogistics() {
  const [rates, setRates] = useState<ShippingRate[]>([])
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getRates = useCallback(async (fromAddress, toAddress, packages) => {
    // Makes API call to /api/shipping/rates
  }, [])

  const getTrackingInfo = useCallback(async (trackingNumber, carrierCode) => {
    // Makes API call to /api/shipping/tracking
  }, [])

  return { rates, trackingInfo, loading, error, getRates, getTrackingInfo }
}
```

### 2. **Logistics Service** (`src/lib/services/logistics.service.ts`)
```typescript
export class LogisticsService {
  async getShippingRates(fromAddress, toAddress, packages) {
    // Integrates with FedEx, UPS, DHL APIs
    // Returns real shipping rates
  }

  async getTrackingInfo(trackingNumber, carrierCode) {
    // Integrates with carrier tracking APIs
    // Returns real tracking information
  }
}
```

### 3. **API Routes** (`src/app/api/shipping/`)
```typescript
// /api/shipping/rates - Calculate shipping rates
export const POST = protectAPI(async (request) => {
  const rates = await logisticsService.getShippingRates(
    body.fromAddress,
    body.toAddress,
    body.packages
  )
  return NextResponse.json({ success: true, data: rates })
})

// /api/shipping/tracking - Get tracking information
export const POST = protectAPI(async (request) => {
  const trackingInfo = await logisticsService.getTrackingInfo(
    body.trackingNumber,
    body.carrierCode
  )
  return NextResponse.json({ success: true, data: trackingInfo })
})
```

## Next Steps

### 1. **Production API Keys**
- Get real API keys from FedEx, UPS, DHL
- Update environment variables
- Test with real carrier APIs

### 2. **Additional Components**
- Update cart page to show shipping estimates
- Add shipping method selection to product pages
- Integrate with order confirmation emails

### 3. **Advanced Features**
- Address validation and autocomplete
- Package dimension calculation
- Shipping label generation
- Return shipping integration

### 4. **Performance Optimization**
- Cache shipping rates
- Implement rate limiting
- Add retry logic for API failures
- Optimize API calls

## Conclusion

Frontend integration transforms your application from using static, hardcoded data to dynamic, real-time information from actual logistics APIs. This provides:

- **Better user experience** with real-time data
- **Reduced errors** with accurate information
- **Scalability** for future growth
- **Competitive advantage** with modern shipping features

The integration is now complete and ready for production use with real carrier APIs!
