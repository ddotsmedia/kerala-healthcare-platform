// Charts.js — dependency-free SVG charts for the analytics dashboard.

const SRC_COLORS = { direct: '#64748b', organic: '#0d9488', social: '#6366f1', referral: '#f59e0b' };

export function FunnelChart({ steps }) {
  if (!steps || steps.length === 0) return <p className="text-sm text-gray-400">No funnel data yet.</p>;
  return (
    <div className="space-y-2">
      {steps.map((s, i) => {
        const prev = i > 0 ? steps[i - 1].n : s.n;
        const stepRate = prev > 0 ? Math.round((s.n / prev) * 100) : 0;
        return (
          <div key={s.key}>
            <div className="mb-0.5 flex justify-between text-xs text-gray-600">
              <span>{s.label}</span>
              <span className="font-semibold">{s.n}{i > 0 ? <span className="ml-1 text-gray-400">({stepRate}%)</span> : null}</span>
            </div>
            <div className="h-6 w-full rounded bg-gray-100">
              <div className="flex h-6 items-center rounded bg-brand px-2 text-[10px] font-semibold text-white" style={{ width: `${Math.max(s.pct, 3)}%` }}>{s.pct}%</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function LineChart({ series, height = 80 }) {
  const data = series || [];
  if (data.length === 0) return <p className="text-sm text-gray-400">No data.</p>;
  const W = 600, H = height, pad = 4;
  const max = Math.max(1, ...data.map((d) => d.n));
  const step = data.length > 1 ? (W - pad * 2) / (data.length - 1) : 0;
  const pts = data.map((d, i) => `${pad + i * step},${H - pad - (d.n / max) * (H - pad * 2)}`).join(' ');
  const total = data.reduce((a, d) => a + d.n, 0);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-24 w-full" preserveAspectRatio="none" role="img" aria-label="Registration trend">
        <polyline points={pts} fill="none" stroke="#0d9488" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <p className="mt-1 text-xs text-gray-400">{total} total over {data.length} days · peak {max}/day</p>
    </div>
  );
}

export function TrafficDonut({ sources }) {
  const total = (sources || []).reduce((a, s) => a + s.n, 0);
  if (total === 0) return <p className="text-sm text-gray-400">No traffic data yet.</p>;
  const R = 60, C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 160 160" className="h-32 w-32 -rotate-90">
        {sources.map((s) => {
          const frac = s.n / total;
          const dash = frac * C;
          const el = <circle key={s.source} cx="80" cy="80" r={R} fill="none" stroke={SRC_COLORS[s.source]} strokeWidth="20" strokeDasharray={`${dash} ${C - dash}`} strokeDashoffset={-offset} />;
          offset += dash;
          return el;
        })}
      </svg>
      <ul className="space-y-1 text-sm">
        {sources.map((s) => (
          <li key={s.source} className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: SRC_COLORS[s.source] }} />
            <span className="capitalize text-gray-700">{s.source}</span>
            <span className="text-gray-400">{s.n} ({Math.round((s.n / total) * 100)}%)</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
