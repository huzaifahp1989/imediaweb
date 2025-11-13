import { getAdmin } from './_firebaseAdmin.js'

export async function handler(event) {
  try {
    const { admin, db } = getAdmin()
    const authHeader = event.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    let userEmail = null
    try {
      if (token) {
        const decoded = await admin.auth().verifyIdToken(token)
        userEmail = (decoded.email || '').toLowerCase()
      }
    } catch {}

    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' }
    }

    const body = JSON.parse(event.body || '{}')
    const storyId = String(body.storyId || '')
    const answers = Array.isArray(body.answers) ? body.answers : []
    const score = Number(body.score || 0)
    const meta = body.meta || {}
    if (!storyId || answers.length === 0) {
      return { statusCode: 400, body: 'Invalid payload' }
    }

    const doc = {
      storyId,
      answers,
      score,
      userEmail: userEmail || meta.email || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      meta
    }
    const ref = await db.collection('quizAnswers').add(doc)
    return { statusCode: 200, body: JSON.stringify({ id: ref.id }) }
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error' }) }
  }
}
