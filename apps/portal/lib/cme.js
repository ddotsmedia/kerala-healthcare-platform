// cme.js — doctor CME credit tracking (portal). Scoped to currentDoctorId.
// Parameterised SQL.

import { getPool } from '@khp/db';

/** MCI/NMC guidance is ~30 credit hours/year — indicative only (see disclaimer). */
export const ANNUAL_REQUIREMENT = 30;
export const CME_CATEGORIES = ['clinical', 'research', 'ethics', 'professional', 'general'];

async function rows(text, values) {
  return (await getPool().query(text, values)).rows;
}

export function listCredits(providerId) {
  return rows(
    `SELECT id, event_id, title, organiser, date, credits, certificate_url, category, is_verified
       FROM cme_credits
      WHERE provider_id=$1 AND deleted_at IS NULL
      ORDER BY date DESC, created_at DESC`,
    [providerId]
  );
}

/** Totals for a calendar year: overall, by category, verified. */
export async function yearSummary(providerId, year) {
  const y = parseInt(year, 10) || new Date().getFullYear();
  const [total] = await rows(
    `SELECT coalesce(sum(credits),0)::numeric AS total,
            coalesce(sum(credits) FILTER (WHERE is_verified),0)::numeric AS verified
       FROM cme_credits
      WHERE provider_id=$1 AND deleted_at IS NULL AND extract(year FROM date)=$2`,
    [providerId, y]
  );
  const byCategory = await rows(
    `SELECT category, coalesce(sum(credits),0)::numeric AS credits
       FROM cme_credits
      WHERE provider_id=$1 AND deleted_at IS NULL AND extract(year FROM date)=$2
      GROUP BY category ORDER BY credits DESC`,
    [providerId, y]
  );
  return {
    year: y,
    total: Number(total ? total.total : 0),
    verified: Number(total ? total.verified : 0),
    byCategory: byCategory.map((c) => ({ category: c.category, credits: Number(c.credits) }))
  };
}

export async function addCredit(providerId, p = {}) {
  const title = String(p.title || '').trim();
  const credits = parseFloat(p.credits);
  if (!providerId || !title) return { error: 'title_required' };
  if (!(credits > 0)) return { error: 'credits_required' };
  if (!p.date) return { error: 'date_required' };
  const category = CME_CATEGORIES.includes(p.category) ? p.category : 'general';
  const [r] = await rows(
    `INSERT INTO cme_credits (provider_id, title, organiser, date, credits, certificate_url, category)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
    [providerId, title, String(p.organiser || '').trim() || null, p.date,
      Math.min(999, credits), String(p.certificateUrl || '').trim() || null, category]
  );
  return { id: r.id };
}

export async function deleteCredit(providerId, id) {
  const r = await rows(
    `UPDATE cme_credits SET deleted_at=now()
      WHERE id=$2 AND provider_id=$1 AND deleted_at IS NULL RETURNING id`,
    [providerId, id]
  );
  return r.length ? { id: r[0].id } : { error: 'not_found' };
}
