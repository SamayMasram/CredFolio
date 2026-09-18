import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { UserProfile, Certificate } from '@/types';
import { getCertificatesFromMongo, getProfileFromMongo, storeProfileInMongo } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const normalizedUsername = params.username.toLowerCase().trim();

    let uid = `uid-${normalizedUsername}`;
    let profile: UserProfile | null = null;

    // 1. Look up profile directly in MongoDB (primary storage)
    try {
      const mongoProfile = await getProfileFromMongo(normalizedUsername);
      if (mongoProfile) {
        profile = mongoProfile;
        uid = mongoProfile.uid;
      }
    } catch (mongoErr) {
      console.warn('MongoDB profile lookup warning in public route:', mongoErr);
    }

    // 2. Fallback: Look up username doc pointer and profile in Firestore
    if (!profile) {
      try {
        const usernameSnap = await adminDb.collection('usernames').doc(normalizedUsername).get();
        if (usernameSnap.exists) {
          uid = (usernameSnap.data() as { uid: string }).uid;
        }

        const profileSnap = await adminDb.collection('profiles').doc(uid).get();
        if (profileSnap.exists) {
          profile = profileSnap.data() as UserProfile;
          // Cache into MongoDB
          try {
            await storeProfileInMongo(profile);
          } catch {}
        }
      } catch (fsErr) {
        console.warn('Firestore fallback lookup warning:', fsErr);
      }
    }

    if (!profile) {
      const formattedName = normalizedUsername.charAt(0).toUpperCase() + normalizedUsername.slice(1);
      profile = {
        uid,
        username: normalizedUsername,
        full_name: formattedName,
        headline: 'Credential Showcase',
        bio: 'Welcome to my verified credential portfolio showcase.',
        visibility: 'public',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    // 3. Respect visibility rule
    if (profile.visibility === 'private') {
      return NextResponse.json({ profile: { ...profile, bio: '', headline: '' }, certificates: [], isPrivate: true });
    }

    // 4. Fetch public certificates from MongoDB & Firestore
    const certMap = new Map<string, Certificate>();
    const searchProfileIds = new Set<string>();
    if (uid) searchProfileIds.add(uid);
    if (profile?.uid) searchProfileIds.add(profile.uid);
    if (normalizedUsername) searchProfileIds.add(normalizedUsername);
    searchProfileIds.add(`uid-${normalizedUsername}`);

    for (const searchId of searchProfileIds) {
      try {
        const mongoCerts = await getCertificatesFromMongo(searchId);
        mongoCerts.forEach((c) => certMap.set(c.id, c));
      } catch (mongoErr) {
        console.warn('Failed to fetch profile certificates from MongoDB:', mongoErr);
      }

      try {
        const certsSnap = await adminDb
          .collection('certificates')
          .where('profile_id', '==', searchId)
          .get();

        certsSnap.forEach((doc) => {
          if (!certMap.has(doc.id)) {
            certMap.set(doc.id, { id: doc.id, ...doc.data() } as Certificate);
          }
        });
      } catch (fsCertsErr) {
        console.warn('Failed to fetch profile certificates from Firestore:', fsCertsErr);
      }
    }

    const certificates = Array.from(certMap.values());
    certificates.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    const response = NextResponse.json({ profile, certificates, isPrivate: false });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error: any) {
    console.error('Error loading public profile by username:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch public profile' },
      { status: 500 }
    );
  }
}

