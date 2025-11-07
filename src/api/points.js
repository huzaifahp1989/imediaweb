import { base44 } from "@/api/base44Client";
import { getFirebase } from "@/api/firebase";
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Centralized helper to award points based on backend GameSettings
// Usage: await awardPointsForGame(user, gameType, { isPerfect, fallbackScore })
export async function awardPointsForGame(user, gameType, opts = {}) {
  const { isPerfect = false, fallbackScore = 10, metadata = {} } = opts;

  try {
    // Load setting for this game; fall back if none or inactive
    const settings = await base44.entities.GameSettings.filter({ game_id: gameType });
    const setting = settings && settings.length > 0 ? settings[0] : null;

    const isActive = setting ? setting.is_active !== false : true;
    const basePoints = setting ? Number(setting.points_per_game ?? fallbackScore) : fallbackScore;
    const bonus = setting ? Number(setting.perfect_score_bonus ?? 0) : 0;
    const min = setting ? Number(setting.min_points ?? 0) : 0;
    const max = setting ? Number(setting.max_points ?? 99999) : 99999;

    // If game is deactivated, award 0 but still record completion
    let awarded = isActive ? basePoints + (isPerfect ? bonus : 0) : 0;
    // Clamp within configured bounds
    awarded = Math.max(min, Math.min(awarded, max));

    // Persist points to Firebase via Netlify function (server-side authoritative)
    const { auth } = getFirebase();
    const token = await auth?.currentUser?.getIdToken?.();
    if (token) {
      const endpoint = import.meta.env?.DEV ? '/.netlify/functions/updatePoints' : '/api/updatePoints';
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ game_type: gameType, points_awarded: awarded, isPerfect, metadata }),
        });
        if (res.ok) {
          return awarded;
        }
      } catch (e) {
        // fall through to Firestore client-side fallback
      }
    }

    // Fallback: update Firestore client-side if backend not available
    const { db, auth: fbAuth } = getFirebase();
    const uid = fbAuth?.currentUser?.uid;
    const email = fbAuth?.currentUser?.email || null;
    if (db && uid) {
      try {
        const ref = doc(db, 'users', uid);
        const snap = await getDoc(ref);
        const currentPoints = Number(snap.exists() ? (snap.data()?.points || 0) : 0);
        const maxCap = 1500;
        const nextTotal = Math.min(currentPoints + awarded, maxCap);
        await setDoc(ref, {
          uid,
          email,
          points: nextTotal,
          lastAward: {
            game_type: gameType || null,
            points_awarded: awarded,
            perfect: isPerfect,
            at: new Date(),
          },
          updatedAt: new Date(),
          createdAt: snap.exists() ? (snap.data()?.createdAt || new Date()) : new Date(),
        }, { merge: true });
      } catch (_) {
        // ignore
      }
    }

    return awarded;
  } catch (error) {
    console.error("awardPointsForGame error:", error);
    // Fall back to local awarding on error
    return fallbackScore;
  }
}
