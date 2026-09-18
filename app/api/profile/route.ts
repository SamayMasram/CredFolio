import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { UserProfile } from '@/types';
import {
  getProfileFromMongo,
  storeProfileInMongo,
  updateProfileInMongo,
} from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// GET user profile by UID or Username
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid') || searchParams.get('username');

    if (!uid) {
      return NextResponse.json({ error: 'UID or username is required' }, { status: 400 });
    }

    // 1. Try MongoDB first (primary storage)
    try {
      const mongoProfile = await getProfileFromMongo(uid);
      if (mongoProfile) {
        return NextResponse.json({ profile: mongoProfile });
      }
    } catch (mongoErr) {
      console.warn('MongoDB profile lookup warning:', mongoErr);
    }

    // 2. Fallback to Firestore (secondary backup)
    try {
      const docSnap = await adminDb.collection('profiles').doc(uid).get();
      if (docSnap.exists) {
        const fsProfile = docSnap.data() as UserProfile;
        // Cache to MongoDB for future requests
        try {
          await storeProfileInMongo(fsProfile);
        } catch {}
        return NextResponse.json({ profile: fsProfile });
      }
    } catch (fsErr) {
      console.warn('Firestore profile lookup warning:', fsErr);
    }

    return NextResponse.json({ profile: null }, { status: 404 });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch profile' }, { status: 500 });
  }
}

// POST create user profile
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
    const now = new Date().toISOString();

    // 1. Save to MongoDB (primary storage)
    const savedProfile = await storeProfileInMongo({
      uid,
      username: normalizedUsername,
      full_name: full_name.trim(),
      headline: headline || '',
      bio: bio || '',
      avatar_url: avatar_url || null,
      visibility: visibility || 'public',
    });

    // 2. Best-effort Firestore sync (secondary backup)
    try {
      const usernameRef = adminDb.collection('usernames').doc(normalizedUsername);
      const profileRef = adminDb.collection('profiles').doc(uid);

      await adminDb.runTransaction(async (transaction) => {
        transaction.set(usernameRef, { uid, created_at: now });
        transaction.set(profileRef, {
          ...savedProfile,
          updated_at: now,
        });
      });
    } catch (fsErr) {
      console.warn('Failed to sync profile to Firestore (MongoDB copy saved successfully):', fsErr);
    }

    return NextResponse.json({ success: true, profile: savedProfile });
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

    // 1. Update in MongoDB (primary storage)
    const updatedProfile = await updateProfileInMongo(uid, updates);

    // 2. Best-effort Firestore sync (secondary backup)
    try {
      const profileRef = adminDb.collection('profiles').doc(uid);
      const now = new Date().toISOString();
      await profileRef.set(
        {
          ...updates,
          updated_at: now,
        },
        { merge: true }
      );

      // If username changed, update username mapping in Firestore
      if (updates.username) {
        const usernameRef = adminDb.collection('usernames').doc(updates.username.toLowerCase().trim());
        await usernameRef.set({ uid, updated_at: now }, { merge: true });
      }
    } catch (fsErr) {
      console.warn('Failed to sync profile update to Firestore (MongoDB copy saved successfully):', fsErr);
    }

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}

