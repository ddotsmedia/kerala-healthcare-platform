// cms.js — content management data access + role-gated editorial workflow.
// Parameterised SQL only. Editor ≠ publisher: create/edit/submit are for
// content_editor+, approve/publish/archive require platform_admin.

import { getPool } from '@khp/db';

const EDIT_ROLES = ['content_editor', 'platform_admin'];
const PUBLISH_ROLES = ['platform_admin'];

const FIELDS = `id, slug, type, title_ml, title_en, body_ml, body_en, excerpt_ml,
  excerpt_en, status, published_at, requires_disclaimer, author_id, reviewer_id,
  reviewed_at, created_at, updated_at`;

function canEdit(role) { return EDIT_ROLES.includes(role); }
function canPublish(role) { return PUBLISH_ROLES.includes(role); }

async function listContent({ type, status, limit = 50 } = {}) {
  const where = ['deleted_at IS NULL'];
  const values = [];
  if (type) { values.push(type); where.push(`type = $${values.length}`); }
  if (status) { values.push(status); where.push(`status = $${values.length}`); }
  values.push(Math.min(100, limit));
  const { rows } = await getPool().query(
    `SELECT ${FIELDS} FROM content_items WHERE ${where.join(' AND ')}
      ORDER BY updated_at DESC LIMIT $${values.length}`, values);
  return rows;
}

async function getContent(id) {
  const { rows } = await getPool().query(
    `SELECT ${FIELDS} FROM content_items WHERE id = $1 AND deleted_at IS NULL`, [id]);
  return rows[0] || null;
}

async function createDraft(session, data) {
  if (!canEdit(session.role)) return { ok: false, error: 'forbidden' };
  if (!data.slug || !data.title_en) return { ok: false, error: 'slug_and_title_required' };
  try {
    const { rows } = await getPool().query(
      `INSERT INTO content_items (slug, type, title_ml, title_en, body_ml, body_en,
         excerpt_ml, excerpt_en, author_id, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'draft') RETURNING ${FIELDS}`,
      [data.slug, data.type || 'article', data.title_ml || null, data.title_en,
       data.body_ml || null, data.body_en || null, data.excerpt_ml || null,
       data.excerpt_en || null, session.userId]);
    return { ok: true, item: rows[0] };
  } catch (err) {
    return { ok: false, error: /unique/i.test(err.message) ? 'slug_taken' : err.message };
  }
}

async function updateDraft(session, id, data) {
  if (!canEdit(session.role)) return { ok: false, error: 'forbidden' };
  const { rows } = await getPool().query(
    `UPDATE content_items SET
        title_ml = COALESCE($2,title_ml), title_en = COALESCE($3,title_en),
        body_ml = COALESCE($4,body_ml), body_en = COALESCE($5,body_en),
        excerpt_ml = COALESCE($6,excerpt_ml), excerpt_en = COALESCE($7,excerpt_en),
        updated_at = now()
      WHERE id = $1 AND deleted_at IS NULL AND status IN ('draft','in_review')
      RETURNING ${FIELDS}`,
    [id, data.title_ml, data.title_en, data.body_ml, data.body_en, data.excerpt_ml, data.excerpt_en]);
  return rows[0] ? { ok: true, item: rows[0] } : { ok: false, error: 'not_editable' };
}

/** Generic state transition with role + from-state guard. */
async function transition(session, id, from, to, needPublish) {
  const allowed = needPublish ? canPublish(session.role) : canEdit(session.role);
  if (!allowed) return { ok: false, error: 'forbidden' };
  const setExtra = to === 'published' ? ', published_at = now()' :
    to === 'approved' ? ', reviewer_id = $3, reviewed_at = now()' : '';
  const params = to === 'approved' ? [id, to, session.userId] : [id, to];
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE content_items SET status = $2${setExtra}, updated_at = now()
        WHERE id = $1 AND status = '${from}' AND deleted_at IS NULL
        RETURNING ${FIELDS}`, params);
    if (!rows[0]) { await client.query('ROLLBACK'); return { ok: false, error: 'invalid_transition' }; }
    if (to === 'published') {
      await client.query(
        `INSERT INTO content_versions (content_item_id, version_number, body_ml, body_en, changed_by)
         SELECT $1, COALESCE(MAX(version_number),0)+1, $2, $3, $4 FROM content_versions WHERE content_item_id = $1`,
        [id, rows[0].body_ml, rows[0].body_en, session.userId]);
    }
    await client.query('COMMIT');
    return { ok: true, item: rows[0] };
  } catch (err) {
    await client.query('ROLLBACK');
    return { ok: false, error: err.message };
  } finally {
    client.release();
  }
}

const submit = (s, id) => transition(s, id, 'draft', 'in_review', false);
const approve = (s, id) => transition(s, id, 'in_review', 'approved', true);
const publish = (s, id) => transition(s, id, 'approved', 'published', true);

async function archive(session, id) {
  if (!canPublish(session.role)) return { ok: false, error: 'forbidden' };
  const { rows } = await getPool().query(
    `UPDATE content_items SET status = 'archived', updated_at = now()
      WHERE id = $1 AND deleted_at IS NULL RETURNING ${FIELDS}`, [id]);
  return rows[0] ? { ok: true, item: rows[0] } : { ok: false, error: 'not_found' };
}

async function listVersions(id) {
  const { rows } = await getPool().query(
    `SELECT version_number, changed_by, created_at FROM content_versions
      WHERE content_item_id = $1 ORDER BY version_number DESC`, [id]);
  return rows;
}

export { listContent, getContent, createDraft, updateDraft, submit, approve, publish, archive, listVersions };
