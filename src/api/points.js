import { base44 } from "@/api/base44Client";
import { getFirebase } from "@/api/firebase";
import { supabase } from "@/api/supabaseClient";

// Centralized helper to award points based on backend GameSettings
// Usage: await awardPointsForGame(user, gameType, { isPerfect, fallbackScore })
export async function awardPointsForGame(user, gameType, opts = {}) {
  const { isPerfect = false, fallbackScore = 10, metadata = {} } = opts;

  try {
    console.log('awardPointsForGame called:', { user, gameType, opts });
    
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

    console.log('Points calculated:', { awarded, isActive, basePoints, bonus });

    // Get user ID from the user object passed by the game
    const userId = user?.id || user?.uid;
    if (!userId) {
      console.log('No user ID available in user object:', user);
      return awarded;
    }

    // Try to get session token for backend call
    let token = null;
    try {
      const { data: session } = await supabase.auth.getSession();
      token = session?.session?.access_token;
      console.log('Session token:', token ? 'Available' : 'Not available');
    } catch (sessionError) {
      console.error('Session error:', sessionError);
    }

    // Try backend first if token is available
    if (token) {
      const endpoint = import.meta.env?.DEV ? '/.netlify/functions/updatePoints' : '/api/updatePoints';
      try {
        console.log('Calling updatePoints endpoint:', endpoint);
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ game_type: gameType, points_awarded: awarded, isPerfect, metadata }),
        });
        console.log('UpdatePoints response:', res.status, res.statusText);
        if (res.ok) {
          console.log('Points updated successfully via backend');
          return awarded;
        } else {
          console.log('Backend update failed, falling back to client-side');
        }
      } catch (e) {
        console.error('Backend call failed:', e);
      }
    } else {
      console.log('No token available, using client-side fallback');
    }

    // Fallback: update Supabase client-side
    console.log('Using Supabase client-side fallback for user:', userId);
    try {
      // Get current points
      const { data: userData, error: fetchError } = await supabase.from('users')
        .select('points')
        .eq('id', userId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching user data:', fetchError);
        return awarded;
      }
      
      const currentPoints = userData?.points || 0;
      const maxCap = 1500;
      const newTotal = Math.min(currentPoints + awarded, maxCap);
      
      console.log('Points update:', { currentPoints, awarded, newTotal });
      
      // Update user points
      const { error: updateError } = await supabase.from('users')
        .update({ 
          points: newTotal,
          last_award: {
            game_type: gameType || null,
            points_awarded: awarded,
            perfect: isPerfect,
            at: new Date().toISOString(),
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error('Error updating user points:', updateError);
        return awarded;
      }
      
      console.log('User points updated successfully');
      
      // Record game score
      if (gameType) {
        console.log('Recording game score');
        const { error: scoreError } = await supabase.from('game_scores').insert({
          user_id: userId,
          game_type: gameType,
          points_awarded: awarded,
          perfect: isPerfect,
          at: new Date().toISOString(),
          meta: metadata,
        });
        
        if (scoreError) {
          console.error('Error recording game score:', scoreError);
        } else {
          console.log('Game score recorded successfully');
        }
      }
      
      return awarded;
    } catch (fallbackError) {
      console.error('Supabase fallback failed:', fallbackError);
    }

    console.log('Points update failed completely');
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
