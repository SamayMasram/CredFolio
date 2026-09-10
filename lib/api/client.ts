import { UserProfile, Certificate } from '@/types';
import {
  getProfileByUsername,
  getCertificatesByProfileId,
  addCertificateToDb,
  updateCertificateInDb,
  deleteCertificateFromDb,
  reorderCertificatesInDb,
} from '@/lib/firebase/db';

// Helper HTTP fetcher
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(endpoint, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `API request failed: ${res.statusText}`);
  }
  return data as T;
}

export const api = {
  // Username Availability
  async checkUsernameAvailability(username: string): Promise<boolean> {
    try {
      const res = await apiFetch<{ available: boolean }>(
        `/api/usernames/check?username=${encodeURIComponent(username)}`
      );
      return res.available;
    } catch {
      return true; // Fallback for local demo
    }
  },

  // User Profile
  async getProfileByUid(uid: string): Promise<UserProfile | null> {
    try {
      const res = await apiFetch<{ profile: UserProfile | null }>(
        `/api/profile?uid=${encodeURIComponent(uid)}`
      );
      return res.profile;
    } catch (err) {
      console.warn('API fetch profile failed:', err);
      return null;
    }
  },

  async createProfile(data: {
    uid: string;
    username: string;
    full_name: string;
    headline?: string;
    bio?: string;
    avatar_url?: string;
    visibility?: string;
  }): Promise<UserProfile> {
    const res = await apiFetch<{ success: boolean; profile: UserProfile }>('/api/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.profile;
  },

  async updateProfile(uid: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const res = await apiFetch<{ success: boolean; profile: UserProfile }>('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify({ uid, ...updates }),
    });
    return res.profile;
  },

  async getPublicProfile(username: string): Promise<{
    profile: UserProfile;
    certificates: Certificate[];
    isPrivate: boolean;
  }> {
    try {
      const res = await apiFetch<{
        profile: UserProfile;
        certificates: Certificate[];
        isPrivate: boolean;
      }>(`/api/profile/${encodeURIComponent(username)}`);
      if (res && res.profile) {
        return res;
      }
    } catch (apiErr) {
      console.warn('API getPublicProfile failed, trying direct Firestore:', apiErr);
    }

    try {
      const cleanUsername = username.toLowerCase().trim();
      const profile = await getProfileByUsername(cleanUsername);
      if (profile) {
        if (profile.visibility === 'private') {
          return { profile: { ...profile, bio: '', headline: '' }, certificates: [], isPrivate: true };
        }
        const certificates = await getCertificatesByProfileId(profile.uid);
        return { profile, certificates, isPrivate: false };
      }
    } catch (dbErr) {
      console.warn('Direct Firestore getPublicProfile failed:', dbErr);
    }

    const cleanUsername = username.toLowerCase().trim();
    const formattedName = cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1);
    return {
      profile: {
        uid: `uid-${cleanUsername}`,
        username: cleanUsername,
        full_name: formattedName,
        headline: 'Credential Showcase',
        bio: 'Welcome to my verified credential portfolio showcase.',
        visibility: 'public',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      certificates: [],
      isPrivate: false,
    };
  },

  // Certificates
  async getCertificates(profileId: string): Promise<Certificate[]> {
    try {
      const res = await apiFetch<{ certificates: Certificate[] }>(
        `/api/certificates?profile_id=${encodeURIComponent(profileId)}`
      );
      if (res && Array.isArray(res.certificates)) {
        return res.certificates;
      }
    } catch (apiErr) {
      console.warn('API fetch certificates failed, trying direct Firestore:', apiErr);
    }

    try {
      return await getCertificatesByProfileId(profileId);
    } catch (err) {
      console.error('Direct Firestore getCertificates failed:', err);
      return [];
    }
  },

  async createCertificate(certData: Partial<Certificate>): Promise<Certificate> {
    try {
      const res = await apiFetch<{ success: boolean; certificate: Certificate }>('/api/certificates', {
        method: 'POST',
        body: JSON.stringify(certData),
      });
      if (res && res.certificate) {
        return res.certificate;
      }
    } catch (apiErr) {
      console.warn('API createCertificate failed, trying direct Firestore:', apiErr);
    }

    return await addCertificateToDb(certData);
  },

  async updateCertificate(id: string, updates: Partial<Certificate>): Promise<Certificate> {
    try {
      const res = await apiFetch<{ success: boolean; certificate: Certificate }>(
        `/api/certificates/${encodeURIComponent(id)}`,
        {
          method: 'PATCH',
          body: JSON.stringify(updates),
        }
      );
      if (res && res.certificate) {
        return res.certificate;
      }
    } catch (apiErr) {
      console.warn('API updateCertificate failed, trying direct Firestore:', apiErr);
    }

    return await updateCertificateInDb(id, updates);
  },

  async deleteCertificate(id: string): Promise<void> {
    try {
      await apiFetch<{ success: boolean }>(`/api/certificates/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch (apiErr) {
      console.warn('API deleteCertificate failed, trying direct Firestore:', apiErr);
      await deleteCertificateFromDb(id);
    }
  },

  async reorderCertificates(items: { id: string; sort_order: number }[]): Promise<void> {
    try {
      await apiFetch<{ success: boolean }>('/api/certificates/reorder', {
        method: 'PATCH',
        body: JSON.stringify({ items }),
      });
    } catch (apiErr) {
      console.warn('API reorderCertificates failed, trying direct Firestore:', apiErr);
      await reorderCertificatesInDb(items);
    }
  },
};


