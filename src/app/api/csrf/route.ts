import { NextResponse } from 'next/server';
import { ServerCrypto } from '@/lib/crypto/server';

// This is a server-side only module
if (typeof window !== 'undefined') {
  throw new Error('This module can only be used on the server side');
}

// Get CSRF secret from environment variables
const CSRF_SECRET = process.env.CSRF_SECRET;
if (!CSRF_SECRET && process.env.NODE_ENV !== 'development') {
  console.warn('CSRF_SECRET environment variable is not set - CSRF protection disabled');
}

/**
 * GET /api/csrf
 * Generates a new CSRF token and returns it along with its hash
 */
export async function GET() {
  try {
    if (!CSRF_SECRET) {
      return NextResponse.json(
        { error: 'CSRF protection not configured' },
        { status: 503 }
      );
    }

    const token = ServerCrypto.generateRandomString(32);
    const tokenHash = ServerCrypto.createCSRFToken(CSRF_SECRET, token);

    return NextResponse.json({
      token,
      tokenHash,
    }, {
      headers: {
        'Cache-Control': 'no-store',
        'Pragma': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/csrf/verify
 * Verifies a CSRF token
 */
export async function POST(request: Request) {
  try {
    if (!CSRF_SECRET) {
      return NextResponse.json(
        { error: 'CSRF protection not configured' },
        { status: 503 }
      );
    }

    const { token, tokenHash } = await request.json();

    if (!token || !tokenHash) {
      return NextResponse.json(
        { error: 'Token and tokenHash are required' },
        { status: 400 }
      );
    }

    const isValid = ServerCrypto.verifyCSRFToken(CSRF_SECRET, token, tokenHash);

    return NextResponse.json({
      valid: isValid,
    });
  } catch (error) {
    console.error('Error verifying CSRF token:', error);
    return NextResponse.json(
      { error: 'Failed to verify CSRF token' },
      { status: 500 }
    );
  }
}
