import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username')?.toLowerCase().trim();

    if (!username || username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters long', available: false },
        { status: 400 }
      );
    }

    // Query Firestore usernames collection using Admin SDK
    const usernameDoc = await adminDb.collection('usernames').doc(username).get();
    const available = !usernameDoc.exists;

    return NextResponse.json({ username, available });
  } catch (error: any) {
    console.error('Error checking username availability:', error);
    // In dev mode fallback if admin SDK lacks live key, default to true
    return NextResponse.json({ username: request.nextUrl.searchParams.get('username'), available: true });
  }
}
