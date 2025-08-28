import { NextRequest } from 'next/server';
import crypto from 'crypto';

/**
 * Creates a mock NextRequest with the specified method, URL, headers, and body
 */
export const createMockRequest = ({
  method = 'GET',
  url = 'http://localhost',
  headers = {},
  body = null,
  searchParams = {},
}: {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: any;
  searchParams?: Record<string, string>;
} = {}): NextRequest => {
  // Add search params to URL if provided
  const urlObj = new URL(url);
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.append(key, value);
  });

  return new NextRequest(urlObj.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : null,
  });
};

/**
 * Creates a signed request for testing webhooks
 */
export const createSignedRequest = ({
  body,
  secret = process.env.YELLOWCARD_WEBHOOK_SECRET || 'test-secret',
  timestamp = Date.now(),
  path = '/api/yellowcard/webhook',
}: {
  body: any;
  secret?: string;
  timestamp?: number;
  path?: string;
}) => {
  const payload = JSON.stringify(body);
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}${payload}`)
    .digest('hex');

  return createMockRequest({
    method: 'POST',
    url: `http://localhost${path}`,
    headers: {
      'x-yellowcard-signature': signature,
      'x-yellowcard-timestamp': timestamp.toString(),
    },
    body,
  });
};

/**
 * Mocks a Firebase Firestore document
 */
export const mockFirestoreDoc = (data: any, exists = true) => ({
  exists: jest.fn().mockReturnValue(exists),
  data: jest.fn().mockReturnValue(data),
  id: data?.id || 'test-doc-id',
});

/**
 * Mocks a Firebase Firestore query snapshot
 */
export const mockQuerySnapshot = (docs: any[]) => ({
  docs: docs.map((doc) => ({
    id: doc.id || 'test-doc-id',
    data: () => doc,
  })),
  empty: docs.length === 0,
  size: docs.length,
  forEach: jest.fn((callback) => {
    docs.forEach((doc) =>
      callback({
        id: doc.id || 'test-doc-id',
        data: () => doc,
      })
    );
  }),
});

/**
 * Mocks a successful API response
 */
export const mockApiResponse = <T = any>(
  data: T,
  status = 200,
  statusText = 'OK'
) => ({
  ok: status >= 200 && status < 300,
  status,
  statusText,
  json: jest.fn().mockResolvedValue(data),
  text: jest.fn().mockResolvedValue(JSON.stringify(data)),
  clone: jest.fn().mockReturnThis(),
});

/**
 * Mocks a failed API response
 */
export const mockApiError = (status: number, error: string) =>
  mockApiResponse({ error }, status, 'Error');

/**
 * Sets up environment variables for testing
 */
export const setupTestEnv = () => {
  process.env.NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  process.env.NEXT_PUBLIC_YELLOWCARD_API_URL = 'https://api.yellowcard.io/v1';
  process.env.YELLOWCARD_API_KEY = 'test-api-key';
  process.env.YELLOWCARD_API_SECRET = 'test-api-secret';
  process.env.YELLOWCARD_MERCHANT_ID = 'test-merchant-id';
  process.env.YELLOWCARD_WEBHOOK_SECRET = 'test-webhook-secret';
  process.env.YELLOWCARD_DEBUG = 'true';
  process.env.YELLOWCARD_FEE_PERCENTAGE = '1.5';
  process.env.YELLOWCARD_FIXED_FEE = '100';
};

/**
 * Mocks the Firebase Admin Auth verifyIdToken function
 */
export const mockFirebaseAuth = (userId = 'test-user-123') => {
  const mockVerifyIdToken = jest.fn().mockResolvedValue({ uid: userId });
  
  jest.mock('firebase-admin/auth', () => ({
    getAuth: () => ({
      verifyIdToken: mockVerifyIdToken,
    }),
  }));

  return { mockVerifyIdToken };
};

/**
 * Mocks the global fetch function
 */
export const mockFetch = (response: any, status = 200) => {
  const mockJson = jest.fn().mockResolvedValue(response);
  const mockFetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: mockJson,
    text: jest.fn().mockResolvedValue(JSON.stringify(response)),
    clone: jest.fn().mockReturnThis(),
  });

  global.fetch = mockFetch as any;
  
  return { mockFetch, mockJson };
};

/**
 * Waits for all promises to resolve
 */
export const flushPromises = () =>
  new Promise((resolve) => setImmediate(resolve));

import { jest } from '@jest/globals';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

type MockFirebaseConfig = {
  app?: Partial<FirebaseApp>;
  auth?: Partial<Auth>;
  firestore?: Partial<Firestore>;
};

