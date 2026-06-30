// verification.js — provider verification queue data access + decision recording.
// Parameterised SQL only. Verifying a provider flips its verification_status;
// a doctor also gets nmc_verified when the manual NMC cross-check matched.

import { getPool } from '@khp/db';

const STATUSES = ['pending', 'in_review', 'verified', 'rejected'];

/** Queue rows for a given status, with provider display name joined in. */
async function listQueue(status = 'pending') {
  const s = STATUSES.includes(status) ? status : 'pending';
  try {
    const { rows } = await getPool().query(
      `SELECT v.id, v.provider_type, v.provider_id, v.status, v.nmc_checked,
              v.nmc_match, v.created_at,
              COALESCE(d.display_name, h.name_en) AS provider_name,
              d.nmc_registration_no
         FROM provider_verifications v
         LEFT JOIN doctors d   ON v.provider_type = 'doctor'   AND d.id = v.provider_id
         LEFT JOIN hospitals h ON v.provider_type = 'hospital' AND h.id = v.provider_id
        WHERE v.status = $1 AND v.deleted_at IS NULL
        ORDER BY v.created_at ASC`,
      [s]
    );
    return rows;
  } catch (err) {
    console.error(`verification queue query failed: ${err.message}`);
    return [];
  }
}

/** Single verification item by id. */
async function getItem(id) {
  try {
    const { rows } = await getPool().query(
      `SELECT v.*, COALESCE(d.display_name, h.name_en) AS provider_name,
              d.nmc_registration_no
         FROM provider_verifications v
         LEFT JOIN doctors d   ON v.provider_type = 'doctor'   AND d.id = v.provider_id
         LEFT JOIN hospitals h ON v.provider_type = 'hospital' AND h.id = v.provider_id
        WHERE v.id = $1 AND v.deleted_at IS NULL`,
      [id]
    );
    return rows[0] || null;
  } catch (err) {
    console.error(`verification item query failed: ${err.message}`);
    return null;
  }
}

/**
 * Record a verification decision in a single transaction.
 * @param {object} d { id, providerType, providerId, status, nmcChecked, nmcMatch, notes, verifiedBy }
 */
async function recordDecision(d) {
  if (!STATUSES.includes(d.status)) throw new Error(`Invalid status: ${d.status}`);
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE provider_verifications
          SET status = $1, nmc_checked = $2, nmc_match = $3, notes = $4,
              verified_by = $5, verified_at = now(), updated_at = now()
        WHERE id = $6`,
      [d.status, !!d.nmcChecked, d.nmcMatch, d.notes || null, d.verifiedBy || null, d.id]
    );

    const table = d.providerType === 'doctor' ? 'doctors' : 'hospitals';
    if (table === 'doctors') {
      await client.query(
        `UPDATE doctors
            SET verification_status = $1,
                nmc_verified = ($1 = 'verified' AND $2 = true),
                updated_at = now()
          WHERE id = $3`,
        [d.status, !!d.nmcMatch, d.providerId]
      );
    } else {
      await client.query(
        `UPDATE hospitals SET verification_status = $1, updated_at = now() WHERE id = $2`,
        [d.status, d.providerId]
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export { listQueue, getItem, recordDecision, STATUSES };
