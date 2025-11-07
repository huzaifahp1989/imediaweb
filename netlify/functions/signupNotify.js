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

    // Verify the token belongs to the newly signed-up user
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;
    const emailFromToken = (decoded.email || '').toLowerCase();
    if (!uid || !emailFromToken) return { statusCode: 400, body: 'Invalid user token' };

    const body = JSON.parse(event.body || '{}');
    const fullName = String(body.fullName || '').trim();
    const emailFromClient = String(body.email || emailFromToken).toLowerCase();

    // Prevent spoofing: ensure client email matches token email
    if (emailFromClient !== emailFromToken) {
      return { statusCode: 403, body: 'Email mismatch' };
    }

    // Write/merge user in Firestore users collection (backend authoritative)
    const userRef = db.collection('users').doc(uid);
    await userRef.set({
      uid,
      email: emailFromToken,
      fullName,
      role: 'user',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // Attempt to notify admin via email if a provider is configured
    const adminEmail = process.env.SIGNUP_ADMIN_EMAIL || 'imedia786@gmail.com';
    const siteName = process.env.SITE_NAME || 'Islam Kids Zone';
    let emailed = false;
    let provider = '';

    // Resend provider
    const resendKey = process.env.RESEND_API_KEY || '';
    if (resendKey) {
      provider = 'resend';
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendKey}` },
          body: JSON.stringify({
            from: `no-reply@${(process.env.ADMIN_EMAIL_DOMAIN || 'example.com').replace(/^@/, '')}`,
            to: [adminEmail],
            subject: `[${siteName}] New signup: ${emailFromToken}`,
            html: `<p>A new user signed up:</p><ul><li>Email: <strong>${emailFromToken}</strong></li><li>Name: ${fullName || '(not provided)'}</li><li>UID: ${uid}</li></ul>`,
          }),
        });
        emailed = res.ok;
      } catch {}
    }

    // SendGrid provider
    if (!emailed) {
      const sgKey = process.env.SENDGRID_API_KEY || '';
      if (sgKey) {
        provider = 'sendgrid';
        try {
          const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sgKey}` },
            body: JSON.stringify({
              personalizations: [{ to: [{ email: adminEmail }] }],
              from: { email: `no-reply@${(process.env.ADMIN_EMAIL_DOMAIN || 'example.com').replace(/^@/, '')}` },
              subject: `[${siteName}] New signup: ${emailFromToken}`,
              content: [{ type: 'text/html', value: `<p>A new user signed up:</p><ul><li>Email: <strong>${emailFromToken}</strong></li><li>Name: ${fullName || '(not provided)'}</li><li>UID: ${uid}</li></ul>` }],
            }),
          });
          emailed = res.ok;
        } catch {}
      }
    }

    const bodyOut = { ok: true, notified: emailed, provider: emailed ? provider : null };
    return { statusCode: 200, body: JSON.stringify(bodyOut) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
}

