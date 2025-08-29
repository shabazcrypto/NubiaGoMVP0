// This is a server-only module that contains Node.js specific implementations
import { serverCSRF } from './csrf';

export const generateCSRFToken = serverCSRF.generateCSRFToken;
export const createCSRFHash = serverCSRF.createCSRFHash;

// This ensures this module is only used on the server side
if (typeof window !== 'undefined') {
  throw new Error('This module can only be used on the server side');
}
