import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const isConfigured = Boolean(apiKey && apiKey !== 'your_api_key_here');

const firebaseConfig = {
  apiKey: isConfigured ? apiKey : 'AIzaSyCMwDkU33QUGGAJalHvQw6xKqb-LFBzMwM',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'new-prototype-uc9lw.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'new-prototype-uc9lw',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'new-prototype-uc9lw.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '608129690247',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:608129690247:web:c2491b0f5db587faf56622',
};

// Initialize Firebase app for client-side safely
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (err) {
  console.warn('Firebase client SDK running in fallback demo mode:', err);
  app = getApps()[0] || initializeApp({ apiKey: 'demo', projectId: 'demo' });
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, googleProvider };
