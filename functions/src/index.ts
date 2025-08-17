import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

admin.initializeApp();

// Simple API function for testing
export const helloWorld = functions
  .region('europe-west1')
  .https.onRequest((req, res) => {
    res.json({ message: "Hello from Firebase Functions!", timestamp: new Date().toISOString() });
  });

// Function to get user data
export const getUserData = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    // Check if user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
      const userId = context.auth.uid;
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'User not found');
      }

      return { userData: userDoc.data() };
    } catch (error) {
      throw new functions.https.HttpsError('internal', 'Error fetching user data');
    }
  });

// Function to process orders
export const processOrder = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
      const { orderData } = data;
      const userId = context.auth.uid;
      
      // Create order in Firestore
      const orderRef = await admin.firestore().collection('orders').add({
        ...orderData,
        userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'pending'
      });

      return { orderId: orderRef.id, message: 'Order created successfully' };
    } catch (error) {
      throw new functions.https.HttpsError('internal', 'Error processing order');
    }
  });