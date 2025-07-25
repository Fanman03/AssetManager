import { NextResponse } from 'next/server';
import { connectToDb, getDatabaseStatus } from '@/lib/db';

export async function GET() {
    // try to connect once so the status is accurate
    await connectToDb();
    return NextResponse.json(getDatabaseStatus());
}