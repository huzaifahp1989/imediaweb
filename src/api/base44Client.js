import { createClient } from '@base44/sdk';
import { getFirebase } from '@/api/firebase';
import { supabase } from '@/api/supabaseClient';

export const base44 = createClient({
  appId: "68fcd301afef087bf759dba3",
  requiresAuth: false
});

const originalAuth = { ...base44.auth };

base44.auth.isAuthenticated = async () => {
  try {
    const { auth } = getFirebase();
    return Boolean(auth?.currentUser);
  } catch {
    return false;
  }
};

base44.auth.me = async () => {
  const { auth } = getFirebase();
  if (auth?.currentUser) {
    const u = auth.currentUser;
    return { id: u.uid, email: u.email || '', name: u.displayName || '' };
  }
  
  // Fallback: try to get user directly from Supabase
  try {
    const { data: { user } } = await supabase.auth.getSession();
    if (user) {
      return { id: user.id, email: user.email || '', name: user.user_metadata?.full_name || user.email || '' };
    }
  } catch (e) {
    console.error('Error getting user from Supabase:', e);
  }
  
  if (originalAuth?.me) return originalAuth.me();
  throw new Error('No authenticated user');
};

