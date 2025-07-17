
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  // Clear the authentication cookie
  cookies().set('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0), // Set expiry date to the past
    path: '/',
    sameSite: 'lax',
  });

  return NextResponse.json({ message: 'Logout successful' });
}
