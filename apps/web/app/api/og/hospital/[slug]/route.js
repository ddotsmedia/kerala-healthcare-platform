// GET /api/og/hospital/[slug] — 1200x630 social share card for a hospital.

import { getHospitalBySlug } from '@/lib/providers';
import { reviewSummary } from '@/lib/reviews';
import { ogCard, svgResponse } from '@/lib/ogImage';

export const dynamic = 'force-dynamic';

export async function GET(_request, props) {
  const { slug } = await props.params;
  const h = await getHospitalBySlug(slug);
  if (!h) return svgResponse(ogCard({ eyebrow: 'MalayaliDoctor', title: 'Hospital' }));
  const summary = await reviewSummary('hospital', h.id);
  const district = h.district_en || 'Kerala';
  const rating = summary.total_count ? `★ ${summary.avg_rating} (${summary.total_count})` : 'Verified listing';
  return svgResponse(ogCard({
    eyebrow: 'HOSPITAL · KERALA',
    title: h.name_en || h.name_ml,
    subtitle: `${district}, Kerala`,
    badge: rating
  }));
}
