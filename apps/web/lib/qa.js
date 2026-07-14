// qa.js — patient-facing Q&A data access. Published content is public;
// creating a question requires login. Parameterised SQL; fails soft.

import { randomBytes } from 'node:crypto';
import { getPool } from '@khp/db';
import { currentPatientId } from './appointments.js';
import { looksLikeDiagnosisRequest } from './qaSafety.js';

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`qa query failed: ${err.message}`); return []; }
}

function slugify(title) {
  const base = String(title).toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 70) || 'question';
  return `${base}-${randomBytes(3).toString('hex')}`;
}

const Q_COLS = `q.id, q.slug, q.title, q.body, q.is_anonymous, q.views, q.created_at,
  q.specialty_id, sp.name_ml AS specialty_ml, sp.name_en AS specialty_en,
  (SELECT count(*) FROM qa_answers a WHERE a.question_id = q.id AND a.status = 'published' AND a.deleted_at IS NULL)::int AS answer_count`;

async function listPublishedQuestions({ specialtyId, term, page = 1, limit = 20 } = {}) {
  const where = ["q.status = 'published'", 'q.deleted_at IS NULL'];
  const values = [];
  if (specialtyId) { values.push(specialtyId); where.push(`q.specialty_id = $${values.length}`); }
  if (term) { values.push(`%${term}%`); where.push(`(q.title ILIKE $${values.length} OR q.body ILIKE $${values.length})`); }
  const lim = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const off = (Math.max(1, parseInt(page, 10) || 1) - 1) * lim;
  values.push(lim); const li = values.length;
  values.push(off); const oi = values.length;
  return run(`SELECT ${Q_COLS} FROM qa_questions q
                LEFT JOIN specialties sp ON sp.id = q.specialty_id
               WHERE ${where.join(' AND ')} ORDER BY q.created_at DESC LIMIT $${li} OFFSET $${oi}`, values);
}

async function getQuestionBySlug(slug) {
  const rows = await run(`SELECT ${Q_COLS} FROM qa_questions q
                            LEFT JOIN specialties sp ON sp.id = q.specialty_id
                           WHERE q.slug = $1 AND q.status = 'published' AND q.deleted_at IS NULL`, [slug]);
  const q = rows[0];
  if (!q) return null;
  await run(`UPDATE qa_questions SET views = views + 1 WHERE id = $1`, [q.id]);
  q.answers = await run(
    `SELECT a.id, a.body, a.is_accepted, a.helpful_count, a.created_at,
            d.display_name AS doctor_name, d.slug AS doctor_slug,
            s.name_en AS doctor_specialty_en
       FROM qa_answers a JOIN doctors d ON d.id = a.doctor_id
       LEFT JOIN specialties s ON s.id = d.specialty_id
      WHERE a.question_id = $1 AND a.status = 'published' AND a.deleted_at IS NULL
      ORDER BY a.is_accepted DESC, a.helpful_count DESC, a.created_at ASC`, [q.id]);
  return q;
}

/** Create a question (pending moderation). Blocks diagnosis-seeking text. */
async function createQuestion(b) {
  const uid = await currentPatientId();
  if (!uid) return { error: 'unauthenticated' };
  const title = String(b.title || '').trim();
  const body = String(b.body || '').trim();
  if (!title || !body) return { error: 'invalid' };
  if (looksLikeDiagnosisRequest(`${title} ${body}`)) return { error: 'diagnosis_request' };
  const rows = await run(
    `INSERT INTO qa_questions (slug, patient_id, title, body, specialty_id, is_anonymous)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, slug`,
    [slugify(title), uid, title.slice(0, 200), body.slice(0, 4000), b.specialty_id || null, b.is_anonymous === true]);
  return rows[0] ? { ok: true, question: rows[0] } : { error: 'create_failed' };
}

async function relatedQuestions(specialtyId, excludeId, limit = 5) {
  if (!specialtyId) return [];
  return run(`SELECT slug, title FROM qa_questions
                WHERE specialty_id = $1 AND status = 'published' AND deleted_at IS NULL AND id <> $2
               ORDER BY created_at DESC LIMIT $3`, [specialtyId, excludeId, limit]);
}

async function voteHelpful(answerId) {
  const rows = await run(
    `UPDATE qa_answers SET helpful_count = helpful_count + 1, updated_at = now()
      WHERE id = $1 AND status = 'published' AND deleted_at IS NULL RETURNING helpful_count`, [answerId]);
  return rows[0] ? rows[0].helpful_count : null;
}

export { listPublishedQuestions, getQuestionBySlug, createQuestion, relatedQuestions, voteHelpful };
