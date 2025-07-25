import { NextRequest, NextResponse } from 'next/server';
import { deleteAssetById } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = verifyAdmin(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    try {
      const { id } = await params;
      const deleted = await deleteAssetById(id);

      if (!deleted) {
        return NextResponse.json(
          { error: 'Asset not found or could not be deleted' },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: 'Asset deleted successfully' });
    } catch (error) {
      console.error('Delete asset error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  } catch (error) {
    console.error('Delete asset error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
