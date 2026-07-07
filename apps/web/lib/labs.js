// labs.js — diagnostic-labs directory data access. Verified + not-deleted only.
// Parameterised SQL; fails soft (returns [] / null) so pages still render.

import { getPool } from '@khp/db';

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`labs query failed: ${err.message}`); return []; }
}

/** Is the lab open right now (Asia/Kolkata) per its operating_hours JSONB? */
function isLabOpenNow(hours) {
  if (!hours || typeof hours !== 'object') return null;
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(new Date());
    const wd = (parts.find((p) => p.type === 'weekday')?.value || '').toLowerCase().slice(0, 3);
    const hh = parts.find((p) => p.type === 'hour')?.value || '00';
    const mm = parts.find((p) => p.type === 'minute')?.value || '00';
    const now = `${hh}:${mm}`;
    const today = hours[wd] || hours[DAYS[new Date().getDay()]];
    if (!today || !today.open || !today.close) return false;
    return now >= today.open && now <= today.close;
  } catch { return null; }
}

const SELECT_COLS = `l.id, l.slug, l.name_ml, l.name_en, l.type, l.district_id,
  l.is_nabl_accredited, l.home_collection, l.home_collection_fee_inr, l.online_reports,
  l.report_delivery_hours, l.operating_hours, l.rating_avg, l.rating_count,
  l.phone, di.name_ml AS district_ml, di.name_en AS district_en`;

/**
 * @param {object} o { term, districtId, nabl, homeCollection, testCategory, openNow, page, limit }
 */
async function searchLabs(o = {}) {
  const where = ['l.deleted_at IS NULL', "l.verification_status = 'verified'"];
  const values = [];
  if (o.districtId) { values.push(o.districtId); where.push(`l.district_id = $${values.length}`); }
  if (o.nabl === true || o.nabl === '1' || o.nabl === 'true') where.push('l.is_nabl_accredited = true');
  if (o.homeCollection === true || o.homeCollection === '1' || o.homeCollection === 'true') where.push('l.home_collection = true');
  if (o.term) {
    values.push(`%${o.term}%`);
    where.push(`(l.name_en ILIKE $${values.length} OR l.name_ml ILIKE $${values.length}
      OR EXISTS (SELECT 1 FROM lab_tests t WHERE t.lab_id = l.id AND (t.test_name_en ILIKE $${values.length} OR t.test_name_ml ILIKE $${values.length})))`);
  }
  if (o.testCategory) {
    values.push(o.testCategory);
    where.push(`EXISTS (SELECT 1 FROM lab_tests t WHERE t.lab_id = l.id AND t.category = $${values.length})`);
  }
  const limit = Math.min(50, Math.max(1, parseInt(o.limit, 10) || 20));
  const offset = (Math.max(1, parseInt(o.page, 10) || 1) - 1) * limit;
  values.push(limit); const li = values.length;
  values.push(offset); const oi = values.length;
  const rows = await run(
    `SELECT ${SELECT_COLS} FROM diagnostic_labs l
       LEFT JOIN districts di ON di.id = l.district_id
      WHERE ${where.join(' AND ')}
      ORDER BY l.is_nabl_accredited DESC, l.rating_avg DESC, l.name_en
      LIMIT $${li} OFFSET $${oi}`, values);
  const withOpen = rows.map((r) => ({ ...r, open_now: isLabOpenNow(r.operating_hours) }));
  if (o.openNow === true || o.openNow === '1' || o.openNow === 'true') return withOpen.filter((r) => r.open_now === true);
  return withOpen;
}

async function getLabBySlug(slug) {
  const rows = await run(
    `SELECT l.*, di.name_ml AS district_ml, di.name_en AS district_en
       FROM diagnostic_labs l
       LEFT JOIN districts di ON di.id = l.district_id
      WHERE l.slug = $1 AND l.deleted_at IS NULL AND l.verification_status = 'verified'`, [slug]);
  const lab = rows[0];
  if (!lab) return null;
  lab.open_now = isLabOpenNow(lab.operating_hours);
  lab.tests = await listLabTests(lab.id, {});
  return lab;
}

async function listLabTests(labId, { category, q } = {}) {
  const where = ['lab_id = $1'];
  const values = [labId];
  if (category) { values.push(category); where.push(`category = $${values.length}`); }
  if (q) { values.push(`%${q}%`); where.push(`(test_name_en ILIKE $${values.length} OR test_name_ml ILIKE $${values.length})`); }
  return run(
    `SELECT id, test_name_ml, test_name_en, test_code, category, price_inr, sample_type,
            fasting_required, preparation_ml, preparation_en, report_hours, home_collection_available
       FROM lab_tests WHERE ${where.join(' AND ')}
      ORDER BY category NULLS LAST, test_name_en`, values);
}

async function nearbyLabs(districtId, excludeId, limit = 3) {
  if (!districtId) return [];
  const rows = await run(
    `SELECT ${SELECT_COLS} FROM diagnostic_labs l
       LEFT JOIN districts di ON di.id = l.district_id
      WHERE l.deleted_at IS NULL AND l.verification_status = 'verified'
        AND l.district_id = $1 AND l.id <> $2
      ORDER BY l.is_nabl_accredited DESC, l.rating_avg DESC LIMIT $3`, [districtId, excludeId, limit]);
  return rows;
}

async function allLabSlugs() {
  return run(`SELECT slug FROM diagnostic_labs WHERE deleted_at IS NULL AND verification_status = 'verified'`, []);
}

async function countLabs() {
  const r = await run(`SELECT count(*)::int AS n FROM diagnostic_labs WHERE deleted_at IS NULL AND verification_status = 'verified'`, []);
  return r[0] ? r[0].n : 0;
}

export { searchLabs, getLabBySlug, listLabTests, nearbyLabs, allLabSlugs, countLabs, isLabOpenNow };
