// Client-side CSRF token implementation
import { NextRequest, NextResponse } from 'next/server';
import { ServerCrypto } from '../crypto/server';
import { ClientCrypto } from '../crypto/client';

// Get CSRF secret from environment variables
const CSRF_SECRET = process.env.CSRF_SECRET;
if (!CSRF_SECRET && typeof window === 'undefined' && process.env.NODE_ENV !== 'development') {
  console.warn('CSRF_SECRET environment variable is not set - some features may not work properly');
}

// Client-side only: Get public CSRF secret
const CLIENT_CSRF_SECRET = 
  typeof window !== 'undefined' 
    ? process.env.NEXT_PUBLIC_CSRF_SECRET || ''
    : '';

/**
 * Generates a CSRF token and its hash
 * @returns Object containing token and its hash
 */
export async function generateCSRFToken() {
  if (typeof window === 'undefined') {
    // Server-side
    const token = ServerCrypto.generateRandomString(32);
    const tokenHash = ServerCrypto.createCSRFToken(CSRF_SECRET!, token);
    return { token, tokenHash };
  } else {
    // Client-side
    const token = await ClientCrypto.generateCSRFToken();
    const tokenHash = await ClientCrypto.createCSRFToken(CLIENT_CSRF_SECRET, token);
    return { token, tokenHash };
  }
}

/**
 * Verifies a CSRF token against its hash
 * @param token The CSRF token to verify
 * @param tokenHash The expected hash of the token
 * @returns True if the token is valid, false otherwise
 */
export async function verifyCSRFToken(token: string, tokenHash: string): Promise<boolean> {
  if (typeof window === 'undefined') {
    // Server-side verification
    return ServerCrypto.verifyCSRFToken(CSRF_SECRET!, token, tokenHash);
  } else {
    // Client-side verification (less secure, should be verified server-side as well)
    return ClientCrypto.verifyCSRFToken(CLIENT_CSRF_SECRET, token, tokenHash);
  }
}

/**
 * Middleware to validate CSRF tokens in API routes
 * @param req The Next.js request object
 * @returns NextResponse with error if validation fails, or void if validation passes
 */
export async function validateCSRFToken(req: NextRequest): Promise<NextResponse | void> {
  // Skip CSRF check for safe HTTP methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return;
  }

  try {
    // Get token from headers or body
    let token = req.headers.get('x-csrf-token');
    let tokenHash = req.headers.get('x-csrf-token-hash');

    // If not in headers, try to get from body for form submissions
    if ((!token || !tokenHash) && req.headers.get('content-type')?.includes('application/json')) {
      try {
        const body = await req.clone().json().catch(() => ({}));
        token = body._csrf || token;
        tokenHash = body._csrfHash || tokenHash;
      } catch (e) {
        // Couldn't parse JSON body, continue with token from headers
      }
    }

    // Validate token and hash
    if (!token || !tokenHash) {
      return new NextResponse(
        JSON.stringify({ error: 'CSRF token and hash are required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify the token
    const isValid = await verifyCSRFToken(token, tokenHash);
    if (!isValid) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid CSRF token' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('CSRF validation error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to validate CSRF token' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Adds CSRF tokens to a NextResponse
 * @param response The NextResponse object
 * @param token The CSRF token
 * @param tokenHash The CSRF token hash
 * @returns The modified NextResponse with CSRF headers
 */
export function addCSRFTokenToResponse(
  response: NextResponse,
  token: string,
  tokenHash: string
): NextResponse {
  // Add CSRF token to response headers
  response.headers.set('x-csrf-token', token);
  response.headers.set('x-csrf-token-hash', tokenHash);
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

// Server-side only functions
export const getSessionTokenFromRequest = (request: Request): string | null => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  
  const [scheme, token] = authHeader.split(' ');
  return scheme.toLowerCase() === 'bearer' ? token : null;
};

export const getCSRFTokenFromRequest = async (request: Request): Promise<string | null> => {
  // Try to get token from header first
  const token = request.headers.get('x-csrf-token');
  if (token) return token;
  
  // Try to get from form data if it's a POST request
  if (request.method === 'POST') {
    try {
      const formData = await request.formData();
      const formToken = formData.get('csrf_token') as string | null;
      if (formToken) return formToken;
    } catch (error) {
      console.error('Error parsing form data:', error);
    }
  }
  
  return null;
};

export const CSRFProtection = (handler: Function) => {
  return async (request: Request) => {
    if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'OPTIONS') {
      return handler(request);
    }
    
    const token = await getCSRFTokenFromRequest(request);
    const sessionToken = getSessionTokenFromRequest(request);
    
    if (!token || !sessionToken) {
      return new Response(
        JSON.stringify({ error: 'CSRF token or session token missing' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify the token
    const expectedToken = await generateCSRFToken();
    if (!verifyCSRFToken(token, expectedToken.tokenHash)) {
      return new Response(
        JSON.stringify({ error: 'Invalid CSRF token' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return handler(request);
  };
};
