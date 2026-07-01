// session.js — cookie names + stateless session extraction from an access token.

import { verifyAccess } from './jwt.js';

const ACCESS_COOKIE = 'khp_access';
const REFRESH_COOKIE = 'khp_refresh';

/**
 * Resolve a session from a raw access token (JWT). Stateless — no DB hit.
 * @returns {{userId:string, role:string} | null}
 */
function sessionFromToken(token) {
  const res = verifyAccess(token);
  if (!res.valid) return null;
  return { userId: res.payload.sub, role: res.payload.role };
}

/** Extract the bearer token from an Authorization header, if present. */
function bearer(headerValue) {
  if (!headerValue) return null;
  const m = /^Bearer\s+(.+)$/i.exec(headerValue);
  return m ? m[1] : null;
}

export { sessionFromToken, bearer, ACCESS_COOKIE, REFRESH_COOKIE };
