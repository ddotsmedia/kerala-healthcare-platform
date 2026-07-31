// videos.js — doctor educational videos (YouTube embeds). Public read-only.

import { getPool } from '@khp/db';

export const VIDEO_CATEGORIES = ['health-tips', 'condition', 'nutrition', 'mental-health', 'prevention', 'ayurveda'];
const PUB = `v.is_published = true AND v.deleted_at IS NULL`;
const CARD = `v.id, v.slug, v.title_ml, v.title_en, v.youtube_video_id, v.duration_seconds,
  v.category, v.view_count, v.published_at, v.specialty_id,
  d.display_name AS doctor_name, d.slug AS doctor_slug,
  s.name_ml AS specialty_ml, s.name_en AS specialty_en`;
const JOINS = `LEFT JOIN doctors d ON d.id = v.doctor_id LEFT JOIN specialties s ON s.id = v.specialty_id`;

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`videos query failed: ${err.message}`); return []; }
}

/** Published videos, filterable by category + specialty. */
export function listVideos({ category, specialtyId, page = 1, limit = 12 } = {}) {
  const where = [PUB]; const values = [];
  if (category && VIDEO_CATEGORIES.includes(category)) { values.push(category); where.push(`v.category = $${values.length}`); }
  if (specialtyId) { values.push(specialtyId); where.push(`v.specialty_id = $${values.length}`); }
  const lim = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const off = (Math.max(1, parseInt(page, 10) || 1) - 1) * lim;
  values.push(lim); const li = values.length;
  values.push(off); const oi = values.length;
  return run(
    `SELECT ${CARD} FROM doctor_videos v ${JOINS}
      WHERE ${where.join(' AND ')} ORDER BY v.published_at DESC NULLS LAST
      LIMIT $${li} OFFSET $${oi}`, values);
}

/** Specialties that actually have published videos (filter dropdown). */
export function videoSpecialties() {
  return run(
    `SELECT DISTINCT s.id, s.name_ml, s.name_en FROM doctor_videos v
       JOIN specialties s ON s.id = v.specialty_id
      WHERE ${PUB} ORDER BY s.name_en`, []);
}

export async function getVideoBySlug(slug) {
  const rows = await run(
    `SELECT ${CARD}, v.description_ml, v.description_en, v.doctor_id
       FROM doctor_videos v ${JOINS} WHERE v.slug = $1 AND ${PUB}`, [slug]);
  const video = rows[0];
  if (!video) return null;
  await run(`UPDATE doctor_videos SET view_count = view_count + 1 WHERE id = $1`, [video.id]);
  return video;
}

/** Related published videos — same specialty, else same category. */
export function relatedVideos(video, limit = 4) {
  if (!video) return Promise.resolve([]);
  return run(
    `SELECT ${CARD} FROM doctor_videos v ${JOINS}
      WHERE ${PUB} AND v.id <> $1
        AND (v.specialty_id = $2 OR v.category = $3)
      ORDER BY (v.specialty_id = $2) DESC, v.published_at DESC NULLS LAST
      LIMIT $4`, [video.id, video.specialty_id || null, video.category || null, limit]);
}

export function allVideoSlugs() {
  return run(`SELECT slug FROM doctor_videos v WHERE ${PUB} ORDER BY v.published_at DESC NULLS LAST`, []);
}
