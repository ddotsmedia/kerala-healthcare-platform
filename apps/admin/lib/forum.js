// forum.js — admin moderation data access. Parameterised SQL. Fails soft.

import { getPool } from '@khp/db';

async function run(text, values = []) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`admin forum query failed: ${err.message}`); return []; }
}

/** Pending/flagged posts awaiting moderation (oldest first). */
export function listPosts(status = 'pending', page = 1) {
  const off = (Math.max(1, parseInt(page, 10) || 1) - 1) * 30;
  return run(
    `SELECT p.id, p.title, p.body, p.status, p.is_anonymous, p.created_at,
            u.full_name AS author_name, c.name_en AS category_name
       FROM forum_posts p JOIN users u ON u.id = p.author_id JOIN forum_categories c ON c.id = p.category_id
      WHERE p.status = $1 AND p.deleted_at IS NULL ORDER BY p.created_at ASC LIMIT 30 OFFSET $2`, [status, off]);
}

/** Pending/flagged replies awaiting moderation. */
export function listReplies(status = 'pending', page = 1) {
  const off = (Math.max(1, parseInt(page, 10) || 1) - 1) * 30;
  return run(
    `SELECT r.id, r.body, r.status, r.is_anonymous, r.is_doctor_reply, r.created_at,
            u.full_name AS author_name, p.title AS post_title, p.slug AS post_slug
       FROM forum_replies r JOIN users u ON u.id = r.author_id JOIN forum_posts p ON p.id = r.post_id
      WHERE r.status = $1 AND r.deleted_at IS NULL ORDER BY r.created_at ASC LIMIT 30 OFFSET $2`, [status, off]);
}

export async function counts() {
  const rows = await run(
    `SELECT status, sum(n)::int AS n FROM (
        SELECT status, count(*) n FROM forum_posts WHERE deleted_at IS NULL GROUP BY status
        UNION ALL SELECT status, count(*) n FROM forum_replies WHERE deleted_at IS NULL GROUP BY status
     ) t GROUP BY status`);
  const out = { pending: 0, approved: 0, rejected: 0, flagged: 0 };
  for (const r of rows) if (r.status in out) out[r.status] = r.n;
  return out;
}

export async function moderatePost(id, action) {
  const status = action === 'approve' ? 'approved' : 'rejected';
  const rows = await run(`UPDATE forum_posts SET status = $2, updated_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING category_id`, [id, status]);
  if (rows[0] && status === 'approved') {
    await run(`UPDATE forum_categories SET post_count = post_count + 1 WHERE id = $1`, [rows[0].category_id]);
  }
  return rows.length > 0;
}

export async function moderateReply(id, action) {
  const status = action === 'approve' ? 'approved' : 'rejected';
  const rows = await run(`UPDATE forum_replies SET status = $2, updated_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING post_id`, [id, status]);
  if (rows[0] && status === 'approved') {
    await run(`UPDATE forum_posts SET reply_count = reply_count + 1, last_reply_at = now() WHERE id = $1`, [rows[0].post_id]);
  }
  return rows.length > 0;
}
