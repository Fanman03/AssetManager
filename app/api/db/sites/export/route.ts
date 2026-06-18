import { NextResponse } from 'next/server';
import { getAllSites } from '@/lib/db';

export async function GET() {
  const sites = await getAllSites();
  const body = JSON.stringify(sites, null, 2);

  const filename = `sites-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
}
