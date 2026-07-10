// Sparkline.js — inline SVG line chart, no charting library. Pure component.
// Plots values oldest→newest; out-of-range points drawn red.

import { isOutOfRange } from '@/lib/metricConfig';

export default function Sparkline({ readings = [], type, width = 240, height = 56 }) {
  const pts = readings.map((r) => Number(r.value)).filter((n) => Number.isFinite(n));
  if (pts.length < 2) {
    return <div className="flex h-14 items-center justify-center text-xs text-gray-300">{pts.length ? '•' : '—'}</div>;
  }
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const span = max - min || 1;
  const pad = 4;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const x = (i) => pad + (i / (pts.length - 1)) * w;
  const y = (v) => pad + h - ((v - min) / span) * h;
  const path = pts.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-14 w-full" preserveAspectRatio="none" role="img" aria-label="trend">
      <path d={path} fill="none" stroke="#0d9488" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((v, i) => {
        const bad = isOutOfRange(type, v) === true;
        return <circle key={i} cx={x(i)} cy={y(v)} r={bad ? 2.6 : 1.8} fill={bad ? '#dc2626' : '#0d9488'} />;
      })}
    </svg>
  );
}
