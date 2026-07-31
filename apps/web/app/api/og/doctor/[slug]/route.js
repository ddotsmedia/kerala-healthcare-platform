// GET /api/og/doctor/[slug] — 1200x630 social share card for a doctor profile.

import { getDoctorBySlug } from '@/lib/providers';
import { reviewSummary } from '@/lib/reviews';
import { ogCard, svgResponse } from '@/lib/ogImage';

export const dynamic = 'force-dynamic';

export async function GET(_request, props) {
  const { slug } = await props.params;
  const d = await getDoctorBySlug(slug);
  if (!d) return svgResponse(ogCard({ eyebrow: 'MalayaliDoctor', title: 'Doctor profile' }));
  const summary = await reviewSummary('doctor', d.id);
  const specialty = d.specialty_en || d.specialty_ml || '';
  const district = d.district_en || 'Kerala';
  const rating = summary.total_count
    ? `★ ${summary.avg_rating} (${summary.total_count})`
    : (d.verification_status === 'verified' ? 'Verified profile' : '');
  return svgResponse(ogCard({
    eyebrow: 'VERIFIED DOCTOR · KERALA',
    title: d.display_name,
    subtitle: [specialty, district].filter(Boolean).join(' · '),
    badge: rating
  }));
}
