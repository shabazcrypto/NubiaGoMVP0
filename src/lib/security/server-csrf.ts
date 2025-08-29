// This is a server-only module that contains Node.js specific implementations
import { generateCSRFToken, verifyCSRFToken } from './csrf';

// Server-side CSRF functions
export const serverCSRF = {
  generateCSRFToken: async () => {
    return await generateCSRFToken();
  },
  createCSRFHash: async (secret: string, token: string) => {
    // Use the existing verifyCSRFToken logic but return hash creation
    const { tokenHash } = await generateCSRFToken();
    return tokenHash;
  },
  verifyCSRFToken: async (secret: string, token: string, hash: string) => {
    return await verifyCSRFToken(token, hash);
  }
};

export const generateCSRFTokenServer = serverCSRF.generateCSRFToken;
export const createCSRFHash = serverCSRF.createCSRFHash;

// This ensures this module is only used on the server side
if (typeof window !== 'undefined') {
  throw new Error('This module can only be used on the server side');
}
