import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { Certificate } from '@/types';
import { updateCertificateInMongo, deleteCertificateFromMongo } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// PATCH update single certificate
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const certId = params.id;
    const updates = await request.json();

    if (!certId) {
      return NextResponse.json({ error: 'Certificate ID is required' }, { status: 400 });
    }

    let updatedCert: Certificate | null = null;

    // Update in MongoDB
    try {
      updatedCert = await updateCertificateInMongo(certId, updates);
    } catch (mongoErr) {
      console.warn('Failed to update certificate in MongoDB:', mongoErr);
    }

    // Update in Firestore
    try {
      const certRef = adminDb.collection('certificates').doc(certId);
      const now = new Date().toISOString();
      await certRef.update({
        ...updates,
        updated_at: now,
      });
      if (!updatedCert) {
        const updatedSnap = await certRef.get();
        updatedCert = { id: updatedSnap.id, ...updatedSnap.data() } as Certificate;
      }
    } catch (fsErr) {
      console.warn('Failed to update certificate in Firestore:', fsErr);
    }

    return NextResponse.json({
      success: true,
      certificate: updatedCert || { id: certId, ...updates },
    });
  } catch (error: any) {
    console.error('Error updating certificate:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update certificate' },
      { status: 500 }
    );
  }
}

// DELETE single certificate
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const certId = params.id;

    if (!certId) {
      return NextResponse.json({ error: 'Certificate ID is required' }, { status: 400 });
    }

    try {
      await deleteCertificateFromMongo(certId);
    } catch (mongoErr) {
      console.warn('Failed to delete certificate from MongoDB:', mongoErr);
    }

    try {
      await adminDb.collection('certificates').doc(certId).delete();
    } catch (fsErr) {
      console.warn('Failed to delete certificate from Firestore:', fsErr);
    }

    return NextResponse.json({ success: true, id: certId });
  } catch (error: any) {
    console.error('Error deleting certificate:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete certificate' },
      { status: 500 }
    );
  }
}

