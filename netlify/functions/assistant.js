import { getSupabase } from './_supabaseAdmin.js'

// Enhanced system prompts with better context about the website
function getSystemPrompt(mode) {
  return mode === 'admin'
    ? `You are an admin assistant for Islam Kids Zone, an Islamic educational website for children. 

**Website Features:**
- Stories: Islamic stories and narratives for kids
- Games: Educational Islamic games (Quran, Hadith, Seerah, Fiqh games)
- Quizzes: Interactive Islamic knowledge quizzes
- Quran: Full Quran with word-by-word translation and audio
- Learning Paths: Structured Islamic education courses
- Creative Corner: Coloring pages, drawing board, poetry writing
- Videos & Audio: Educational Islamic multimedia content
- Challenges & Leaderboard: Gamified learning with points system

**Admin Pages Available:**
- AdminBanners: Manage homepage banners and promotional content
- AdminStories: Create, edit, and manage Islamic stories
- AdminQuizManager: Create and manage quizzes and questions
- AdminUsers: View and manage user accounts and roles
- AdminVideos: Manage video content
- AdminAudio: Manage audio content
- AdminMedia: Manage media files
- AdminSettings: Configure site settings
- AdminMessages: View and respond to user messages
- AdminGameSettings: Configure game settings and rewards

When users ask about editing content, guide them to the specific admin page with clear steps. Keep responses conversational, helpful, and mobile-friendly.`
    : `You are a helpful AI assistant for Islam Kids Zone, an Islamic educational website designed for children.

**About the Site:**
Islam Kids Zone is a comprehensive Islamic education platform offering:
- Educational games teaching Quran, Hadith, Seerah, and Fiqh
- Interactive stories about Prophets, Sahabah, and Islamic values
- Full Quran with word-by-word translations and audio
- Quizzes to test Islamic knowledge
- Creative activities like coloring pages and poetry writing
- Videos and audio content for Islamic learning
- A points-based reward system to encourage learning
- Learning paths for structured Islamic education

**Your Role:**
Answer questions about:
- Islamic teachings (in an age-appropriate, educational way)
- How to use the website features
- Available educational content and games
- Learning resources for kids
- Technical help navigating the site

Keep responses concise, friendly, educational, and appropriate for children and parents.`;
}

