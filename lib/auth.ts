import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'admin_auth';
const JWT_SECRET = process.env.JWT_SECRET!;

export function verifyAdmin(req: NextRequest) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return { ok: false as const, status: 401, error: 'Not authenticated' };

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        return { ok: true as const, payload };
    } catch {
        return { ok: false as const, status: 401, error: 'Invalid token' };
    }
}
