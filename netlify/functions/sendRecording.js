export async function handler(event) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const body = JSON.parse(event.body || '{}');
    const fullName = String(body.fullName || '').trim();
    const age = Number(body.age || 0);
    const parentConsent = !!body.parentConsent;
    const category = String(body.category || '').trim();
    const fileUrl = String(body.fileUrl || '').trim();
    const notes = String(body.notes || '').trim();

    if (!fullName || !age || !category || !fileUrl) {
      return { statusCode: 400, body: 'Missing required fields' };
    }
    if (age < 13 && !parentConsent) {
      return { statusCode: 400, body: 'Parent consent required for under 13' };
    }

    const adminEmail = 'imediac786@gmail.com';
    const siteName = process.env.SITE_NAME || 'Islam Kids Zone';
    const domain = (process.env.ADMIN_EMAIL_DOMAIN || 'example.com').replace(/^@/, '');

    let emailed = false;
    let provider = '';

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc;">
        <h2 style="color:#0ea5e9; margin:0 0 12px;">New Kids Recording Submission</h2>
        <table style="width:100%; background:#fff; border:1px solid #e5e7eb; border-radius:8px; padding:16px;">
          <tr><td><strong>Name:</strong></td><td>${fullName}</td></tr>
          <tr><td><strong>Age:</strong></td><td>${age}</td></tr>
          <tr><td><strong>Parent Consent:</strong></td><td>${parentConsent ? 'Yes' : 'No'}</td></tr>
          <tr><td><strong>Category:</strong></td><td>${category}</td></tr>
          <tr><td><strong>Notes:</strong></td><td>${notes || '-'}</td></tr>
          <tr><td><strong>File:</strong></td><td><a href="${fileUrl}">${fileUrl}</a></td></tr>
        </table>
      </div>`;

    const resendKey = process.env.RESEND_API_KEY || '';
    if (resendKey) {
      provider = 'resend';
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendKey}` },
          body: JSON.stringify({
            from: `no-reply@${domain}`,
            to: [adminEmail],
            subject: `[${siteName}] Kids Recording Submission`,
            html,
          }),
        });
        emailed = res.ok;
      } catch {}
    }

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
              from: { email: `no-reply@${domain}` },
              subject: `[${siteName}] Kids Recording Submission`,
              content: [{ type: 'text/html', value: html }],
            }),
          });
          emailed = res.ok;
        } catch {}
      }
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true, notified: emailed, provider: emailed ? provider : null }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
}
