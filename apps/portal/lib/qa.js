// qa.js — doctor-side Q&A: answer published patient questions. Doctor-scoped.
// Questions must be published (moderated) before doctors can answer.
// New answers enter moderation (status = pending). Parameterised SQL. Fails soft.

import { getPool } from '@khp/db';

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`portal qa query failed: ${err.message}`); return []; }
}

async function doctorSpecialty(doctorId) {
  const rows = await run(`SELECT specialty_id FROM doctors WHERE id = $1`, [doctorId]);
  return rows[0] ? rows[0].specialty_id : null;
}

/** Published questions this doctor hasn't answered yet — own specialty first, then the rest. */
async function listAnswerable(doctorId, { onlyMine = true } = {}) {
  if (!doctorId) return [];
  const specialtyId = await doctorSpecialty(doctorId);
  const values = [doctorId];
  let specFilter = '';
  if (onlyMine && specialtyId) { values.push(specialtyId); specFilter = `AND q.specialty_id = $${values.length}`; }
  return run(
    `SELECT q.id, q.slug, q.title, q.body, q.created_at,
            sp.name_en AS specialty_en, sp.name_ml AS specialty_ml,
            (SELECT count(*) FROM qa_answers a2 WHERE a2.question_id = q.id AND a2.status = 'published' AND a2.deleted_at IS NULL)::int AS answer_count
       FROM qa_questions q
       LEFT JOIN specialties sp ON sp.id = q.specialty_id
      WHERE q.status = 'published' AND q.deleted_at IS NULL ${specFilter}
        AND NOT EXISTS (SELECT 1 FROM qa_answers a WHERE a.question_id = q.id AND a.doctor_id = $1 AND a.deleted_at IS NULL)
      ORDER BY q.created_at DESC LIMIT 50`, values);
}

/** This doctor's own answers with question title + moderation status. */
async function myAnswers(doctorId) {
  if (!doctorId) return [];
  return run(
    `SELECT a.id, a.body, a.status, a.is_accepted, a.helpful_count, a.created_at,
            q.slug AS question_slug, q.title AS question_title
       FROM qa_answers a JOIN qa_questions q ON q.id = a.question_id
      WHERE a.doctor_id = $1 AND a.deleted_at IS NULL
      ORDER BY a.created_at DESC LIMIT 50`, [doctorId]);
}

/** Post an answer to a published question (enters moderation). One per doctor per question. */
async function createAnswer(doctorId, questionId, body) {
  if (!doctorId || !questionId) return { ok: false, error: 'invalid' };
  const text = String(body || '').trim();
  if (text.length < 10) return { ok: false, error: 'too_short' };
  const q = await run(`SELECT id FROM qa_questions WHERE id = $1 AND status = 'published' AND deleted_at IS NULL`, [questionId]);
  if (!q[0]) return { ok: false, error: 'not_found' };
  const dup = await run(`SELECT id FROM qa_answers WHERE question_id = $1 AND doctor_id = $2 AND deleted_at IS NULL`, [questionId, doctorId]);
  if (dup[0]) return { ok: false, error: 'duplicate' };
  const rows = await run(
    `INSERT INTO qa_answers (question_id, doctor_id, body) VALUES ($1,$2,$3) RETURNING id`,
    [questionId, doctorId, text.slice(0, 4000)]);
  return rows[0] ? { ok: true, id: rows[0].id } : { ok: false, error: 'create_failed' };
}

export { listAnswerable, myAnswers, createAnswer };
