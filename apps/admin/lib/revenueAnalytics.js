// revenueAnalytics.js — P-G5 manually-recorded revenue. Read + write for the
// admin. Payment integration deferred. Parameterised SQL.

import { getPool } from '@khp/db';

async function rows(text, values) {
  return (await getPool().query(text, values)).rows;
}

export const REVENUE_TYPES = ['featured_listing', 'premium_subscription', 'job_post', 'bulk_import', 'api_access'];

export async function recordRevenue({ type, amountInr, entityId, entityType, notes } = {}) {
  const amount = parseInt(amountInr, 10);
  if (!REVENUE_TYPES.includes(type)) return { error: 'bad_type' };
  if (!Number.isInteger(amount) || amount <= 0) return { error: 'bad_amount' };
  const [r] = await rows(
    `INSERT INTO revenue_events (type, amount_inr, entity_id, entity_type, notes)
     VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    [type, amount, /^[0-9a-f-]{36}$/i.test(String(entityId || '')) ? entityId : null,
      entityType ? String(entityType).slice(0, 50) : null, notes ? String(notes).slice(0, 500) : null]
  );
  return { id: r.id };
}

export async function deleteRevenue(id) {
  const r = await rows(`UPDATE revenue_events SET deleted_at=now() WHERE id=$1 AND deleted_at IS NULL RETURNING id`, [id]);
  return r.length ? { id: r[0].id } : { error: 'not_found' };
}

/** This-month total, all-time total, and this-month breakdown by type. */
export async function getRevenueSummary() {
  const [tot] = await rows(
    `SELECT
       coalesce(sum(amount_inr) FILTER (WHERE date_trunc('month',created_at)=date_trunc('month',now())),0)::bigint AS month_total,
       coalesce(sum(amount_inr),0)::bigint AS all_time
     FROM revenue_events WHERE deleted_at IS NULL`);
  const byType = await rows(
    `SELECT type, coalesce(sum(amount_inr),0)::bigint AS amount, count(*)::int AS n
       FROM revenue_events
      WHERE deleted_at IS NULL AND date_trunc('month',created_at)=date_trunc('month',now())
      GROUP BY type ORDER BY amount DESC`);
  return {
    monthTotal: Number(tot ? tot.month_total : 0),
    allTime: Number(tot ? tot.all_time : 0),
    byType: byType.map((r) => ({ type: r.type, amount: Number(r.amount), n: r.n }))
  };
}

/** Monthly revenue totals for the last `months` months (MRR trend). */
export async function getMonthlyTrend(months = 12) {
  const m = Math.max(1, Math.min(36, parseInt(months, 10) || 12));
  return (await rows(
    `SELECT to_char(gs.mon,'YYYY-MM') AS month, coalesce(r.amount,0)::bigint AS amount
       FROM generate_series(date_trunc('month',now()) - make_interval(months => $1 - 1),
                            date_trunc('month',now()), interval '1 month') gs(mon)
       LEFT JOIN (SELECT date_trunc('month',created_at) AS mon, sum(amount_inr) AS amount
                    FROM revenue_events WHERE deleted_at IS NULL GROUP BY 1) r ON r.mon = gs.mon
      ORDER BY gs.mon`, [m])).map((x) => ({ month: x.month, amount: Number(x.amount) }));
}

export function listRecent(limit = 20) {
  return rows(
    `SELECT id, type, amount_inr, entity_type, notes, created_at
       FROM revenue_events WHERE deleted_at IS NULL
      ORDER BY created_at DESC LIMIT $1`, [Math.max(1, Math.min(100, limit))]);
}
