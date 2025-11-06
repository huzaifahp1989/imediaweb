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
      const snap = await db.collection('messages').orderBy('createdAt', 'desc').get();
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return { statusCode: 200, body: JSON.stringify(list) };
    }

    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      if (!body || !body.message) {
        return { statusCode: 400, body: 'Invalid payload' };
      }
      const docRef = await db.collection('messages').add(body.message);
      return { statusCode: 200, body: JSON.stringify({ id: docRef.id }) };
    }

    if (method === 'PATCH') {
      const body = JSON.parse(event.body || '{}');
      if (!body || !body.id) {
        return { statusCode: 400, body: 'Invalid payload' };
      }
      const read = body.read === undefined ? true : !!body.read;
      await db.collection('messages').doc(body.id).update({ read });
      return { statusCode: 200, body: JSON.stringify({ id: body.id, read }) };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
}
