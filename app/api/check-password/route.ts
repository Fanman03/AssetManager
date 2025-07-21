import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// JWT secret — store securely
const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = 'admin_auth';
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || '').trim();

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (!password) {
    return NextResponse.json({ error: 'Password is required' }, { status: 400 });
  }

  if (password.trim() === ADMIN_PASSWORD) {
    // Create JWT payload
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });

    // Return cookie with token
    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: 'lax',
    });

    return response;
  }

  return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
}
