import { getSupabase } from './_supabaseAdmin.js'

export async function handler(event) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { supabase } = getSupabase()

    const authHeader = event.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return { statusCode: 401, body: 'Missing auth token' };

    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData?.user) return { statusCode: 401, body: 'Invalid token' }
    const uid = userData.user.id
    const email = String(userData.user.email || '').toLowerCase()
    if (!uid || !email) return { statusCode: 400, body: 'Invalid user token' };

    const body = JSON.parse(event.body || '{}');
    const gameType = String(body.game_type || '').trim();
    const pointsAwarded = Number(body.points_awarded || body.awarded || 0);
    const isPerfect = Boolean(body.isPerfect || false);
    const metadata = body.metadata || {};

    if (!Number.isFinite(pointsAwarded) || pointsAwarded < 0) {
      return { statusCode: 400, body: 'Invalid points_awarded' };
    }
    const { data: existingRow } = await supabase.from('users').select('points').eq('id', uid).maybeSingle()
    const currentPoints = Number(existingRow?.points || 0)
    const maxCap = 1500;
    const newTotal = Math.min(currentPoints + pointsAwarded, maxCap)

    const upsertUser = {
      id: uid,
      email,
      points: newTotal,
      last_award: {
        game_type: gameType || null,
        points_awarded: pointsAwarded,
        perfect: isPerfect,
        at: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    }
    const { error: upErr } = await supabase.from('users').upsert(upsertUser)
    if (upErr) return { statusCode: 500, body: JSON.stringify({ error: upErr.message }) }

    if (gameType) {
      await supabase.from('game_scores').insert({
        user_id: uid,
        game_type: gameType,
        points_awarded: pointsAwarded,
        perfect: isPerfect,
        at: new Date().toISOString(),
        meta: metadata,
      })
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true, new_total: newTotal, points_awarded: pointsAwarded }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
}
