import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { deleteAssetById } from '@/lib/db';

const COOKIE_NAME = 'admin_auth'; // Use your actual cookie name where JWT is stored
const JWT_SECRET = process.env.JWT_SECRET!;

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Parse cookies from header
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(cookie => {
        const [key, ...v] = cookie.split('=');
        return [key, decodeURIComponent(v.join('='))];
      })
    );

    const token = cookies[COOKIE_NAME];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token' }, { status: 401 });
    }

    try {
      // Verify JWT token
      jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // Proceed with deletion
    const deleted = await deleteAssetById(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Asset not found or could not be deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Asset deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete asset error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
