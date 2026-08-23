// dashboard.js — live stats, activity feed, 30-day trends, system health.
// All reads fail soft (return zeros/[]), so the dashboard always renders.

import net from 'node:net';
import { getPool } from '@khp/db';

async function rows(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`dashboard query failed: ${err.message}`); return []; }
}

export async function liveStats() {
  const [r] = await rows(`
    SELECT
      (SELECT count(DISTINCT session_id) FROM page_views WHERE viewed_at > now() - interval '5 minutes')::int AS active_now,
      (SELECT count(*) FROM appointments WHERE slot_date = current_date AND deleted_at IS NULL)::int AS appts_today,
      (SELECT count(*) FROM users WHERE created_at::date = current_date)::int AS regs_today,
      (SELECT count(*) FROM reviews WHERE status='pending' AND deleted_at IS NULL)::int AS pending_reviews`);
  return r || { active_now: 0, appts_today: 0, regs_today: 0, pending_reviews: 0 };
}

/** Unified recent-activity list for the feed + notification center. */
export async function recentEvents(limit = 15) {
  const [bookings, reviews, regs, questions] = await Promise.all([
    rows(`SELECT a.created_at, a.booking_ref, u.full_name FROM appointments a
            LEFT JOIN users u ON u.id=a.patient_id WHERE a.deleted_at IS NULL ORDER BY a.created_at DESC LIMIT 8`),
    rows(`SELECT created_at, rating, entity_type FROM reviews WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 8`),
    rows(`SELECT created_at, display_name FROM doctors WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 8`),
    rows(`SELECT created_at, title FROM qa_questions WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 8`)
  ]);
  const ev = [
    ...bookings.map((b) => ({ type: 'new_booking', created_at: b.created_at, href: '/analytics',
      title: `New booking ${b.booking_ref || ''}${b.full_name ? ` · ${b.full_name}` : ''}`.trim() })),
    ...reviews.map((r) => ({ type: 'new_review', created_at: r.created_at, href: '/reviews',
      title: `New ${r.rating}★ review on a ${r.entity_type}` })),
    ...regs.map((d) => ({ type: 'new_registration', created_at: d.created_at, href: '/verification',
      title: `Doctor registered · ${d.display_name || 'Unnamed'}` })),
    ...questions.map((q) => ({ type: 'new_question', created_at: q.created_at, href: '/qa',
      title: `New question · ${(q.title || '').slice(0, 60)}` }))
  ];
  return ev.filter((e) => e.created_at)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);
}

export async function trends(days = 30) {
  const d = Math.max(1, Math.min(90, parseInt(days, 10) || 30));
  const series = async (sql) => {
    const r = await rows(
      `SELECT to_char(g.day,'MM-DD') AS day, coalesce(x.n,0)::int AS n
         FROM generate_series(current_date - ($1 - 1), current_date, interval '1 day') g(day)
         LEFT JOIN (${sql}) x ON x.day = g.day ORDER BY g.day`, [d]);
    return r;
  };
  const [views, appts, regs] = await Promise.all([
    series(`SELECT viewed_at::date AS day, count(*) n FROM page_views WHERE viewed_at > now() - make_interval(days => $1) GROUP BY 1`),
    series(`SELECT slot_date AS day, count(*) n FROM appointments WHERE slot_date > current_date - $1 AND deleted_at IS NULL GROUP BY 1`),
    series(`SELECT created_at::date AS day, count(*) n FROM users WHERE created_at > now() - make_interval(days => $1) GROUP BY 1`)
  ]);
  return { views, appts, regs };
}

function checkRedis() {
  return new Promise((resolve) => {
    try {
      const url = new URL(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
      const sock = net.createConnection({ host: url.hostname, port: Number(url.port) || 6379 });
      const done = (ok) => { try { sock.destroy(); } catch { /* noop */ } resolve(ok); };
      sock.setTimeout(1000);
      sock.once('connect', () => done(true));
      sock.once('timeout', () => done(false));
      sock.once('error', () => done(false));
    } catch { resolve(false); }
  });
}

export async function systemHealth() {
  let db = false, dbSize = null, tables = 0;
  try {
    await getPool().query('SELECT 1'); db = true;
    const { rows: s } = await getPool().query(`SELECT pg_size_pretty(pg_database_size(current_database())) AS size,
      (SELECT count(*) FROM information_schema.tables WHERE table_schema='public')::int AS tables`);
    dbSize = s[0].size; tables = s[0].tables;
  } catch { /* db down */ }
  const redis = await checkRedis();
  return {
    db: db ? 'ok' : 'error', redis: redis ? 'ok' : 'error', dbSize, tables,
    // Backups + host disk are managed at the infra level (cron + VPS), not in-app.
    backups: 'infra cron', disk: 'host-managed'
  };
}
