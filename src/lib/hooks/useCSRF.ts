import { useState, useEffect, useCallback } from 'react';
import { ClientCrypto } from '@/lib/crypto/client';

interface CSRFToken {
  token: string;
  tokenHash: string;
}

/**
 * Hook for managing CSRF tokens in the browser
 * Automatically fetches and stores CSRF tokens
 */
export function useCSRF() {
  const [token, setToken] = useState<string | null>(null);
  const [tokenHash, setTokenHash] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch a new CSRF token from the server
  const fetchCSRFToken = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/csrf', {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }

      const { token, tokenHash } = await response.json();
      setToken(token);
      setTokenHash(tokenHash);
      
      return { token, tokenHash };
    } catch (err) {
      console.error('Error fetching CSRF token:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch CSRF token'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Verify a CSRF token against its hash
  const verifyCSRFToken = useCallback(async (token: string, tokenHash: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/csrf/verify', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, tokenHash }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify CSRF token');
      }

      const { valid } = await response.json();
      return valid;
    } catch (err) {
      console.error('Error verifying CSRF token:', err);
      return false;
    }
  }, []);

  // Generate a new CSRF token on component mount
  useEffect(() => {
    fetchCSRFToken().catch(console.error);
  }, [fetchCSRFToken]);

  // Create a function to generate a CSRF token on the client side
  const generateClientCSRFToken = useCallback(async (): Promise<CSRFToken> => {
    const token = await ClientCrypto.generateCSRFToken();
    const tokenHash = await ClientCrypto.createCSRFToken(process.env.NEXT_PUBLIC_CSRF_SECRET || '', token);
    return { token, tokenHash };
  }, []);

  return {
    token,
    tokenHash,
    loading,
    error,
    fetchCSRFToken,
    verifyCSRFToken,
    generateClientCSRFToken,
  };
}
