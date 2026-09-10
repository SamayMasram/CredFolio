import * as admin from 'firebase-admin';

function getFormattedPrivateKey(): string | undefined {
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!rawKey) return undefined;

  let key = rawKey.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.substring(1, key.length - 1);
  }
  return key.replace(/\\n/g, '\n');
}

if (!admin.apps.length) {
  const privateKey = getFormattedPrivateKey();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'new-prototype-uc9lw';

  let initialized = false;

  if (clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
      initialized = true;
    } catch (err) {
      console.warn('Failed to initialize Firebase Admin with service account cert, falling back:', err);
    }
  }

  if (!initialized) {
    admin.initializeApp({
      projectId,
    });
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
