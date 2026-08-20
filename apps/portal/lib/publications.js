// publications.js — doctor's own publications & awards (portal write path).
// Scoped to currentDoctorId. Parameterised SQL.

import { getPool } from '@khp/db';

async function rows(text, values) {
  return (await getPool().query(text, values)).rows;
}

const PUB_TYPES = ['paper', 'book', 'chapter', 'case_report', 'poster'];
const toYear = (v) => {
  const n = parseInt(v, 10);
  return Number.isInteger(n) && n > 1900 && n < 2100 ? n : null;
};

export function listPublications(providerId) {
  return rows(
    `SELECT id, title, journal, year, doi, pubmed_id, url, type
       FROM provider_publications
      WHERE provider_id=$1 AND deleted_at IS NULL
      ORDER BY sort_order, year DESC NULLS LAST, created_at DESC`,
    [providerId]
  );
}

export async function addPublication(providerId, p = {}) {
  const title = String(p.title || '').trim();
  if (!providerId || !title) return { error: 'title_required' };
  const type = PUB_TYPES.includes(p.type) ? p.type : 'paper';
  const [r] = await rows(
    `INSERT INTO provider_publications (provider_id, title, journal, year, doi, pubmed_id, url, type)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
    [providerId, title, String(p.journal || '').trim() || null, toYear(p.year),
      String(p.doi || '').trim() || null, String(p.pubmedId || '').trim() || null,
      String(p.url || '').trim() || null, type]
  );
  return { id: r.id };
}

export async function deletePublication(providerId, id) {
  const r = await rows(
    `UPDATE provider_publications SET deleted_at=now()
      WHERE id=$2 AND provider_id=$1 AND deleted_at IS NULL RETURNING id`,
    [providerId, id]
  );
  return r.length ? { id: r[0].id } : { error: 'not_found' };
}

export function listAwards(providerId) {
  return rows(
    `SELECT id, title, awarded_by, year, description
       FROM provider_awards
      WHERE provider_id=$1 AND deleted_at IS NULL
      ORDER BY sort_order, year DESC NULLS LAST, created_at DESC`,
    [providerId]
  );
}

export async function addAward(providerId, p = {}) {
  const title = String(p.title || '').trim();
  if (!providerId || !title) return { error: 'title_required' };
  const [r] = await rows(
    `INSERT INTO provider_awards (provider_id, title, awarded_by, year, description)
     VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    [providerId, title, String(p.awardedBy || '').trim() || null, toYear(p.year),
      String(p.description || '').trim() || null]
  );
  return { id: r.id };
}

export async function deleteAward(providerId, id) {
  const r = await rows(
    `UPDATE provider_awards SET deleted_at=now()
      WHERE id=$2 AND provider_id=$1 AND deleted_at IS NULL RETURNING id`,
    [providerId, id]
  );
  return r.length ? { id: r[0].id } : { error: 'not_found' };
}
