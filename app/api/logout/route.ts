import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: 'admin_auth',
    value: '',
    path: '/',
    maxAge: 0, // delete immediately
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  });

  return response;
}
