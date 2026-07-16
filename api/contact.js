// POST /api/contact — relay contact form submissions to email via Resend.
// Env vars:
//   RESEND_API_KEY  (required) — Resend API key
//   CONTACT_TO      (optional) — recipient, default furukawa@887.co.jp
//   CONTACT_FROM    (optional) — verified sender, default onboarding@resend.dev
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const name = String(body.name || '').trim().slice(0, 200);
  const organization = String(body.organization || '').trim().slice(0, 200);
  const email = String(body.email || '').trim().slice(0, 200);
  const message = String(body.message || '').trim().slice(0, 5000);
  const updates = body.updates === true;
  const lang = body.lang === 'ja' ? 'ja' : 'en';

  // Honeypot: hidden field filled in => bot. Pretend success.
  if (String(body.website || '').trim() !== '') {
    return res.status(200).json({ ok: true });
  }

  if (!name || !email || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Missing or invalid fields' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'Mail service is not configured' });
  }

  const text = [
    'New inquiry via ippon-nippon.com contact form',
    '',
    `Name:         ${name}`,
    `Affiliation:  ${organization || '-'}`,
    `Email:        ${email}`,
    `Keep updated: ${updates ? 'YES' : 'no'}`,
    `Form language: ${lang}`,
    '',
    'Message:',
    message,
    '',
    '--',
    'Privacy Policy agreed (required checkbox).',
  ].join('\n');

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM || 'IPPON NIPPON <onboarding@resend.dev>',
      to: [process.env.CONTACT_TO || 'furukawa@887.co.jp'],
      reply_to: email,
      subject: `[ippon-nippon.com] Contact: ${name}`,
      text,
    }),
  });

  if (!r.ok) {
    console.error('Resend error', r.status, await r.text());
    return res.status(502).json({ error: 'Failed to send' });
  }

  return res.status(200).json({ ok: true });
};
