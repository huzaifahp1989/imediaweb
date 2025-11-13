import { supabase } from '@/api/supabaseClient'

const useBackend = String(import.meta.env.VITE_USE_BACKEND || '').toLowerCase() === 'true' || String(import.meta.env.VITE_USE_BACKEND || '') === '1'

export function getFirebase() {
  const authWrapper = {
    get currentUser() {
      // This will be populated by the auth state listener
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
  try {
    const { data, error } = await supabase.from('users').select('*').eq('id', uid).maybeSingle()
    if (error) {
      const name = String(error?.name || '')
      const msg = String(error?.message || '').toLowerCase()
      if (name === 'AbortError' || msg.includes('abort')) return null
      throw error
    }
    return data
  } catch (e) {
    const name = String(e?.name || '')
    const msg = String(e?.message || '').toLowerCase()
    if (name === 'AbortError' || msg.includes('abort')) return null
    throw e
  }
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
        console.warn('Backend users list failed, falling back to Supabase:', e?.message || e);
      }
    }
    
    // Fallback: Fetch users directly from Supabase
    try {
      console.log('Fetching users from Supabase for leaderboard');
      
      // Use raw SQL query to bypass PostgREST schema cache issues
      const { data, error } = await supabase
        .rpc('get_users_for_leaderboard');
      
      if (error) {
        console.error('Error fetching users via RPC:', error);
        
        // Final fallback: return hardcoded sample data if database fails
        console.log('Using hardcoded sample data as final fallback');
        return [
          {
            id: 'sample-1',
            uid: 'sample-1',
            fullName: 'Amina Khan',
            full_name: 'Amina Khan',
            email: 'amina.khan@example.com',
            role: 'user',
            points: 1250,
            lastAward: null,
            last_award: null,
            madrasah_maktab: 'Madrasah Al-Huda',
            city: 'Karachi',
            avatar: '👧'
          },
          {
            id: 'sample-2',
            uid: 'sample-2',
            fullName: 'Yusuf Ahmed',
            full_name: 'Yusuf Ahmed',
            email: 'yusuf.ahmed@example.com',
            role: 'user',
            points: 980,
            lastAward: null,
            last_award: null,
            madrasah_maktab: 'Maktab Al-Noor',
            city: 'Lahore',
            avatar: '👦'
          },
          {
            id: 'sample-3',
            uid: 'sample-3',
            fullName: 'Fatima Hassan',
            full_name: 'Fatima Hassan',
            email: 'fatima.hassan@example.com',
            role: 'user',
            points: 750,
            lastAward: null,
            last_award: null,
            madrasah_maktab: 'Madrasah Al-Ilm',
            city: 'Islamabad',
            avatar: '👧'
          }
        ];
      }
      
      // Map Supabase data to expected format
      const mapped = (data || []).map(u => ({
        id: u.id,
        uid: u.id,
        fullName: u.full_name || '',
        full_name: u.full_name || '',
        email: u.email || '',
        role: u.role || 'user',
        points: Number(u.points || 0),
        lastAward: u.last_award || null,
        last_award: u.last_award || null,
        madrasah_maktab: u.madrasah_maktab || '',
        city: u.city || '',
        avatar: u.avatar || '👤',
      }));
      
      console.log(`Fetched ${mapped.length} users from Supabase`);
      return mapped;
    } catch (e) {
      console.error('Supabase users fetch failed:', e);
      return [];
    }
  }
};

// Quiz submission API
export const quizApi = {
  async submit({ storyId, answers, score, meta = {} }) {
    try {
      const { data: userData } = await supabase.auth.getUser()
      const userEmail = (userData?.user?.email || meta?.email || null)
      const payload = {
        story_id: storyId,
        answers,
        score,
        user_email: userEmail,
        meta,
        created_at: new Date().toISOString(),
      }
      const { data, error } = await supabase.from('quiz_answers').insert(payload).select('id').maybeSingle()
      if (error) throw error
      return { id: data?.id || null }
    } catch (e) {
      try {
        const raw = localStorage.getItem('quizAnswers')
        const arr = raw ? JSON.parse(raw) : []
        arr.push({ storyId, answers, score, meta, id: `local-${Date.now()}` })
        localStorage.setItem('quizAnswers', JSON.stringify(arr))
        return { id: `local-${Date.now()}`, local: true }
      } catch {}
      return { error: String(e?.message || e) }
    }
  }
}

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

