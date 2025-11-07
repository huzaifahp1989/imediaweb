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
      const snap = await db.collection('users').get();
      const list = snap.docs.map(d => {
        const data = d.data() || {};
        return {
          id: d.id,
          uid: data.uid || d.id,
          fullName: data.fullName || data.name || '',
          email: data.email || '',
          role: data.role || 'user',
        };
      });
      return { statusCode: 200, body: JSON.stringify(list) };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
}

