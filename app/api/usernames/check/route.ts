import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { checkUsernameAvailabilityInMongo } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username')?.toLowerCase().trim();
    const uid = searchParams.get('uid') || undefined;

    if (!username || username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters long', available: false },
        { status: 400 }
      );
    }

    // 1. Check MongoDB (primary storage)
    let available = true;
    try {
      available = await checkUsernameAvailabilityInMongo(username, uid);
    } catch (mongoErr) {
      console.warn('MongoDB username check warning:', mongoErr);
    }

    if (!available) {
      return NextResponse.json({ username, available: false });
    }

    // 2. Also check Firestore (secondary backup)
    try {
      const usernameDoc = await adminDb.collection('usernames').doc(username).get();
      if (usernameDoc.exists) {
        const data = usernameDoc.data();
        if (!uid || data?.uid !== uid) {
          available = false;
        }
      }
    } catch {
      // Ignore Firestore failure if service is unconfigured
    }

    return NextResponse.json({ username, available });
  } catch (error: any) {
    console.error('Error checking username availability:', error);
    return NextResponse.json({ username: request.nextUrl.searchParams.get('username'), available: true });
  }
}
