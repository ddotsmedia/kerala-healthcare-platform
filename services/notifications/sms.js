// sms.js — SMS gateway wrapper. Uses global fetch (no new package).
// Without OTP_SMS_GATEWAY_URL configured, returns 'simulated' so the pipeline
// and audit log are still exercised in dev. See BLOCKERS.md.

/**
 * @returns {Promise<{status:'sent'|'failed'|'simulated'|'skipped', error?:string}>}
 */
async function sendSms(to, message) {
  if (!to) return { status: 'skipped', error: 'no_recipient' };
  const url = process.env.OTP_SMS_GATEWAY_URL;
  const key = process.env.OTP_SMS_API_KEY;
  if (!url) return { status: 'simulated', error: 'no_gateway_configured' };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key || ''}` },
      body: JSON.stringify({ to, message })
    });
    return res.ok ? { status: 'sent' } : { status: 'failed', error: `gateway_${res.status}` };
  } catch (err) {
    return { status: 'failed', error: err.message };
  }
}

export { sendSms };
