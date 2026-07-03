// email.js — transactional email via Resend HTTP API (global fetch, no new package).
// Resend accepts the same API key as its SMTP password (the `re_...` secret in
// SES_SMTP_PASS), so no SMTP client dependency is needed. Without a key/from it
// returns 'simulated' so the pipeline + audit log still run in dev.

function resendKey() {
  const k = process.env.RESEND_API_KEY || process.env.SES_SMTP_PASS || '';
  return k.startsWith('re_') ? k : '';
}

function fromAddress() {
  const addr = process.env.EMAIL_FROM;
  if (!addr) return null;
  const name = process.env.EMAIL_FROM_NAME;
  return name ? `${name} <${addr}>` : addr;
}

/**
 * @param {string} to recipient email
 * @param {string} subject
 * @param {string} html HTML body (falls back to text)
 * @param {string} [text] plain-text body
 * @returns {Promise<{status:'sent'|'failed'|'simulated'|'skipped', error?:string}>}
 */
async function sendEmail(to, subject, html, text) {
  if (!to) return { status: 'skipped', error: 'no_recipient' };
  const key = resendKey();
  const from = fromAddress();
  if (!key || !from) return { status: 'simulated', error: 'no_email_provider' };
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, html: html || text || '', text: text || undefined })
    });
    if (res.ok) return { status: 'sent' };
    const body = await res.text().catch(() => '');
    return { status: 'failed', error: `resend_${res.status}:${body.slice(0, 140)}` };
  } catch (err) {
    return { status: 'failed', error: err.message };
  }
}

export { sendEmail };
