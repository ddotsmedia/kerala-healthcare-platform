// email.js — transactional email wrapper. A real SMTP transport (SES) needs an
// SMTP client and is deferred to infra (no new npm package added here). Without
// SES_SMTP_HOST this returns 'simulated' so the pipeline + audit log still run.

/**
 * @returns {Promise<{status:'sent'|'failed'|'simulated'|'skipped', error?:string}>}
 */
async function sendEmail(to, subject, body) {
  if (!to) return { status: 'skipped', error: 'no_recipient' };
  if (!process.env.SES_SMTP_HOST) return { status: 'simulated', error: 'no_smtp_configured' };
  // Real SMTP send wired in infra (Phase 2 deployment). Treated as simulated
  // until then to avoid adding an SMTP dependency.
  return { status: 'simulated', error: 'smtp_transport_pending' };
}

export { sendEmail };
