import { getAdmin } from './_firebaseAdmin.js';

export async function handler(event) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

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
    if (!allowed) return { statusCode: 403, body: 'Forbidden' };

    const body = JSON.parse(event.body || '{}');
    let targetEmail = String(body.email || '').toLowerCase();
    let targetUid = String(body.uid || '').trim();
    if (!targetEmail && !targetUid) {
      return { statusCode: 400, body: 'Provide email or uid' };
    }

    // Resolve uid if email provided
    if (!targetUid && targetEmail) {
      try {
        const userRecord = await admin.auth().getUserByEmail(targetEmail);
        targetUid = userRecord.uid;
      } catch (e) {
        return { statusCode: 404, body: JSON.stringify({ error: `No auth user for ${targetEmail}` }) };
      }
    }

    // Delete from Auth
    try {
      await admin.auth().deleteUser(targetUid);
    } catch (e) {
      return { statusCode: 500, body: JSON.stringify({ error: `Auth delete failed: ${e.message}` }) };
    }

    // Best-effort: delete Firestore profile
    try {
      await db.collection('users').doc(targetUid).delete();
    } catch {}

    return { statusCode: 200, body: JSON.stringify({ ok: true, uid: targetUid, email: targetEmail || null }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
}

