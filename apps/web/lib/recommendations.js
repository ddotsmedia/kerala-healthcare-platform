import { sql } from '@khp/db';
import { cache } from '@khp/cache';

export async function getRecommendations(userId) {
  const key = `recs:${userId}`;
  const cached = await cache.get(key);
  if (cached) return JSON.parse(cached);

  const recent = await sql`
    SELECT DISTINCT doctor_id
    FROM appointments
    WHERE patient_id = ${userId}
    LIMIT 5
  `;

  const recIds = recent.map((r) => r.doctor_id);

  const recs = await sql`
    SELECT
      d.id,
      d.display_name,
      d.specialty_en,
      d.rating,
      COUNT(a.id) as score
    FROM appointments a
    JOIN doctors d ON a.doctor_id = d.id
    WHERE a.doctor_id != ${recIds.length > 0 ? sql`ANY(${recIds})` : sql`NULL`}
    AND d.listing_status = 'published'
    GROUP BY d.id
    ORDER BY score DESC
    LIMIT 5
  `;

  await cache.setex(key, 3600, JSON.stringify(recs));
  return recs;
}
