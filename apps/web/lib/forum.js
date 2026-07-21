// forum.js — community forum data access. Approved content is public; posting
// requires login. All posts/replies start pending (moderated). Parameterised SQL.

import { randomBytes } from 'node:crypto';
import { getPool } from '@khp/db';
import { currentPatientId } from './appointments.js';
import { getSession } from './session.js';

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`forum query failed: ${err.message}`); return []; }
}

function slugify(title) {
  const base = String(title).toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 70) || 'post';
  return `${base}-${randomBytes(3).toString('hex')}`;
}

// Alias-qualified — joins against users (which also has deleted_at) make a bare
// column ambiguous.
const approved = (a) => `${a}.status = 'approved' AND ${a}.deleted_at IS NULL`;

export function listCategories() {
  return run(
    `SELECT c.id, c.slug, c.name_ml, c.name_en, c.description_ml, c.description_en, c.icon,
            (SELECT count(*) FROM forum_posts p WHERE p.category_id = c.id AND ${approved('p')})::int AS post_count
       FROM forum_categories c WHERE c.deleted_at IS NULL ORDER BY c.name_en`, []);
}

export function getCategoryBySlug(slug) {
  return run(`SELECT id, slug, name_ml, name_en, description_ml, description_en, icon
                FROM forum_categories WHERE slug = $1 AND deleted_at IS NULL`, [slug]).then((r) => r[0] || null);
}

const P_COLS = `p.id, p.slug, p.title, p.body, p.is_anonymous, p.is_pinned, p.views, p.reply_count,
  p.last_reply_at, p.created_at,
  CASE WHEN p.is_anonymous THEN NULL ELSE u.full_name END AS author_name`;

export function listPosts(categoryId, { sort = 'latest', page = 1, limit = 20 } = {}) {
  const order = sort === 'popular' ? 'p.is_pinned DESC, p.views DESC, p.reply_count DESC' : 'p.is_pinned DESC, p.created_at DESC';
  const lim = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const off = (Math.max(1, parseInt(page, 10) || 1) - 1) * lim;
  return run(
    `SELECT ${P_COLS} FROM forum_posts p JOIN users u ON u.id = p.author_id
      WHERE p.category_id = $1 AND ${approved('p')} ORDER BY ${order} LIMIT $2 OFFSET $3`,
    [categoryId, lim, off]);
}

/** Recent approved posts across all categories (home "active discussions"). */
export function activeDiscussions(limit = 6) {
  return run(
    `SELECT ${P_COLS}, c.slug AS category_slug, c.name_ml AS category_ml, c.name_en AS category_en
       FROM forum_posts p JOIN users u ON u.id = p.author_id JOIN forum_categories c ON c.id = p.category_id
      WHERE ${approved('p')} ORDER BY COALESCE(p.last_reply_at, p.created_at) DESC LIMIT $1`, [limit]);
}

export async function getPostBySlug(slug) {
  const rows = await run(
    `SELECT ${P_COLS}, p.category_id, c.slug AS category_slug, c.name_ml AS category_ml, c.name_en AS category_en
       FROM forum_posts p JOIN users u ON u.id = p.author_id JOIN forum_categories c ON c.id = p.category_id
      WHERE p.slug = $1 AND ${approved('p')}`, [slug]);
  const post = rows[0];
  if (!post) return null;
  await run(`UPDATE forum_posts SET views = views + 1 WHERE id = $1`, [post.id]);
  post.replies = await run(
    `SELECT r.id, r.body, r.is_anonymous, r.is_doctor_reply, r.created_at,
            CASE WHEN r.is_anonymous THEN NULL ELSE u.full_name END AS author_name
       FROM forum_replies r JOIN users u ON u.id = r.author_id
      WHERE r.post_id = $1 AND ${approved('r')}
      ORDER BY r.is_doctor_reply DESC, r.created_at ASC`, [post.id]);
  return post;
}

/** Create a post (pending). @returns {{ok, slug?, error?}} */
export async function createPost(b) {
  const uid = await currentPatientId();
  if (!uid) return { ok: false, error: 'unauthenticated' };
  const title = String(b.title || '').trim();
  const body = String(b.body || '').trim();
  if (title.length < 5 || body.length < 10) return { ok: false, error: 'too_short' };
  if (!b.category_id) return { ok: false, error: 'category_required' };
  const slug = slugify(title);
  const rows = await run(
    `INSERT INTO forum_posts (slug, category_id, author_id, title, body, is_anonymous)
     SELECT $1, c.id, $3, $4, $5, $6 FROM forum_categories c WHERE c.id = $2 AND c.deleted_at IS NULL
     RETURNING slug`,
    [slug, b.category_id, uid, title.slice(0, 200), body.slice(0, 5000), !!b.is_anonymous]);
  if (!rows[0]) return { ok: false, error: 'invalid_category' };
  return { ok: true, slug: rows[0].slug };
}

/** Create a reply (pending). Doctor authors flagged is_doctor_reply. */
export async function createReply(postId, b) {
  const s = await getSession();
  if (!s) return { ok: false, error: 'unauthenticated' };
  const body = String(b.body || '').trim();
  if (body.length < 3) return { ok: false, error: 'too_short' };
  const rows = await run(
    `INSERT INTO forum_replies (post_id, author_id, body, is_anonymous, is_doctor_reply)
     SELECT $1, $2, $3, $4, $5 FROM forum_posts p WHERE p.id = $1 AND p.deleted_at IS NULL
     RETURNING id`,
    [postId, s.userId, body.slice(0, 3000), !!b.is_anonymous, s.role === 'doctor']);
  if (!rows[0]) return { ok: false, error: 'invalid_post' };
  return { ok: true, id: rows[0].id };
}

/** Flag a post/reply for moderator review. */
export async function report(kind, id) {
  const table = kind === 'reply' ? 'forum_replies' : 'forum_posts';
  await run(`UPDATE ${table} SET status = 'flagged', updated_at = now()
              WHERE id = $1 AND status = 'approved' AND deleted_at IS NULL`, [id]);
  return { ok: true };
}
