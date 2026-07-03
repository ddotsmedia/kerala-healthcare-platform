// session.js — read the authenticated session from the access-token cookie.

import { cookies } from 'next/headers';
import { sessionFromToken, ACCESS_COOKIE } from '@khp/auth';

/** @returns {Promise<{userId:string, role:string}|null>} */
export async function getSession() {
  const c = (await cookies()).get(ACCESS_COOKIE);
  return c ? sessionFromToken(c.value) : null;
}
