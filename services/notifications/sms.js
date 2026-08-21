// sms.js — SMS gateway wrapper. Uses global fetch (no new package).
// Supports Fast2SMS (OTP + transactional routes) when configured, and a generic
// JSON gateway otherwise. Without OTP_SMS_GATEWAY_URL it returns 'simulated' so
// the pipeline + audit log are still exercised in dev. See BLOCKERS.md.

/** Fast2SMS is selected by OTP_SMS_PROVIDER=fast2sms or a fast2sms gateway URL. */
function isFast2Sms(url) {
  return (process.env.OTP_SMS_PROVIDER || '').toLowerCase() === 'fast2sms'
    || /fast2sms/i.test(url || '');
}

/** Fast2SMS expects a bare 10-digit Indian number (strip +91 / 91 / leading 0). */
function normalizeIndianMobile(m) {
  const digits = String(m || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits.slice(-10);
}

async function fast2smsPost(url, key, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { authorization: key || '', 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await res.json().catch(() => ({}));
  if (result.return === false) return { status: 'failed', error: result.message || `fast2sms_${res.status}` };
  return res.ok ? { status: 'sent' } : { status: 'failed', error: `fast2sms_${res.status}` };
}

/**
 * Send an OTP code. Uses the Fast2SMS 'otp' route when configured.
 * @returns {Promise<{status:'sent'|'failed'|'simulated'|'skipped', error?:string}>}
 */
async function sendOtp(mobile, otp) {
  if (!mobile) return { status: 'skipped', error: 'no_recipient' };
  const url = process.env.OTP_SMS_GATEWAY_URL;
  const key = process.env.OTP_SMS_API_KEY;
  if (!url) return { status: 'simulated', error: 'no_gateway_configured' };
  try {
    if (isFast2Sms(url)) {
      return await fast2smsPost(url, key, {
        route: 'otp', variables_values: String(otp), numbers: normalizeIndianMobile(mobile), flash: 0
      });
    }
    return await sendSms(mobile, `Kerala Health Portal OTP: ${otp}`);
  } catch (err) {
    return { status: 'failed', error: err.message };
  }
}

/**
 * Send a free-text transactional SMS.
 * @returns {Promise<{status:'sent'|'failed'|'simulated'|'skipped', error?:string}>}
 */
async function sendSms(to, message) {
  if (!to) return { status: 'skipped', error: 'no_recipient' };
  const url = process.env.OTP_SMS_GATEWAY_URL;
  const key = process.env.OTP_SMS_API_KEY;
  if (!url) return { status: 'simulated', error: 'no_gateway_configured' };
  try {
    if (isFast2Sms(url)) {
      return await fast2smsPost(url, key, {
        route: 'q', message, language: 'english', numbers: normalizeIndianMobile(to), flash: 0
      });
    }
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

export { sendSms, sendOtp, normalizeIndianMobile };
