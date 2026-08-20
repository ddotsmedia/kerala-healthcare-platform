// Fire-and-forget profile-view logging for doctor analytics. Never blocks or
// throws into the render path.

import { getPool } from '@khp/db';

/**
 * Log a single doctor profile view.
 * @param {string} providerId doctors.id
 * @param {{ip?: string, userId?: string, locale?: string}} [meta]
 */
export function logProfileView(providerId, meta = {}) {
  if (!providerId) return;
  const ip = meta.ip && /^[0-9a-f.:]+$/i.test(meta.ip) ? meta.ip : null;
  getPool()
    .query(
      `INSERT INTO provider_profile_views (provider_id, viewer_ip, viewer_user_id, locale)
       VALUES ($1, $2, $3, $4)`,
      [providerId, ip, meta.userId || null, meta.locale || null]
    )
    .catch((err) => console.error(`logProfileView failed: ${err.message}`));
}
