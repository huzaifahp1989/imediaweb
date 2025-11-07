import { getAdmin } from './_firebaseAdmin.js';

export async function handler(event) {
  try {
    const { admin, db } = getAdmin();

    const authHeader = event.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return { statusCode: 401, body: 'Missing auth token' };

    const decoded = await admin.auth().verifyIdToken(token);
    const email = (decoded.email || '').toLowerCase();
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
      // Merge Firebase Auth users with Firestore profiles to ensure admin sees all accounts
      const profilesSnap = await db.collection('users').get();
      const profileMap = new Map();
      for (const d of profilesSnap.docs) {
        profileMap.set(d.id, d.data() || {});
      }

      const authUsersPage = await admin.auth().listUsers(1000);
      const seen = new Set();
      const merged = authUsersPage.users.map(u => {
        const data = profileMap.get(u.uid) || {};
        seen.add(u.uid);
        return {
          id: u.uid,
          uid: u.uid,
          fullName: data.fullName || data.name || u.displayName || '',
          email: data.email || u.email || '',
          role: data.role || 'user',
          points: Number(data.points || 0),
          lastAward: data.lastAward || null,
        };
      });

      // Include any Firestore-only profiles that may not have a corresponding Auth user
      for (const [uid, data] of profileMap.entries()) {
        if (seen.has(uid)) continue;
        merged.push({
          id: uid,
          uid,
          fullName: data.fullName || data.name || '',
          email: data.email || '',
          role: data.role || 'user',
          points: Number(data.points || 0),
          lastAward: data.lastAward || null,
        });
      }

      return { statusCode: 200, body: JSON.stringify(merged) };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
}
