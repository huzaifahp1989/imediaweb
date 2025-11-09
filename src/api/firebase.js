// Minimal Firebase client setup. Configure env vars in `.env`:
// VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID,
// VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID
// Optional: VITE_ADMIN_EMAIL for gating admin access.

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  updateDoc,
  setDoc,
  doc,
  deleteDoc,
  getDoc,
  setLogLevel,
} from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

let app;
let auth;
let db;
const useBackend = String(import.meta.env.VITE_USE_BACKEND || '').toLowerCase() === 'true' || String(import.meta.env.VITE_USE_BACKEND || '') === '1';

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
      const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;
      // Reduce Firestore console verbosity in dev
      try {
        setLogLevel(isDev ? 'error' : 'silent');
      } catch (_) {}
      if (isDev) {
        try {
          console.info('[Firebase] App/Auth initialized', {
            projectId: config.projectId,
          });
        } catch (_) {
          // no-op
        }
      }
    }
  }
  return { app, auth, db };
}

// Initialize Firestore on-demand to avoid opening long-polling Listen channels
// on public pages that only need Auth. Call this in any function that needs `db`.
export function getDb() {
  const { app } = getFirebase();
  if (!app) throw new Error('Firebase not configured');
  if (!db) {
    const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;
    db = initializeFirestore(app, isDev ? {
      experimentalForceLongPolling: true,
      useFetchStreams: false,
    } : {
      experimentalAutoDetectLongPolling: true,
      useFetchStreams: false,
    });
    if (isDev) {
      try {
        console.info('[Firebase] Firestore initialized (on-demand)', {
          projectId: config.projectId,
          experimentalForceLongPolling: true,
          useFetchStreams: false,
        });
      } catch (_) {}
    }
  }
  return db;
}

export async function adminSignIn(email, password) {
  const { auth } = getFirebase();
  if (!auth) throw new Error('Firebase not configured');
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// Generic user sign-in (email/password)
export async function signIn(email, password) {
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

// Generic user sign-up (email/password)
export async function signUp(email, password) {
  const { auth } = getFirebase();
  if (!auth) throw new Error('Firebase not configured');
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// Save user profile details to Firestore under `users/{uid}`
export async function saveUserProfile(uid, profile) {
  const db = getDb();
  const ref = doc(db, 'users', uid);
  // Ensure the document id equals uid; merge to preserve existing fields
  await setDoc(ref, { uid, ...(profile || {}), updatedAt: new Date() }, { merge: true });
}

// Fetch a single user profile from Firestore
export async function getUserProfile(uid) {
  const db = getDb();
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export function watchAuth(callback) {
  const { auth } = getFirebase();
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
}

// Password reset helper
export async function resetPassword(email) {
  const { auth } = getFirebase();
  if (!auth) throw new Error('Firebase not configured');
  return sendPasswordResetEmail(auth, email);
}

// Send email verification to the currently signed-in user
export async function sendVerification() {
  const { auth } = getFirebase();
  const user = auth?.currentUser;
  if (!user) throw new Error('No authenticated user to verify');
  await sendEmailVerification(user);
}

// Messages helpers
export const messagesApi = {
  async add(message) {
    if (useBackend) {
      try {
        const { auth } = getFirebase();
        const token = await auth?.currentUser?.getIdToken?.();
        const endpoint = import.meta.env?.DEV ? '/.netlify/functions/messages' : '/api/messages';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ message }),
        });
        if (!res.ok) throw new Error(`Backend error: ${res.status}`);
        const data = await res.json();
        return data;
      } catch (e) {
        console.warn('Backend add failed, falling back to Firestore:', e?.message || e);
      }
    }
    const db = getDb();
    const col = collection(db, 'messages');
    return addDoc(col, message);
  },
  async list() {
    if (useBackend) {
      try {
        const { auth } = getFirebase();
        const token = await auth?.currentUser?.getIdToken?.();
        const endpoint = import.meta.env?.DEV ? '/.netlify/functions/messages' : '/api/messages';
        const res = await fetch(endpoint, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (!res.ok) throw new Error(`Backend error: ${res.status}`);
        const data = await res.json();
        return data;
      } catch (e) {
        console.warn('Backend list failed, falling back to Firestore:', e?.message || e);
      }
    }
    const db = getDb();
    const col = collection(db, 'messages');
    const q = query(col, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async markRead(id, read = true) {
    if (useBackend) {
      try {
        const { auth } = getFirebase();
        const token = await auth?.currentUser?.getIdToken?.();
        const endpoint = import.meta.env?.DEV ? '/.netlify/functions/messages' : '/api/messages';
        const res = await fetch(endpoint, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ id, read }),
        });
        if (!res.ok) throw new Error(`Backend error: ${res.status}`);
        const data = await res.json();
        return data;
      } catch (e) {
        console.warn('Backend markRead failed, falling back to Firestore:', e?.message || e);
      }
    }
    const db = getDb();
    const ref = doc(db, 'messages', id);
    await updateDoc(ref, { read });
  },
};

