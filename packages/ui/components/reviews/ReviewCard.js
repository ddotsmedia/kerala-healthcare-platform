// ReviewCard.js — a single approved review. Pure.

import StarRating from './StarRating.js';

function relativeTime(dateStr, locale = 'ml') {
  const ml = locale === 'ml';
  const then = new Date(dateStr).getTime();
  if (!then) return '';
  const secs = Math.max(1, Math.floor((Date.now() - then) / 1000));
  const units = [
    [31536000, ml ? 'വർഷം' : 'yr'],
    [2592000, ml ? 'മാസം' : 'mo'],
    [86400, ml ? 'ദിവസം' : 'd'],
    [3600, ml ? 'മണിക്കൂർ' : 'h'],
    [60, ml ? 'മിനിറ്റ്' : 'm']
  ];
  for (const [s, label] of units) {
    const v = Math.floor(secs / s);
    if (v >= 1) return ml ? `${v} ${label} മുൻപ്` : `${v}${label} ago`;
  }
  return ml ? 'ഇപ്പോൾ' : 'just now';
}

export default function ReviewCard({ review, locale = 'ml' }) {
  const ml = locale === 'ml';
  const name = review.is_anonymous || !review.patient_name
    ? (ml ? 'അജ്ഞാത രോഗി' : 'Anonymous Patient')
    : review.patient_name;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <StarRating value={review.rating} size="sm" />
        {review.appointment_id && (
          <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
            ✓ {ml ? 'സ്ഥിരീകരിച്ച സന്ദർശനം' : 'Verified Visit'}
          </span>
        )}
      </div>
      {review.title && <h4 className="mt-2 text-sm font-bold text-gray-900">{review.title}</h4>}
      {review.body && <p className="mt-1 text-sm leading-relaxed text-gray-700">{review.body}</p>}
      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
        <span className="font-medium text-gray-600">{name}</span>
        <span aria-hidden="true">·</span>
        <span>{relativeTime(review.created_at, locale)}</span>
      </div>
    </div>
  );
}
