// BreakingBanner.js — red scrolling-style breaking-news strip. Server-safe.
import Link from 'next/link';

export default function BreakingBanner({ items = [], locale = 'ml' }) {
  if (!items.length) return null;
  const ml = locale === 'ml';
  return (
    <div className="flex items-stretch overflow-hidden rounded-lg bg-red-600 text-white">
      <span className="flex shrink-0 items-center gap-1 bg-red-700 px-3 py-2 text-xs font-bold uppercase">
        🔴 {ml ? 'ബ്രേക്കിംഗ്' : 'Breaking'}
      </span>
      <div className="flex flex-1 items-center gap-6 overflow-x-auto px-3 py-2 text-sm">
        {items.map((n) => (
          <Link key={n.id} href={`/${locale}/news/${n.slug}`} className="shrink-0 whitespace-nowrap font-medium hover:underline">
            {(ml ? n.title_ml : n.title_en) || n.title_ml}
          </Link>
        ))}
      </div>
    </div>
  );
}
