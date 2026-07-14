// qa.js — admin Q&A moderation. Questions + answers queues. Parameterised SQL. Fails soft.

import { getPool } from '@khp/db';

const PAGE_SIZE = 30;

async function run(text, values = []) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`admin qa query failed: ${err.message}`); return []; }
}

/** Questions by status (oldest first for the queue). */
export function listQuestionsByStatus(status = 'pending', page = 1) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  return run(
    `SELECT q.id, q.slug, q.title, q.body, q.status, q.is_anonymous, q.created_at, q.rejection_reason,
            sp.name_en AS specialty_en, u.full_name AS patient_name
       FROM qa_questions q
       LEFT JOIN specialties sp ON sp.id = q.specialty_id
       LEFT JOIN users u ON u.id = q.patient_id
      WHERE q.status = $1 AND q.deleted_at IS NULL
      ORDER BY q.created_at ASC LIMIT ${PAGE_SIZE} OFFSET ${(p - 1) * PAGE_SIZE}`, [status]);
}

/** Answers by status, with question + doctor. */
export function listAnswersByStatus(status = 'pending', page = 1) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  return run(
    `SELECT a.id, a.body, a.status, a.is_accepted, a.created_at, a.rejection_reason,
            q.title AS question_title, q.slug AS question_slug,
            d.display_name AS doctor_name
       FROM qa_answers a
       JOIN qa_questions q ON q.id = a.question_id
       JOIN doctors d ON d.id = a.doctor_id
      WHERE a.status = $1 AND a.deleted_at IS NULL
      ORDER BY a.created_at ASC LIMIT ${PAGE_SIZE} OFFSET ${(p - 1) * PAGE_SIZE}`, [status]);
}

async function counts(table) {
  const rows = await run(`SELECT status, count(*)::int AS n FROM ${table} WHERE deleted_at IS NULL GROUP BY status`);
  const out = { pending: 0, published: 0, rejected: 0 };
  for (const r of rows) if (r.status in out) out[r.status] = r.n;
  return out;
}
export const questionCounts = () => counts('qa_questions');
export const answerCounts = () => counts('qa_answers');

async function setStatus(table, id, status, adminId, reason) {
  const rows = await run(
    `UPDATE ${table} SET status = $2, moderated_by = $3, moderated_at = now(),
            rejection_reason = $4, updated_at = now()
      WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
    [id, status, adminId || null, status === 'rejected' ? (reason || null) : null]);
  return rows.length > 0;
}

export const approveQuestion = (id, adminId) => setStatus('qa_questions', id, 'published', adminId);
export const rejectQuestion = (id, adminId, reason) => setStatus('qa_questions', id, 'rejected', adminId, reason);
export const approveAnswer = (id, adminId) => setStatus('qa_answers', id, 'published', adminId);
export const rejectAnswer = (id, adminId, reason) => setStatus('qa_answers', id, 'rejected', adminId, reason);

/** Mark one answer as the accepted answer for its question (clears siblings). */
export async function acceptAnswer(id, adminId) {
  const rows = await run(`SELECT question_id FROM qa_answers WHERE id = $1 AND deleted_at IS NULL`, [id]);
  if (!rows[0]) return false;
  await run(`UPDATE qa_answers SET is_accepted = false, updated_at = now() WHERE question_id = $1`, [rows[0].question_id]);
  const done = await run(
    `UPDATE qa_answers SET is_accepted = true, moderated_by = $2, updated_at = now()
      WHERE id = $1 AND status = 'published' AND deleted_at IS NULL RETURNING id`, [id, adminId || null]);
  return done.length > 0;
}
