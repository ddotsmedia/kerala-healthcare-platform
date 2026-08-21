// providerAnalytics.js — P-G3 provider performance. No new schema: uses
// provider_profile_views (P-F4), appointments, reviews. Cached 5 min.

import { getPool } from '@khp/db';
import { cached } from '@khp/cache';

async function rows(text, values) {
  return (await getPool().query(text, values)).rows;
}
const clampDays = (d, def) => Math.max(1, Math.min(365, parseInt(d, 10) || def));

const POSITIVE = ['good', 'great', 'excellent', 'caring', 'helpful', 'friendly', 'professional', 'recommend', 'best', 'kind', 'thorough', 'polite', 'patient', 'clean', 'gentle', 'knowledgeable', 'satisfied', 'wonderful', 'nice', 'comfortable'];
const NEGATIVE = ['rude', 'late', 'waiting', 'wait', 'bad', 'worst', 'unprofessional', 'dismissive', 'careless', 'expensive', 'rushed', 'dirty', 'poor', 'terrible', 'unhelpful', 'ignored', 'delay', 'disappointed', 'arrogant'];

function countKeywords(text, words) {
  const t = String(text || '').toLowerCase();
  return words.reduce((n, w) => (t.includes(w) ? n + 1 : n), 0);
}

/** Aggregate rows for all published doctors over the window. */
async function providerAggregates(days, specialtyId, districtId) {
  const d = clampDays(days, 30);
  return rows(
    `SELECT d.id, d.display_name, d.slug, d.photo_url, d.about_en, d.about_ml, d.consultation_fee,
            s.name_en AS specialty, di.name_en AS district,
            coalesce(pv.views,0)::int AS views, coalesce(pv.uniq,0)::int AS unique_visitors,
            coalesce(ap.bookings,0)::int AS bookings,
            coalesce(round(rv.avg_rating,1),0) AS avg_rating, coalesce(rv.n,0)::int AS review_count
       FROM doctors d
       LEFT JOIN specialties s ON s.id = d.specialty_id
       LEFT JOIN districts di ON di.id = d.district_id
       LEFT JOIN (SELECT provider_id, count(*) views,
                         count(DISTINCT coalesce(viewer_user_id::text, host(viewer_ip))) uniq
                    FROM provider_profile_views WHERE viewed_at > now() - make_interval(days => $1)
                   GROUP BY 1) pv ON pv.provider_id = d.id
       LEFT JOIN (SELECT provider_id, count(*) bookings FROM appointments
                   WHERE created_at > now() - make_interval(days => $1) AND deleted_at IS NULL
                   GROUP BY 1) ap ON ap.provider_id = d.id
       LEFT JOIN (SELECT entity_id, avg(rating) avg_rating, count(*) n FROM reviews
                   WHERE entity_type='doctor' AND status='approved' AND deleted_at IS NULL
                   GROUP BY 1) rv ON rv.entity_id = d.id
      WHERE d.deleted_at IS NULL AND d.listing_status='published'
        AND ($2::uuid IS NULL OR d.specialty_id = $2)
        AND ($3::uuid IS NULL OR d.district_id = $3)`,
    [d, specialtyId || null, districtId || null]
  );
}

function withScore(r) {
  const bookingRate = r.views > 0 ? r.bookings / r.views : 0;
  const rating = Number(r.avg_rating) || 0;
  // views × booking_rate × rating, plus a small views term to rank cold-start profiles.
  const score = Math.round((r.views * bookingRate * Math.max(rating, 1) + r.views * 0.1) * 10) / 10;
  return {
    ...r, avg_rating: rating, conversion_rate: Math.round(bookingRate * 1000) / 10, score
  };
}

export function getProviderPerformance(providerId, days = 30) {
  const d = clampDays(days, 30);
  return cached(`prov:perf:${providerId}:${d}`, 300, async () => {
    const [r] = await providerAggregates(d, null, null).then((all) => all.filter((x) => x.id === providerId));
    if (!r) return null;
    const perf = withScore(r);
    perf.review_sentiment = await getReviewSentiment(providerId);
    return perf;
  });
}

export function getTopPerformingProviders({ specialtyId, districtId, days = 30, limit = 15 } = {}) {
  const d = clampDays(days, 30);
  return cached(`prov:top:${specialtyId || 'all'}:${districtId || 'all'}:${d}:${limit}`, 300, async () => {
    const all = (await providerAggregates(d, specialtyId, districtId)).map(withScore);
    const leaderboard = [...all].sort((a, b) => b.score - a.score).slice(0, limit);
    const underperforming = all.filter((r) => r.views <= 3 && r.bookings === 0).slice(0, 20);
    const needsProfile = all
      .filter((r) => !r.photo_url || (!r.about_en && !r.about_ml) || r.consultation_fee == null)
      .map((r) => ({
        ...r,
        missing: [!r.photo_url && 'photo', (!r.about_en && !r.about_ml) && 'about', r.consultation_fee == null && 'fee'].filter(Boolean)
      })).slice(0, 20);
    return { leaderboard, underperforming, needsProfile, total: all.length };
  });
}

export async function getReviewSentiment(providerId) {
  const rv = await rows(
    `SELECT body FROM reviews
      WHERE entity_type='doctor' AND entity_id=$1 AND status='approved' AND deleted_at IS NULL AND body IS NOT NULL`,
    [providerId]
  );
  let positive = 0, negative = 0;
  for (const r of rv) { positive += countKeywords(r.body, POSITIVE); negative += countKeywords(r.body, NEGATIVE); }
  const total = positive + negative;
  return { positive, negative, score: total > 0 ? Math.round((positive / total) * 100) : null, sample: rv.length };
}
