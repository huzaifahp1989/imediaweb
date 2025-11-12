import { getSupabase } from './_supabaseAdmin.js'

export async function handler(event) {
  try {
    const { supabase } = getSupabase()

    const authHeader = event.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return { statusCode: 401, body: 'Missing auth token' };

    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData?.user) return { statusCode: 401, body: 'Invalid token' }
    const email = String(userData.user.email || '').toLowerCase()
    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
    const adminDomain = (process.env.ADMIN_EMAIL_DOMAIN || '').toLowerCase().replace(/^@/, '');

    let allowed = true;
    if (adminEmail) allowed = email === adminEmail;
    if (adminDomain) allowed = allowed || email.endsWith(`@${adminDomain}`);
    if (!allowed) {
      return { statusCode: 403, body: 'Forbidden' };
    }

    const method = event.httpMethod;
    if (method === 'GET') {
      const { data, error } = await supabase.from('users').select('id,email,full_name,role,points,last_award').order('points', { ascending: false })
      if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) }
      const mapped = (data || []).map(u => ({
        id: u.id,
        uid: u.id,
        fullName: u.full_name || '',
        email: u.email || '',
        role: u.role || 'user',
        points: Number(u.points || 0),
        lastAward: u.last_award || null,
      }))
      return { statusCode: 200, body: JSON.stringify(mapped) };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
}
