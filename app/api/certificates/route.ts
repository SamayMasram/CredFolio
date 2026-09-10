import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { Certificate } from '@/types';
import { storeCertificateInMongo, getCertificatesFromMongo } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// GET certificates for a given profile_id
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profile_id');

    if (!profileId) {
      return NextResponse.json({ error: 'profile_id parameter is required' }, { status: 400 });
    }

    const candidateIds = new Set<string>();
    candidateIds.add(profileId);
    candidateIds.add(profileId.replace(/^uid-/, ''));
    candidateIds.add(`uid-${profileId.replace(/^uid-/, '')}`);

    const certMap = new Map<string, Certificate>();

    for (const searchId of candidateIds) {
      // 1. Try fetching from MongoDB
      try {
        const mongoCerts = await getCertificatesFromMongo(searchId);
        mongoCerts.forEach((c) => certMap.set(c.id, c));
      } catch (mongoErr) {
        console.warn('Failed to fetch certificates from MongoDB:', mongoErr);
      }

      // 2. Try fetching from Firestore
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
      } catch (firestoreErr) {
        console.warn('Failed to fetch certificates from Firestore:', firestoreErr);
      }
    }

    const certificates = Array.from(certMap.values());
    certificates.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    const response = NextResponse.json({ certificates });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error: any) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch certificates' }, { status: 500 });
  }
}

// POST create certificate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      profile_id,
      title,
      issuer,
      issue_date,
      expiry_date,
      credential_url,
      file_url,
      type,
      category,
      is_featured,
      sort_order,
    } = body;

    if (!profile_id || !title || !issuer || !issue_date) {
      return NextResponse.json(
        { error: 'Missing required certificate fields (profile_id, title, issuer, issue_date)' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const certPayload: Partial<Certificate> = {
      profile_id,
      title: title.trim(),
      issuer: issuer.trim(),
      issue_date,
      expiry_date: expiry_date || null,
      credential_url: credential_url || null,
      file_url: file_url || null,
      type: type || 'certificate',
      category: category || 'Other',
      is_featured: is_featured || false,
      sort_order: typeof sort_order === 'number' ? sort_order : 0,
      created_at: now,
      updated_at: now,
    };

    let createdCert: Certificate;

    // Save to MongoDB
    try {
      createdCert = await storeCertificateInMongo(certPayload);
    } catch (mongoErr) {
      console.warn('Failed to store certificate in MongoDB:', mongoErr);
      const newCertRef = adminDb.collection('certificates').doc();
      createdCert = { id: newCertRef.id, ...certPayload } as Certificate;
    }

    // Also sync to Firestore
    try {
      const docRef = adminDb.collection('certificates').doc(createdCert.id);
      await docRef.set({
        ...certPayload,
        id: createdCert.id,
      });
    } catch (fsErr) {
      console.warn('Failed to sync certificate to Firestore:', fsErr);
    }

    return NextResponse.json({
      success: true,
      certificate: createdCert,
    });
  } catch (error: any) {
    console.error('Error creating certificate:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create certificate' },
      { status: 500 }
    );
  }
}

