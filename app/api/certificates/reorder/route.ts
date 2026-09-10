import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { reorderCertificatesInMongo } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest) {
  try {
    const { items } = await request.json();

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'items must be an array of { id, sort_order }' }, { status: 400 });
    }

    try {
      await reorderCertificatesInMongo(items);
    } catch (mongoErr) {
      console.warn('Failed to reorder certificates in MongoDB:', mongoErr);
    }

    try {
      const batch = adminDb.batch();
      const now = new Date().toISOString();

      for (const item of items) {
        if (item.id && typeof item.sort_order === 'number') {
          const certRef = adminDb.collection('certificates').doc(item.id);
          batch.update(certRef, { sort_order: item.sort_order, updated_at: now });
        }
      }

      await batch.commit();
    } catch (fsErr) {
      console.warn('Failed to reorder certificates in Firestore:', fsErr);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error reordering certificates:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reorder certificates' },
      { status: 500 }
    );
  }
}

