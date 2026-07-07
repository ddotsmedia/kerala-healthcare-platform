// resume.js — resume-builder data access (owner-scoped). Parameterised SQL only.

import { getPool } from '@khp/db';
import { getSession } from './session.js';

const COLS = `id, user_id, title, template_id, personal, experience, education, skills,
              certifications, publications, languages, refs, ai_enhanced_summary,
              is_public, last_exported_at, created_at, updated_at`;

const JSONB_FIELDS = ['personal', 'experience', 'education', 'certifications', 'publications', 'languages', 'refs'];
const TEMPLATES = ['kerala_classic', 'modern_minimal', 'gulf_ready'];

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`resume query failed: ${err.message}`); return null; }
}

/** Most recent resume owned by the session user (null if unauth, undefined-ish []). */
async function getMyResume() {
  const s = await getSession();
  if (!s) return null;
  const rows = await run(`SELECT ${COLS} FROM resume_profiles
                            WHERE user_id=$1 AND deleted_at IS NULL
                            ORDER BY updated_at DESC LIMIT 1`, [s.userId]);
  return rows ? (rows[0] || false) : false;
}

async function createResume(title, templateId) {
  const s = await getSession();
  if (!s) return null;
  const tmpl = TEMPLATES.includes(templateId) ? templateId : 'kerala_classic';
  const rows = await run(
    `INSERT INTO resume_profiles (user_id, title, template_id) VALUES ($1, $2, $3) RETURNING ${COLS}`,
    [s.userId, (title || 'My Resume').slice(0, 200), tmpl]);
  return rows ? rows[0] : null;
}

async function getResumeById(id) {
  const s = await getSession();
  if (!s) return null;
  const rows = await run(`SELECT ${COLS} FROM resume_profiles
                            WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL`, [id, s.userId]);
  return rows ? (rows[0] || false) : false;
}

/**
 * Update editable sections. Unknown keys ignored; jsonb fields cast + stringified.
 * @param {string} id
 * @param {object} fields any of title, template_id, personal, experience, education,
 *   skills, certifications, publications, languages, refs, ai_enhanced_summary, is_public
 */
async function updateResumeSection(id, fields) {
  const s = await getSession();
  if (!s) return null;
  const sets = ['updated_at = now()'];
  const values = [];
  const push = (col, val, cast) => { values.push(val); sets.push(`${col} = $${values.length}${cast || ''}`); };

  if (typeof fields.title === 'string' && fields.title.trim()) push('title', fields.title.trim().slice(0, 200));
  if (TEMPLATES.includes(fields.template_id)) push('template_id', fields.template_id);
  if (typeof fields.ai_enhanced_summary === 'string') push('ai_enhanced_summary', fields.ai_enhanced_summary.slice(0, 4000));
  if (typeof fields.is_public === 'boolean') push('is_public', fields.is_public);
  if (Array.isArray(fields.skills)) push('skills', fields.skills.filter((x) => typeof x === 'string').slice(0, 60));
  for (const f of JSONB_FIELDS) {
    if (fields[f] !== undefined) push(f, JSON.stringify(fields[f]), '::jsonb');
  }
  if (sets.length === 1) return false; // nothing to update

  values.push(id); values.push(s.userId);
  const rows = await run(
    `UPDATE resume_profiles SET ${sets.join(', ')}
      WHERE id = $${values.length - 1} AND user_id = $${values.length} AND deleted_at IS NULL
    RETURNING ${COLS}`, values);
  return rows ? (rows[0] || false) : false;
}

async function touchExport(id) {
  const s = await getSession();
  if (!s) return;
  await run(`UPDATE resume_profiles SET last_exported_at = now() WHERE id=$1 AND user_id=$2`, [id, s.userId]);
}

export { getMyResume, createResume, getResumeById, updateResumeSection, touchExport, TEMPLATES };
