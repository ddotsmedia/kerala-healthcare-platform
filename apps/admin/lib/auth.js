// auth.js — role guard for admin routes/pages, backed by the JWT session.
// Only platform_admin and verification_agent may access admin surfaces.

import { getSession } from './session.js';

const ALLOWED = ['platform_admin', 'verification_agent'];

/**
 * @returns {string|null} the role if the session is an allowed admin role, else null.
 * (Signature keeps an optional request arg for call-site compatibility; the
 * session is read from the cookie.)
 */
async function requireAdminRole() {
  const s = await getSession();
  return s && ALLOWED.includes(s.role) ? s.role : null;
}

export { requireAdminRole, ALLOWED };
