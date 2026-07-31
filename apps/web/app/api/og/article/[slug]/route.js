// GET /api/og/article/[slug] — 1200x630 social share card for a health article.

import { getPublishedContent } from '@/lib/knowledge';
import { ogCard, svgResponse } from '@/lib/ogImage';

export const dynamic = 'force-dynamic';

export async function GET(_request, props) {
  const { slug } = await props.params;
  const c = await getPublishedContent(slug);
  if (!c) return svgResponse(ogCard({ eyebrow: 'MalayaliDoctor', title: 'Health article' }));
  const title = c.title_en || c.title_ml || 'Health article';
  const category = (c.category || 'Health').replace(/-/g, ' ');
  return svgResponse(ogCard({
    eyebrow: `HEALTH ARTICLE · ${category.toUpperCase()}`,
    title,
    subtitle: 'Trusted health information in Malayalam & English',
    badge: 'Read on MalayaliDoctor'
  }));
}
