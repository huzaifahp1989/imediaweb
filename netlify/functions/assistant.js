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
    if (!email) return { statusCode: 403, body: 'Forbidden' };
    const adminEmail = String(process.env.ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL || '').toLowerCase();
    if (adminEmail && email !== adminEmail) {
      return { statusCode: 403, body: 'Admins only' };
    }

    const body = JSON.parse(event.body || '{}');
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const mode = String(body.mode || 'chat');

    const apiKey = process.env.OPENAI_API_KEY || '';
    let reply = '';

    if (apiKey && messages.length) {
      try {
        const system = mode === 'admin'
          ? 'You are an admin assistant for the Islam Kids Zone website. Answer conversationally and when the user asks to edit site content, suggest the specific admin page to use (e.g., AdminBanners, AdminStories, AdminQuizManager, AdminUsers) and outline steps. Do not perform destructive actions. Keep responses short and mobile-friendly.'
          : 'You are a helpful assistant for Islam Kids Zone. Keep responses concise and friendly.';

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: system },
              ...messages,
            ],
            temperature: 0.7,
          }),
        });
        if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
        const data = await res.json();
        reply = data?.choices?.[0]?.message?.content || '';
      } catch (err) {
        reply = 'Assistant is temporarily unavailable. Please try again or use the admin pages directly.';
      }
    } else {
      reply = 'AI not configured. Set OPENAI_API_KEY to enable chat. In the meantime, use Admin pages like AdminStories, AdminBanners, and AdminQuizManager to edit content.';
    }

    return { statusCode: 200, body: JSON.stringify({ reply }) };
  } catch (err) {
    const message = err?.message || 'Assistant error';
    return { statusCode: 500, body: JSON.stringify({ error: message }) };
  }
}
