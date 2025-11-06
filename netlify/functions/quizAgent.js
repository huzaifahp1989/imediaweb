import { getAdmin } from './_firebaseAdmin.js';

export async function handler(event) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { admin } = getAdmin();
    const authHeader = event.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return { statusCode: 401, body: 'Missing auth token' };

    const decoded = await admin.auth().verifyIdToken(token);
    const email = (decoded.email || '').toLowerCase();
    // Allow any authenticated user for AI assistance
    if (!email) return { statusCode: 403, body: 'Forbidden' };

    const body = JSON.parse(event.body || '{}');
    const topic = String(body.topic || '').trim();
    const subject = String(body.subject || '').trim() || 'Mixed';
    const difficulty = String(body.difficulty || '').trim() || 'mixed';
    const count = Math.max(1, Math.min(20, parseInt(body.count || '5', 10)));

    const apiKey = process.env.OPENAI_API_KEY || '';
    let questions = [];

    if (apiKey) {
      try {
        const prompt = `You are an assistant generating Islamic quiz questions for children. Topic: ${topic}. Subject: ${subject}. Difficulty: ${difficulty}. Generate ${count} multiple-choice questions. Return JSON array where each item has keys: question (string), options (array of 4 strings), answer (string equal to one of options), category (use subject), difficulty (use difficulty). Keep wording concise and age-appropriate.`;
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You strictly output valid JSON only.' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
          }),
        });
        if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content || '[]';
        questions = JSON.parse(text);
      } catch (err) {
        // Fallback to simple generated questions
        questions = Array.from({ length: count }).map((_, i) => ({
          question: `Sample question ${i + 1} about ${topic || subject}`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          answer: 'Option A',
          category: subject,
          difficulty,
        }));
      }
    } else {
      // No API key: return mock questions
      questions = Array.from({ length: count }).map((_, i) => ({
        question: `Sample question ${i + 1} about ${topic || subject}`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        answer: 'Option A',
        category: subject,
        difficulty,
      }));
    }

    return { statusCode: 200, body: JSON.stringify({ questions }) };
  } catch (err) {
    const message = err?.message || 'Agent error';
    return { statusCode: 500, body: JSON.stringify({ error: message }) };
  }
}
