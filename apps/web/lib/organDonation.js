// organDonation.js — awareness pledges (public). Not a legal registration;
// the official registry is Kerala KNOS. Parameterised SQL, fails soft.

import { getPool } from '@khp/db';
import { getSession } from './session.js';

export const ORGANS = ['kidney', 'liver', 'heart', 'lungs', 'cornea', 'all'];
export const KNOS_URL = 'https://knos.org.in/';

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`organ pledge query failed: ${err.message}`); return []; }
}

/** Total pledges made on the platform (counter). */
export function pledgeCount() {
  return run(`SELECT count(*)::int AS n FROM organ_donation_pledges WHERE deleted_at IS NULL`, [])
    .then((r) => (r[0] ? r[0].n : 0));
}

/**
 * Record an awareness pledge. Public — user_id attached when logged in.
 * @returns {{ok:true,id:string}|{error:string}}
 */
export async function createPledge(b) {
  const name = String(b.name || '').trim().slice(0, 120);
  if (name.length < 2) return { error: 'name_required' };
  const organs = Array.isArray(b.organs_pledged)
    ? b.organs_pledged.filter((o) => ORGANS.includes(o)).slice(0, ORGANS.length)
    : [];
  if (organs.length === 0) return { error: 'organs_required' };

  const session = await getSession();
  const userId = session ? session.userId : null;
  const email = String(b.email || '').trim().slice(0, 160) || null;
  const phone = String(b.phone || '').trim().slice(0, 20) || null;
  const knos = String(b.knos_registration_number || '').trim().slice(0, 60) || null;

  const rows = await run(
    `INSERT INTO organ_donation_pledges
       (user_id, name, email, phone, district_id, organs_pledged, knos_registration_number)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING id`,
    [userId, name, email, phone, b.district_id || null, organs, knos]);
  return rows[0] ? { ok: true, id: rows[0].id } : { error: 'pledge_failed' };
}
