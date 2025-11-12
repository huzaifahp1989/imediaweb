import { createClient } from '@base44/sdk';
import { getFirebase } from '@/api/firebase';

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
  const u = auth?.currentUser;
  if (u) {
    return { id: u.uid, email: u.email || '', name: u.displayName || '' };
  }
  if (originalAuth?.me) return originalAuth.me();
  throw new Error('No authenticated user');
};

