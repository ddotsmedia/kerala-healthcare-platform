// guidelines.js — Clinical Guidelines Simplified (content_items type='guideline').
// Patient-friendly summaries citing the source organisation. Educational only.

import { getPool } from '@khp/db';

const PUB = `c.type = 'guideline' AND c.status = 'published' AND c.deleted_at IS NULL`;
const CARD = `c.id, c.slug, c.title_ml, c.title_en, c.excerpt_ml, c.excerpt_en, c.source_org`;

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`guidelines query failed: ${err.message}`); return []; }
}

export function listGuidelines() {
  return run(`SELECT ${CARD} FROM content_items c WHERE ${PUB} ORDER BY c.title_en`, []);
}

export function getGuideline(slug) {
  return run(`SELECT c.* FROM content_items c WHERE c.slug = $1 AND ${PUB}`, [slug]).then((r) => r[0] || null);
}

export function allGuidelineSlugs() {
  return run(`SELECT c.slug FROM content_items c WHERE ${PUB} ORDER BY c.title_en`, []);
}
