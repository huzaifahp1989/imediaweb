import { supabase } from '@/api/supabaseClient'

const useBackend = String(import.meta.env.VITE_USE_BACKEND || '').toLowerCase() === 'true' || String(import.meta.env.VITE_USE_BACKEND || '') === '1'

export function getFirebase() {
  const authWrapper = {
    async get currentUser() {
      // Get the current Supabase user
      const { data: { user } } = await supabase.auth.getSession()
      if (user) {
        return {
          uid: user.id,
          email: user.email,
          displayName: user.user_metadata?.full_name || user.email,
          async getIdToken() {
            const { data } = await supabase.auth.getSession()
            return data?.session?.access_token || null
          }
        }
      }
      return null
    }
  }
  return { app: true, auth: authWrapper, db: null }
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.user
}

export async function adminSignIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.user
}

export async function adminSignOut() {
  await supabase.auth.signOut()
}

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data.user
}

export async function saveUserProfile(uid, profile) {
  const patch = { id: uid, ...(profile || {}), updated_at: new Date().toISOString() }
  const { error } = await supabase.from('users').upsert(patch)
  if (error) throw error
}

export async function getUserProfile(uid) {
  const { data, error } = await supabase.from('users').select('*').eq('id', uid).maybeSingle()
  if (error) throw error
  return data
}

export function watchAuth(callback) {
  const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
    const u = session?.user || null
    if (u) {
      callback({ uid: u.id, email: u.email || '' })
    } else {
      callback(null)
    }
  })
  return () => { try { sub.subscription?.unsubscribe?.() } catch {} }
}

export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) throw error
}

export async function sendVerification() {
  return
}

// Messages helpers
export const messagesApi = {
  async add(message) {
    if (useBackend) {
      try {
        const { data: session } = await supabase.auth.getSession()
        const token = session?.session?.access_token
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
    return { ok: false }
  },
  async list() {
    if (useBackend) {
      try {
        const { data: session } = await supabase.auth.getSession()
        const token = session?.session?.access_token
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
    return []
  },
  async markRead(id, read = true) {
    if (useBackend) {
      try {
        const { data: session } = await supabase.auth.getSession()
        const token = session?.session?.access_token
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
    return { ok: false }
  },
};

// Admin-backed users listing via Netlify function with Firestore fallback
export const usersApi = {
  async list() {
    // Try backend (requires VITE_USE_BACKEND and admin auth token)
    if (useBackend) {
      try {
        const { data: session } = await supabase.auth.getSession()
        const token = session?.session?.access_token
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
    return []
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
  throw new Error('Not supported')
}

// Utility: check if current user is the admin email in env
export async function isAdminUser() {
  const { data: session } = await supabase.auth.getSession()
  const user = session?.session?.user
  if (!user) return false
  const adminEmail = String(import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase();
  const email = String(user.email || '').toLowerCase();
  return adminEmail ? email === adminEmail : true
}

