// StarRating.js — CSS-only star display (supports halves via width overlay). No package.

export default function StarRating({ value = 0, size = 'base' }) {
  const pct = Math.max(0, Math.min(100, (Number(value) / 5) * 100));
  const cls = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-base';
  return (
    <span className={`relative inline-block leading-none ${cls}`} aria-label={`${value} out of 5`}>
      <span className="text-gray-300">★★★★★</span>
      <span className="absolute inset-0 overflow-hidden whitespace-nowrap text-brand" style={{ width: `${pct}%` }}>★★★★★</span>
    </span>
  );
}
