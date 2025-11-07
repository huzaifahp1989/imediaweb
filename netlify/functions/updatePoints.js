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
    const uid = decoded.uid;
    const email = (decoded.email || '').toLowerCase();
    if (!uid || !email) return { statusCode: 400, body: 'Invalid user token' };

    const body = JSON.parse(event.body || '{}');
    const gameType = String(body.game_type || '').trim();
    const pointsAwarded = Number(body.points_awarded || body.awarded || 0);
    const isPerfect = Boolean(body.isPerfect || false);
    const metadata = body.metadata || {};

    if (!Number.isFinite(pointsAwarded) || pointsAwarded < 0) {
      return { statusCode: 400, body: 'Invalid points_awarded' };
    }

    const userRef = db.collection('users').doc(uid);
    const snap = await userRef.get();
    const existing = snap.exists ? snap.data() : null;
    const currentPoints = Number(existing?.points || 0);
    const maxCap = 1500;
    const newTotal = Math.min(currentPoints + pointsAwarded, maxCap);

    await userRef.set({
      uid,
      email,
      points: newTotal,
      lastAward: {
        game_type: gameType || null,
        points_awarded: pointsAwarded,
        perfect: isPerfect,
        at: admin.firestore.FieldValue.serverTimestamp(),
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: existing?.createdAt || admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // Optional: record a game score entry for auditing
    if (gameType) {
      try {
        const scoresCol = userRef.collection('game_scores');
        await scoresCol.add({
          game_type: gameType,
          points_awarded: pointsAwarded,
          perfect: isPerfect,
          at: admin.firestore.FieldValue.serverTimestamp(),
          meta: metadata,
        });
      } catch (_) {
        // non-fatal
      }
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true, new_total: newTotal, points_awarded: pointsAwarded }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
}

