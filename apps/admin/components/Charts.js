// Charts.js — dependency-free SVG charts shared across admin pages.

export function LineChart({ series = [], height = 90, stroke = '#0d9488', label }) {
  if (!series.length) return <p className="text-sm text-ink-soft">No data.</p>;
  const W = 640, H = height, pad = 4;
  const max = Math.max(1, ...series.map((p) => p.n));
  const step = series.length > 1 ? (W - pad * 2) / (series.length - 1) : 0;
  const pts = series.map((p, i) => `${pad + i * step},${H - pad - (p.n / max) * (H - pad * 2)}`);
  const area = `${pad},${H - pad} ${pts.join(' ')} ${pad + (series.length - 1) * step},${H - pad}`;
  const total = series.reduce((a, p) => a + p.n, 0);
  return (
    <div>
      {label && <div className="mb-1 flex items-baseline justify-between"><span className="text-xs font-semibold text-ink-soft">{label}</span><span className="text-xs text-ink-soft">{total} total · peak {max}</span></div>}
      <svg viewBox={`0 0 ${W} ${H}`} className="h-24 w-full" preserveAspectRatio="none" role="img" aria-label={label || 'trend'}>
        <polygon points={area} fill={stroke} opacity="0.10" />
        <polyline points={pts.join(' ')} fill="none" stroke={stroke} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

export function Bars({ series = [], color = '#0d9488', height = 90 }) {
  if (!series.length) return <p className="text-sm text-ink-soft">No data.</p>;
  const max = Math.max(1, ...series.map((p) => p.n));
  return (
    <div className="flex items-end gap-0.5" style={{ height }}>
      {series.map((p, i) => (
        <div key={i} className="flex flex-1 flex-col items-center justify-end" title={`${p.day}: ${p.n}`}>
          <div className="w-full rounded-t" style={{ height: `${Math.max(2, (p.n / max) * (height - 8))}px`, background: color }} />
        </div>
      ))}
    </div>
  );
}
