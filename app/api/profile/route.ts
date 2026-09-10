import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { UserProfile } from '@/types';

export const dynamic = 'force-dynamic';

// GET user profile by UID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'UID is required' }, { status: 400 });
    }

    const docSnap = await adminDb.collection('profiles').doc(uid).get();
    if (!docSnap.exists) {
      return NextResponse.json({ profile: null }, { status: 404 });
    }

    return NextResponse.json({ profile: docSnap.data() as UserProfile });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch profile' }, { status: 500 });
  }
}

// POST create user profile with atomic username reservation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, username, full_name, headline, bio, avatar_url, visibility } = body;

    if (!uid || !username || !full_name) {
      return NextResponse.json(
        { error: 'Missing required fields (uid, username, full_name)' },
        { status: 400 }
      );
    }

    const normalizedUsername = username.toLowerCase().trim();
    const usernameRef = adminDb.collection('usernames').doc(normalizedUsername);
    const profileRef = adminDb.collection('profiles').doc(uid);

    const now = new Date().toISOString();

    await adminDb.runTransaction(async (transaction) => {
      const usernameSnap = await transaction.get(usernameRef);
      if (usernameSnap.exists) {
        throw new Error('Username is already taken');
      }

      transaction.set(usernameRef, {
        uid,
        created_at: now,
      });

      transaction.set(profileRef, {
        uid,
        username: normalizedUsername,
        full_name: full_name.trim(),
        headline: headline || '',
        bio: bio || '',
        avatar_url: avatar_url || null,
        visibility: visibility || 'public',
        created_at: now,
        updated_at: now,
      });
    });

    const newProfileSnap = await profileRef.get();
    return NextResponse.json({ success: true, profile: newProfileSnap.data() as UserProfile });
  } catch (error: any) {
    console.error('Error creating profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create profile' },
      { status: 400 }
    );
  }
}

// PATCH update user profile
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, ...updates } = body;

    if (!uid) {
      return NextResponse.json({ error: 'UID is required for profile updates' }, { status: 400 });
    }

    const profileRef = adminDb.collection('profiles').doc(uid);
    const now = new Date().toISOString();

    await profileRef.update({
      ...updates,
      updated_at: now,
    });

    const updatedSnap = await profileRef.get();
    return NextResponse.json({ success: true, profile: updatedSnap.data() as UserProfile });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
