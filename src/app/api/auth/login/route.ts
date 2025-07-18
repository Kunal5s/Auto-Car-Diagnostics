
import { sign } from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dotenv from 'dotenv';

// Load environment variables directly from .env file
dotenv.config();

const JWT_SECRET = process.env.AUTH_SECRET || 'fallback-secret-for-local-dev-if-not-set';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('Admin credentials not configured on the server. Please check your .env file.');
    return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
  }

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    // User is authenticated
    const token = sign({ email }, JWT_SECRET, { expiresIn: '1d' });

    cookies().set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
      sameSite: 'lax',
    });

    return NextResponse.json({ message: 'Authentication successful' });
  } else {
    // Invalid credentials
    return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
  }
}
