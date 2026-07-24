// campaigns.js — seasonal health awareness campaigns. Public read-only.
// A campaign shows on the homepage only while active AND inside its date window.

import { getPool } from '@khp/db';

const LIVE = `is_active = true AND deleted_at IS NULL
  AND (start_date IS NULL OR start_date <= current_date)
  AND (end_date IS NULL OR end_date >= current_date)`;

const CARD_COLS = `id, slug, title_ml, title_en, description_ml, description_en,
  theme_color, start_date, end_date, hero_image_url`;

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`campaigns query failed: ${err.message}`); return []; }
}

/** The campaign currently running, if any (homepage banner). */
export function activeCampaign() {
  return run(`SELECT ${CARD_COLS} FROM campaigns WHERE ${LIVE}
              ORDER BY start_date DESC NULLS LAST LIMIT 1`, []).then((r) => r[0] || null);
}

/** Campaign landing page — published regardless of date so links never 404. */
export function getCampaign(slug) {
  return run(
    `SELECT c.id, c.slug, c.title_ml, c.title_en, c.description_ml, c.description_en,
            c.theme_color, c.start_date, c.end_date, c.hero_image_url,
            c.content_ml, c.content_en, c.is_active, c.specialty_id,
            s.slug AS specialty_slug, s.name_ml AS specialty_ml, s.name_en AS specialty_en
       FROM campaigns c LEFT JOIN specialties s ON s.id = c.specialty_id
      WHERE c.slug = $1 AND c.deleted_at IS NULL`, [slug]).then((r) => r[0] || null);
}

/** All campaign slugs (sitemap). */
export function allCampaignSlugs() {
  return run(`SELECT slug FROM campaigns WHERE deleted_at IS NULL ORDER BY start_date DESC NULLS LAST`, []);
}

/** True while the campaign is inside its own date window. */
export function isRunning(c) {
  if (!c || !c.is_active) return false;
  const today = new Date().toISOString().slice(0, 10);
  const from = c.start_date ? String(c.start_date).slice(0, 10) : null;
  const to = c.end_date ? String(c.end_date).slice(0, 10) : null;
  return (!from || from <= today) && (!to || to >= today);
}
