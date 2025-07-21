import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'admin_auth';
const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    jwt.verify(token, JWT_SECRET);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