// Admin-backed users listing via Netlify function with Firestore fallback
export const usersApi = {
  async list() {
    // Try backend (requires VITE_USE_BACKEND and admin auth token)
    if (useBackend) {
      try {
        const { auth } = getFirebase();
        const token = await auth?.currentUser?.getIdToken?.();
        const endpoint = import.meta.env?.DEV ? '/.netlify/functions/users' : '/api/users';
        const res = await fetch(endpoint, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (!res.ok) throw new Error(`Backend error: ${res.status}`);
        const data = await res.json();
        return data;
      } catch (e) {
        console.warn('Backend users list failed, falling back to Firestore:', e?.message || e);
      }
    }
    // Fallback: read directly from Firestore (requires admin read in rules)
    const db = getDb();
    const col = collection(db, 'users');
    const snap = await getDocs(col);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
};

// Sponsors/Ads helpers (Firestore-backed with localStorage fallback, no backend calls)
function readLocalSponsors() {
  try {
    const raw = localStorage.getItem('local_sponsors');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalSponsors(items) {
  try {
    localStorage.setItem('local_sponsors', JSON.stringify(items));
  } catch {}
}

const genLocalId = () => (globalThis.crypto?.randomUUID?.() || `local_${Date.now()}`);

export const sponsorsApi = {
  async add(sponsor) {
    let db;
    try {
      db = getDb();
    } catch (_) {}
    if (!db) {
      const items = readLocalSponsors();
      const id = genLocalId();
      const next = [...items, { ...sponsor, _localId: id }];
      writeLocalSponsors(next);
      return { id };
    }
    const col = collection(db, 'sponsors');
    const ref = await addDoc(col, sponsor);
    return { id: ref.id };
  },
  async list() {
    let db;
    try {
      db = getDb();
    } catch (_) {}
    if (!db) {
      return readLocalSponsors();
    }
    const col = collection(db, 'sponsors');
    let snap;
    try {
      const q = query(col, orderBy('order', 'asc'));
      snap = await getDocs(q);
    } catch {
      snap = await getDocs(col);
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async update(id, patch) {
    let db;
    try {
      db = getDb();
    } catch (_) {}
    if (!db) {
      const items = readLocalSponsors();
      const next = items.map(it => {
        const match = it.id === id || it._localId === id;
        return match ? { ...it, ...patch } : it;
      });
      writeLocalSponsors(next);
      return { ok: true };
    }
    const ref = doc(db, 'sponsors', id);
    await updateDoc(ref, patch);
  },
  async remove(id) {
    let db;
    try {
      db = getDb();
    } catch (_) {}
    if (!db) {
      const items = readLocalSponsors().filter(it => (it.id !== id && it._localId !== id));
      writeLocalSponsors(items);
      return { ok: true };
    }
    const ref = doc(db, 'sponsors', id);
    await deleteDoc(ref);
  },
};

// Upload an image file to Firebase Storage and return a public download URL
export async function uploadSponsorImage(file, name = '') {
  const { app } = getFirebase();
  if (!app) throw new Error('Firebase not configured');
  if (!file) throw new Error('No file provided');

  const storage = getStorage(app);
  const safeName = String(name || file.name || 'image').replace(/[^a-z0-9._-]+/gi, '-').toLowerCase();
  const path = `sponsors/${Date.now()}_${safeName}`;
  const ref = storageRef(storage, path);
  await uploadBytes(ref, file);
  const url = await getDownloadURL(ref);
  return { url, path };
}

// Utility: check if current user is the admin email in env
export async function isAdminUser() {
  const { auth } = getFirebase();
  const user = auth?.currentUser;
  if (!user) return false;
  const adminEmail = String(import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase();
  const email = String(user.email || '').toLowerCase();
  // If admin email is configured, require exact match; otherwise allow any authenticated user
  return adminEmail ? email === adminEmail : true;
}
