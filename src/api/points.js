import { base44 } from "@/api/base44Client";

// Centralized helper to award points based on backend GameSettings
// Usage: await awardPointsForGame(user, gameType, { isPerfect, fallbackScore })
export async function awardPointsForGame(user, gameType, opts = {}) {
  const { isPerfect = false, fallbackScore = 10 } = opts;

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

    // Update persistence: record score and update user's total points (capped at 1500)
    await base44.entities.GameScore.create({
      user_id: user.id,
      game_type: gameType,
      score: awarded,
      completed: true
    });

    const newTotalPoints = Math.min((user.points || 0) + awarded, 1500);
    await base44.auth.updateMe({ points: newTotalPoints });

    return awarded;
  } catch (error) {
    console.error("awardPointsForGame error:", error);
    // Fall back to local awarding on error
    return fallbackScore;
  }
}

