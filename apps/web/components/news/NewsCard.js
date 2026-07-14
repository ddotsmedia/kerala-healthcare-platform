// NewsCard.js — one news item in the feed. Server-safe (no client hooks).
import Link from 'next/link';
import { categoryLabel, categoryClass, relativeTime } from '@/lib/newsFormat';

export default function NewsCard({ item, locale = 'ml' }) {
  const ml = locale === 'ml';
  const title = (ml ? item.title_ml : item.title_en) || item.title_ml;
  const summary = (ml ? item.summary_ml : item.summary_en) || item.summary_ml;
  const district = ml ? item.district_ml : item.district_en;
  return (
    <Link href={`/${locale}/news/${item.slug}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className={`rounded px-1.5 py-0.5 font-medium ${categoryClass(item.category)}`}>{categoryLabel(item.category, locale)}</span>
        {item.importance === 'breaking' && <span className="rounded bg-red-600 px-1.5 py-0.5 font-medium text-white">{ml ? 'ബ്രേക്കിംഗ്' : 'BREAKING'}</span>}
        {item.importance === 'high' && <span className="rounded bg-orange-100 px-1.5 py-0.5 font-medium text-orange-700">{ml ? 'പ്രധാനം' : 'High'}</span>}
        {district && <span className="text-gray-400">📍 {district}</span>}
        <span className="text-gray-400">· {relativeTime(item.published_at, locale)}</span>
      </div>
      <h3 className="mt-1.5 line-clamp-2 font-semibold text-gray-900">{title}</h3>
      <p className="mt-0.5 line-clamp-2 text-sm text-gray-500">{summary}</p>
      {item.source && <p className="mt-1 text-xs text-gray-400">{ml ? 'ഉറവിടം' : 'Source'}: {item.source}</p>}
    </Link>
  );
}