export async function handler(event) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
    // Initialize Firebase Admin. If credentials are missing, attempt OpenAI reply in local dev
    let supabase;
    try {
      ({ supabase } = getSupabase());
    } catch (initErr) {
      const apiKey = process.env.OPENAI_API_KEY || '';
      const body = JSON.parse(event.body || '{}');
      const messages = Array.isArray(body.messages) ? body.messages : [];
      const mode = String(body.mode || 'chat');

      if (!apiKey) {
        const reply = 'AI not configured. Set OPENAI_API_KEY to enable chat. For full auth, also set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.';
        return { statusCode: 200, body: JSON.stringify({ reply }) };
      }

      if (!messages.length) {
        const reply = 'No messages provided.';
        return { statusCode: 200, body: JSON.stringify({ reply }) };
      }

      try {
        const system = getSystemPrompt(mode);

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
        if (!res.ok) {
          let messageText = `OpenAI error: ${res.status}`;
          let errData = null;
          try {
            errData = await res.json();
            if (errData?.error?.message) messageText = `OpenAI ${res.status}: ${errData.error.message}`;
          } catch {}
          if (res.status === 429) {
            const raw = String(errData?.error?.message || '');
            const type = /quota/i.test(raw) ? 'quota' : 'rate_limit';
            const baseMsg = type === 'quota'
              ? 'Assistant is temporarily unavailable: OpenAI quota exceeded for this API key. Please check plan and billing or use a different key.'
              : 'Too many requests to OpenAI right now. Please slow down and retry shortly.';
            // Admin-mode fallback suggestions
            let extra = '';
            try {
              const lastUser = messages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
              const text = String(lastUser || '').toLowerCase();
              const suggestions = [];
              if (mode === 'admin') {
                if (/banner|carousel|hero|promo/.test(text)) {
                  suggestions.push('AdminBanners → edit banner → save changes.');
                }
                if (/story|stories|article|post/.test(text)) {
                  suggestions.push('AdminStories → find story → edit → publish.');
                }
                if (/quiz|question|trivia/.test(text)) {
                  suggestions.push('AdminQuizManager → create/edit quiz → save.');
                }
                if (/user|account|role|permission/.test(text)) {
                  suggestions.push('AdminUsers → search user → update role/permissions.');
                }
              }
              if (suggestions.length) {
                extra = `\n\nIn the meantime, try: ${suggestions.join(' • ')}`;
              }
            } catch {}
            const friendly = `${baseMsg}${extra}`;
            return {
              statusCode: 200,
              body: JSON.stringify({
                reply: friendly,
                error: { code: 429, type, message: raw || baseMsg, doc: 'https://platform.openai.com/docs/guides/error-codes/api-errors.' }
              })
            };
          }
          throw new Error(messageText);
        }
        const data = await res.json();
        const reply = data?.choices?.[0]?.message?.content || '';
        return { statusCode: 200, body: JSON.stringify({ reply }) };
      } catch (err) {
        console.error('Assistant OpenAI (dev fallback) error:', err?.message || err);
        const reply = `Assistant error: ${err?.message || 'unknown error'}`;
        return { statusCode: 200, body: JSON.stringify({ reply }) };
      }
    }
    const authHeader = event.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return { statusCode: 401, body: 'Missing auth token' };

    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData?.user) return { statusCode: 401, body: 'Invalid token' }
    const email = String(userData.user.email || '').toLowerCase()
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
        const system = getSystemPrompt(mode);

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
        if (!res.ok) {
          let messageText = `OpenAI error: ${res.status}`;
          let errData = null;
          try {
            errData = await res.json();
            if (errData?.error?.message) messageText = `OpenAI ${res.status}: ${errData.error.message}`;
          } catch {}
          if (res.status === 429) {
            const raw = String(errData?.error?.message || '');
            const type = /quota/i.test(raw) ? 'quota' : 'rate_limit';
            const baseMsg = type === 'quota'
              ? 'Assistant is temporarily unavailable: OpenAI quota exceeded for this API key. Please check plan and billing or use a different key.'
              : 'Too many requests to OpenAI right now. Please slow down and retry shortly.';
            // Admin-mode fallback suggestions
            let extra = '';
            try {
              const lastUser = messages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
              const text = String(lastUser || '').toLowerCase();
              const suggestions = [];
              if (mode === 'admin') {
                if (/banner|carousel|hero|promo/.test(text)) {
                  suggestions.push('AdminBanners → edit banner → save changes.');
                }
                if (/story|stories|article|post/.test(text)) {
                  suggestions.push('AdminStories → find story → edit → publish.');
                }
                if (/quiz|question|trivia/.test(text)) {
                  suggestions.push('AdminQuizManager → create/edit quiz → save.');
                }
                if (/user|account|role|permission/.test(text)) {
                  suggestions.push('AdminUsers → search user → update role/permissions.');
                }
              }
              if (suggestions.length) {
                extra = `\n\nIn the meantime, try: ${suggestions.join(' • ')}`;
              }
            } catch {}
            const friendly = `${baseMsg}${extra}`;
            return {
              statusCode: 200,
              body: JSON.stringify({
                reply: friendly,
                error: { code: 429, type, message: raw || baseMsg, doc: 'https://platform.openai.com/docs/guides/error-codes/api-errors.' }
              })
            };
          }
          throw new Error(messageText);
        }
        const data = await res.json();
        reply = data?.choices?.[0]?.message?.content || '';
      } catch (err) {
        console.error('Assistant OpenAI (admin path) error:', err?.message || err);
        reply = `Assistant error: ${err?.message || 'unknown error'}`;
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
