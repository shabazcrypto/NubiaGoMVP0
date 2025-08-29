import * as admin from 'firebase-admin';

// Helper function to validate service account
function validateServiceAccount(serviceAccount: any): boolean {
  const requiredFields = [
    'type', 'project_id', 'private_key_id', 'private_key', 
    'client_email', 'client_id', 'auth_uri', 'token_uri'
  ];
  
  return requiredFields.every(field => {
    const value = serviceAccount[field];
    return value && typeof value === 'string' && value.trim().length > 0;
  });
}

// Initialize Firebase Admin if it hasn't been initialized yet
if (!admin.apps.length) {
  try {
    const serviceAccount = {
      type: process.env.FIREBASE_ADMIN_TYPE || 'service_account',
      project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
      private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
      auth_uri: process.env.FIREBASE_ADMIN_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
      token_uri: process.env.FIREBASE_ADMIN_TOKEN_URI || 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: process.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL,
      universe_domain: process.env.FIREBASE_ADMIN_UNIVERSE_DOMAIN || 'googleapis.com'
    };

    // Only initialize if we have valid configuration
    if (validateServiceAccount(serviceAccount)) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
      });
    } else {
      console.warn('Firebase Admin: Invalid or missing service account configuration. Some features may not work.');
    }
  } catch (error) {
    console.warn('Firebase Admin initialization failed:', error);
  }
}

// Safe getters that handle uninitialized state
export const db = admin.apps.length > 0 ? admin.firestore() : null;
export const auth = admin.apps.length > 0 ? admin.auth() : null;

// Export a function to initialize Firebase Admin
export const initializeFirebaseAdmin = () => {
  if (!admin.apps.length) {
    try {
      const serviceAccount = {
        type: process.env.FIREBASE_ADMIN_TYPE || 'service_account',
        project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
        private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
        auth_uri: process.env.FIREBASE_ADMIN_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
        token_uri: process.env.FIREBASE_ADMIN_TOKEN_URI || 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: process.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/certs',
        client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL,
        universe_domain: process.env.FIREBASE_ADMIN_UNIVERSE_DOMAIN || 'googleapis.com'
      };

      if (validateServiceAccount(serviceAccount)) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
          databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
        });
        return { db: admin.firestore(), auth: admin.auth() };
      } else {
        console.warn('Firebase Admin: Invalid service account configuration');
        return { db: null, auth: null };
      }
    } catch (error) {
      console.warn('Firebase Admin initialization failed:', error);
      return { db: null, auth: null };
    }
  }
  return { db: admin.firestore(), auth: admin.auth() };
};
