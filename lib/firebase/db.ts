import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  orderBy,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './client';
import { UserProfile, Certificate } from '@/types';

// Check if a username is available
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const normalized = username.toLowerCase().trim();
  const usernameRef = doc(db, 'usernames', normalized);
  const snap = await getDoc(usernameRef);
  return !snap.exists();
}

// Reserve username and create user profile atomically
export async function createProfileWithUsername(
  uid: string,
  username: string,
  profileData: Partial<UserProfile>
): Promise<void> {
  const normalizedUsername = username.toLowerCase().trim();
  const usernameRef = doc(db, 'usernames', normalizedUsername);
  const profileRef = doc(db, 'profiles', uid);

  await runTransaction(db, async (transaction) => {
    const usernameSnap = await transaction.get(usernameRef);
    if (usernameSnap.exists()) {
      throw new Error('Username is already taken');
    }

    const now = new Date().toISOString();

    transaction.set(usernameRef, {
      uid,
      created_at: now,
    });

    transaction.set(profileRef, {
      uid,
      username: normalizedUsername,
      full_name: profileData.full_name || '',
      headline: profileData.headline || '',
      bio: profileData.bio || '',
      avatar_url: profileData.avatar_url || null,
      visibility: profileData.visibility || 'public',
      created_at: now,
      updated_at: now,
    });
  });
}

// Get User Profile by UID
export async function getProfileByUid(uid: string): Promise<UserProfile | null> {
  const profileRef = doc(db, 'profiles', uid);
  const snap = await getDoc(profileRef);
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

// Get User Profile by Username
export async function getProfileByUsername(username: string): Promise<UserProfile | null> {
  const normalized = username.toLowerCase().trim();
  const usernameRef = doc(db, 'usernames', normalized);
  const usernameSnap = await getDoc(usernameRef);
  if (!usernameSnap.exists()) return null;

  const uid = usernameSnap.data().uid;
  return getProfileByUid(uid);
}

// Get Certificates for a profile
export async function getCertificatesByProfileId(profileId: string): Promise<Certificate[]> {
  const certsRef = collection(db, 'certificates');
  const q = query(
    certsRef,
    where('profile_id', '==', profileId)
  );
  const querySnap = await getDocs(q);

  const certificates: Certificate[] = [];
  querySnap.forEach((docSnap) => {
    certificates.push({ id: docSnap.id, ...docSnap.data() } as Certificate);
  });

  certificates.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  return certificates;
}

// Add Certificate directly to Firestore
export async function addCertificateToDb(certData: Partial<Certificate>): Promise<Certificate> {
  const now = new Date().toISOString();
  const certsRef = collection(db, 'certificates');
  const newCert = {
    profile_id: certData.profile_id,
    title: (certData.title || '').trim(),
    issuer: (certData.issuer || '').trim(),
    issue_date: certData.issue_date,
    expiry_date: certData.expiry_date || null,
    credential_url: certData.credential_url || null,
    file_url: certData.file_url || null,
    type: certData.type || 'certificate',
    category: certData.category || 'Other',
    is_featured: certData.is_featured || false,
    sort_order: typeof certData.sort_order === 'number' ? certData.sort_order : 0,
    created_at: now,
    updated_at: now,
  };

  const docRef = await addDoc(certsRef, newCert);
  return { id: docRef.id, ...newCert } as Certificate;
}

// Update Certificate directly in Firestore
export async function updateCertificateInDb(id: string, updates: Partial<Certificate>): Promise<Certificate> {
  const certRef = doc(db, 'certificates', id);
  const now = new Date().toISOString();
  const cleanUpdates = { ...updates, updated_at: now };
  delete (cleanUpdates as any).id;

  await updateDoc(certRef, cleanUpdates);
  const snap = await getDoc(certRef);
  return { id: snap.id, ...snap.data() } as Certificate;
}

// Delete Certificate directly from Firestore
export async function deleteCertificateFromDb(id: string): Promise<void> {
  const certRef = doc(db, 'certificates', id);
  await deleteDoc(certRef);
}

// Reorder Certificates directly in Firestore
export async function reorderCertificatesInDb(items: { id: string; sort_order: number }[]): Promise<void> {
  const now = new Date().toISOString();
  await Promise.all(
    items.map((item) => {
      if (!item.id) return Promise.resolve();
      const certRef = doc(db, 'certificates', item.id);
      return updateDoc(certRef, { sort_order: item.sort_order, updated_at: now });
    })
  );
}

