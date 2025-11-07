import { getAdmin } from './_firebaseAdmin.js';

export async function handler(event) {
  try {
    const { admin } = getAdmin();

    const authHeader = event.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return { statusCode: 401, body: 'Missing auth token' };

    const decoded = await admin.auth().verifyIdToken(token);
    const requesterEmail = (decoded.email || '').toLowerCase();
    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
    const adminDomain = (process.env.ADMIN_EMAIL_DOMAIN || '').toLowerCase().replace(/^@/, '');

    let allowed = true;
    if (adminEmail) allowed = requesterEmail === adminEmail;
    if (adminDomain) allowed = allowed || requesterEmail.endsWith(`@${adminDomain}`);
    if (!allowed) {
      return { statusCode: 403, body: 'Forbidden' };
    }

    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const body = JSON.parse(event.body || '{}');
    const email = String(body.email || '').trim().toLowerCase();
    if (!email) {
      return { statusCode: 400, body: 'Email is required' };
    }

    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      return {
        statusCode: 200,
        body: JSON.stringify({ exists: true, uid: userRecord.uid, email: userRecord.email }),
      };
    } catch (e) {
      // If user not found, Firebase Admin throws error-code 'auth/user-not-found'
      if (e?.code === 'auth/user-not-found') {
        return { statusCode: 200, body: JSON.stringify({ exists: false }) };
      }
      return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
    }
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
}

