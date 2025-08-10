import { NextResponse } from 'next/server';
import { exportAllAssets } from '@/lib/db';

// Small helper to escape CSV fields
function escapeCsvField(field: unknown): string {
  if (field === null || field === undefined) return '';
  const str = String(field);
  // If the field contains commas, quotes, or newlines, wrap it in quotes and escape quotes
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const assets = await exportAllAssets();

  if (!assets.length) {
    return new NextResponse('No data', { status: 204 });
  }

  // Get all unique keys across all assets to ensure all columns are exported
  const columns = Array.from(
    new Set(assets.flatMap(obj => Object.keys(obj)))
  );

  // Build CSV
  const header = columns.join(',');
  const rows = assets.map(asset =>
    columns.map(col => escapeCsvField(asset[col as keyof typeof asset])).join(',')
  );
  const csv = [header, ...rows].join('\n');

  const filename = `assets-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
}
