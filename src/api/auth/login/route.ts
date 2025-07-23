import { sign } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-local-dev-if-not-set';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('Admin credentials not configured on the server.');
    return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
  }

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = sign({ email }, JWT_SECRET, { expiresIn: '1d' });

    const response = NextResponse.json({ success: true });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } else {
    return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
  }
}
