// session.js — read the authenticated session from the access-token cookie.

import { cookies } from 'next/headers';
import { sessionFromToken, ACCESS_COOKIE } from '@khp/auth';

/** @returns {{userId:string, role:string}|null} */
export function getSession() {
  const c = cookies().get(ACCESS_COOKIE);
  return c ? sessionFromToken(c.value) : null;
}
