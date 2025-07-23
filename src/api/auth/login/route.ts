import { sign } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-local-dev-if-not-set'; // Added fallback
const ADMIN_EMAIL = process.env.kunalsonpitre555@gmail.com;
const ADMIN_PASSWORD = process.env.12345678; // Changed ADMIN_PASS to ADMIN_PASSWORD for consistency

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) { // Added check for admin credentials
    console.error('Admin credentials not configured on the server.');
    return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
  }

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = sign({ email }, JWT_SECRET, { expiresIn: '1d' });

    const cookieStore = await cookies(); // Corrected import and variable name
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
      sameSite: 'lax', // Changed Lax to lax (lowercase)
    });

    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 }); // Added error message and status
  }
}