// Test environment configuration
process.env.NODE_ENV = 'test';

// Application URLs
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api';

// YellowCard API Configuration
process.env.NEXT_PUBLIC_YELLOWCARD_API_URL = 'https://api.yellowcard.io/v1';
process.env.YELLOWCARD_API_KEY = 'test-api-key-12345';
process.env.YELLOWCARD_API_SECRET = 'test-api-secret-67890';
process.env.YELLOWCARD_MERCHANT_ID = 'test-merchant-123';
process.env.YELLOWCARD_WEBHOOK_SECRET = 'test-webhook-secret-456';
process.env.YELLOWCARD_DEBUG = 'true';
process.env.YELLOWCARD_FEE_PERCENTAGE = '1.5';
process.env.YELLOWCARD_FIXED_FEE = '100';

// Firebase Test Configuration
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-firebase-api-key';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test-project.firebaseapp.com';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project-id';
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test-bucket.appspot.com';
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '1234567890';
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = '1:1234567890:web:abc123def456';
process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = 'G-ABCDEF1234';

// Test Database Configuration
process.env.FIREBASE_DATABASE_EMULATOR_HOST = 'localhost:9000';
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // Remove next/image specific props that might cause warnings
    const { width, height, placeholder, blurDataURL, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...rest} />;
  },
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    getAll: jest.fn(),
  }),
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: {
      uid: 'test-user-123',
      email: 'test@example.com',
      getIdToken: jest.fn(() => Promise.resolve('test-id-token')),
    },
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
  })),
}));

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => {
  const originalModule = jest.requireActual('firebase/firestore');
  return {
    ...originalModule,
    getFirestore: jest.fn(),
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
    serverTimestamp: jest.fn(() => 'MOCK_TIMESTAMP'),
  };
});

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset any environment variables that might be modified during tests
  process.env = { ...process.env };
});

afterEach(() => {
  // Cleanup after each test
  jest.restoreAllMocks();
});
