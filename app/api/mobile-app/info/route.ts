import { NextResponse } from 'next/server';

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME!;
const VERSION = process.env.version;

export async function GET() {
    return NextResponse.json({ isAppCompatible: true, appName: APP_NAME, version: VERSION });
}
