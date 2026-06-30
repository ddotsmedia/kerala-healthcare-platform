// auth.js — role guard for admin API routes.
// PLACEHOLDER until Phase 2 session auth: the caller's role is read from the
// `x-khp-role` header. Replace with real session/JWT role resolution in Phase 2.

const ALLOWED = ['platform_admin', 'verification_agent'];

/**
 * @param {Request} request
 * @returns {string|null} the role if allowed, else null (caller returns 403).
 */
function requireAdminRole(request) {
  const role = request.headers.get('x-khp-role');
  return ALLOWED.includes(role) ? role : null;
}

export { requireAdminRole, ALLOWED };
