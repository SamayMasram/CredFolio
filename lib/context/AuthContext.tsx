'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signOut as firebaseSignOut,
  signInWithPopup,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase/client';
import { UserProfile, ProfileVisibility } from '@/types';
import { api } from '@/lib/api/client';

import { formatDisplayName } from '@/lib/utils/format';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
  loginWithGoogle: async () => {},
  refreshProfile: async () => {},
  updateProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async (currentUser: FirebaseUser) => {
    const uid = currentUser.uid;
    const defaultName = formatDisplayName(currentUser.displayName, currentUser.email);
    const defaultUsername = (currentUser.email?.split('@')[0] || 'user').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    // 1. Instant optimistic restore from localStorage cache
    try {
      const cached = localStorage.getItem(`credfolio_profile_${uid}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.uid === uid) {
          setProfile(parsed);
        }
      }
    } catch {}

    try {
      const userProf = await api.getProfileByUid(uid);
      if (userProf && userProf.full_name && userProf.full_name.toLowerCase() !== 'user profile') {
        setProfile(userProf);
        try {
          localStorage.setItem(`credfolio_profile_${uid}`, JSON.stringify(userProf));
          if (userProf.username) {
            localStorage.setItem(`credfolio_profile_${userProf.username}`, JSON.stringify(userProf));
          }
        } catch {}
      } else {
        const newProfData: Partial<UserProfile> & { uid: string; username: string; full_name: string } = {
          uid: uid,
          username: defaultUsername,
          full_name: defaultName,
          headline: 'Credential Showcase',
          bio: '',
          avatar_url: currentUser.photoURL || undefined,
          visibility: 'public' as ProfileVisibility,
        };
        try {
          const created = await api.createProfile(newProfData);
          const finalProfile = created || {
            ...newProfData,
            visibility: 'public' as ProfileVisibility,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setProfile(finalProfile);
          try {
            localStorage.setItem(`credfolio_profile_${uid}`, JSON.stringify(finalProfile));
          } catch {}
        } catch {
          const fallbackProfile = {
            ...newProfData,
            visibility: 'public' as ProfileVisibility,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setProfile(fallbackProfile);
          try {
            localStorage.setItem(`credfolio_profile_${uid}`, JSON.stringify(fallbackProfile));
          } catch {}
        }
      }
    } catch (error) {
      console.warn('Could not fetch user profile from API, using auth fallback:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      const existing = await api.getProfileByUid(result.user.uid);
      if (!existing) {
        // Generate initial unique username from email or displayName
        const baseUsername = (result.user.email?.split('@')[0] || 'user').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        let username = baseUsername;
        let counter = 1;
        while (!(await api.checkUsernameAvailability(username))) {
          username = `${baseUsername}${counter}`;
          counter++;
        }
        await api.createProfile({
          uid: result.user.uid,
          username,
          full_name: result.user.displayName || 'User',
          avatar_url: result.user.photoURL || undefined,
          visibility: 'public',
        });
        await fetchProfile(result.user);
      }
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const uid = profile?.uid || user?.uid;
    if (!uid) {
      throw new Error('You must be logged in to update your profile.');
    }

    // Optimistic local state update
    setProfile((prev) => (prev ? { ...prev, ...updates } : null));

    // Optimistic cache update
    try {
      if (profile) {
        localStorage.setItem(`credfolio_profile_${uid}`, JSON.stringify({ ...profile, ...updates }));
      }
    } catch {}

    try {
      const updated = await api.updateProfile(uid, updates);
      if (updated) {
        setProfile(updated);
        try {
          localStorage.setItem(`credfolio_profile_${uid}`, JSON.stringify(updated));
          if (updated.username) {
            localStorage.setItem(`credfolio_profile_${updated.username}`, JSON.stringify(updated));
          }
        } catch {}
      }
    } catch (err) {
      console.error('Backend profile update failed:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        logout,
        loginWithGoogle,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
