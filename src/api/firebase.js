// Minimal Firebase client setup. Configure env vars in `.env`:
// VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID,
// VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID
// Optional: VITE_ADMIN_EMAIL for gating admin access.

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
} from 'firebase/firestore';

let app;
let auth;
let db;

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize lazily to avoid crashing if not configured
export function getFirebase() {
  if (!app) {
    // Only initialize if minimum config exists
    if (config.apiKey && config.projectId) {
      app = initializeApp(config);
      auth = getAuth(app);
      db = getFirestore(app);
    }
  }
  return { app, auth, db };
}

export async function adminSignIn(email, password) {
  const { auth } = getFirebase();
  if (!auth) throw new Error('Firebase not configured');
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function adminSignOut() {
  const { auth } = getFirebase();
  if (!auth) return;
  await signOut(auth);
}

export function watchAuth(callback) {
  const { auth } = getFirebase();
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
}

// Messages helpers
export const messagesApi = {
  async add(message) {
    const { db } = getFirebase();
    if (!db) throw new Error('Firebase not configured');
    const col = collection(db, 'messages');
    return addDoc(col, message);
  },
  async list() {
    const { db } = getFirebase();
    if (!db) throw new Error('Firebase not configured');
    const col = collection(db, 'messages');
    const q = query(col, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async markRead(id, read = true) {
    const { db } = getFirebase();
    if (!db) throw new Error('Firebase not configured');
    const ref = doc(db, 'messages', id);
    await updateDoc(ref, { read });
  },
};

// Utility: check if current user is the admin email in env
export async function isAdminUser() {
  const { auth } = getFirebase();
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase();
  const user = auth?.currentUser;
  if (!user || !adminEmail) return false;
  return user.email?.toLowerCase() === adminEmail;
}