/**
 * Mocks Firebase services for testing
 */
export const mockFirebase = (config: MockFirebaseConfig = {}) => {
  // Mock Firebase App
  const mockApp = {
    name: '[DEFAULT]',
    options: {},
    automaticDataCollectionEnabled: false,
    ...config.app,
  } as FirebaseApp;

  // Mock Auth
  const mockAuth = {
    currentUser: null,
    languageCode: 'en',
    settings: { appVerificationDisabledForTesting: false },
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    confirmPasswordReset: jest.fn(),
    applyActionCode: jest.fn(),
    ...config.auth,
  };

  // Mock Firestore
  const mockFirestore = {
    collection: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    getDocs: jest.fn(),
    addDoc: jest.fn(),
    ...config.firestore,
  };

  // Set up the mocks
  jest.mocked(initializeApp).mockReturnValue(mockApp);
  jest.mocked(getApps).mockReturnValue([mockApp]);
  jest.mocked(getApp).mockReturnValue(mockApp);
  jest.mocked(getAuth).mockReturnValue(mockAuth as unknown as Auth);
  jest.mocked(getFirestore).mockReturnValue(mockFirestore as unknown as Firestore);

  return {
    app: mockApp,
    auth: mockAuth,
    firestore: mockFirestore,
  };
};

/**
 * Waits for all promises to resolve
 */
export const flushPromises = () => new Promise(setImmediate);

/**
 * Mocks the fetch API with a response
 */
export const mockFetchResponse = (response: any, options: ResponseInit = {}) => {
  const mockResponse = {
    ok: true,
    status: 200,
    json: () => Promise.resolve(response),
    text: () => Promise.resolve(JSON.stringify(response)),
    ...options,
  };
  
  global.fetch = jest.fn().mockResolvedValue(mockResponse);
  return mockResponse;
};

/**
 * Mocks the fetch API with an error
 */
export const mockFetchError = (error: Error) => {
  global.fetch = jest.fn().mockRejectedValue(error);
};

/**
 * Creates a mock context for API routes
 */
export const createMockContext = (overrides: any = {}) => ({
  req: {
    method: 'GET',
    headers: {},
    ...overrides.req,
  },
  res: {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
    end: jest.fn(),
    ...overrides.res,
  },
  ...overrides,
});

/**
 * Creates a mock Next.js API request
 */
export const createMockRequest = (overrides: any = {}) => ({
  method: 'GET',
  headers: {},
  query: {},
  body: null,
  ...overrides,
});

/**
 * Creates a mock Next.js API response
 */
export const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * Waits for a component to update
 */
export const waitForUpdate = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
};

// Re-export testing-library utilities
export * from '@testing-library/react';
export { renderHook } from '@testing-library/react-hooks';
export { default as userEvent } from '@testing-library/user-event';

// Custom matchers
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeValidEmail(): R;
      toBeInTheDocument(): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toHaveTextContent(text: string | RegExp): R;
    }
  }
}

// Add custom matchers
expect.extend({
  toBeValidEmail(received) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid email`,
      pass,
    };
  },
});

// Test data factories
export const createTestUser = (overrides = {}) => ({
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  phoneNumber: '+1234567890',
  photoURL: 'https://example.com/photo.jpg',
  metadata: {
    creationTime: '2023-01-01T00:00:00Z',
    lastSignInTime: '2023-01-01T00:00:00Z',
  },
  ...overrides,
});

export const createTestProduct = (overrides = {}) => ({
  id: 'test-product-123',
  name: 'Test Product',
  description: 'A test product',
  price: 99.99,
  currency: 'USD',
  sku: 'TEST-123',
  stock: 10,
  images: ['https://example.com/product.jpg'],
  category: 'test-category',
  tags: ['test', 'example'],
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  ...overrides,
});

export const createTestOrder = (overrides = {}) => ({
  id: 'test-order-123',
  userId: 'test-user-123',
  status: 'pending',
  items: [
    {
      productId: 'test-product-123',
      quantity: 1,
      price: 99.99,
      name: 'Test Product',
    },
  ],
  subtotal: 99.99,
  tax: 9.99,
  shipping: 0,
  total: 109.98,
  shippingAddress: {
    name: 'Test User',
    line1: '123 Test St',
    line2: 'Apt 4B',
    city: 'Test City',
    state: 'Test State',
    postalCode: '12345',
    country: 'US',
  },
  paymentMethod: 'credit_card',
  paymentStatus: 'pending',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  ...overrides,
});

// Export all test data factories
export const testData = {
  user: createTestUser,
  product: createTestProduct,
  order: createTestOrder,
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
