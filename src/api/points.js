import { base44 } from "@/api/base44Client";
import { getFirebase } from "@/api/firebase";

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
    const { data: session } = await (await import('@/api/supabaseClient')).supabase.auth.getSession()
    const token = session?.session?.access_token
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
    

    return awarded;
  } catch (error) {
    console.error("awardPointsForGame error:", error);
    // Fall back to local awarding on error
    return fallbackScore;
  }
}

export async function checkPointsEndpointHealth() {
  try {
    const endpoint = import.meta.env?.DEV ? '/.netlify/functions/updatePoints' : '/api/updatePoints';
    const res = await fetch(endpoint, { method: 'OPTIONS' });
    if (res.ok) return true;
    if (res.status === 405) return true;
    return false;
  } catch {
    return false;
  }
}
