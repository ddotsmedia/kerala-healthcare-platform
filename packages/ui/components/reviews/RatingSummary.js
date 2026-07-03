// RatingSummary.js — average + star + distribution bars (CSS-only). Pure.

import StarRating from './StarRating.js';

export default function RatingSummary({ summary, locale = 'ml' }) {
  const avg = summary?.avg_rating || 0;
  const total = summary?.total_count || 0;
  const dist = summary?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const ml = locale === 'ml';

  if (total === 0) {
    return <p className="text-sm text-gray-500">{ml ? 'ഇതുവരെ റിവ്യൂകൾ ഇല്ല' : 'No reviews yet'}</p>;
  }
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div className="text-center sm:w-32 sm:shrink-0">
        <div className="text-4xl font-extrabold text-brand">{avg.toFixed(1)}</div>
        <StarRating value={avg} />
        <div className="mt-1 text-xs text-gray-500">({total} {ml ? 'റിവ്യൂകൾ' : 'reviews'})</div>
      </div>
      <div className="flex-1 space-y-1.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const n = dist[star] || 0;
          const pct = total ? Math.round((n / total) * 100) : 0;
          return (
            <div key={star} className="flex items-center gap-2 text-xs text-gray-600">
              <span className="w-6 shrink-0">{star}★</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                <span className="block h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
              </span>
              <span className="w-8 shrink-0 text-right">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
