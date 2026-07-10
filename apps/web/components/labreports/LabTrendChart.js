'use client';

// LabTrendChart.js — pick a marker, fetch its history, draw an SVG line chart
// with the normal band shaded. No charting library.
import { useEffect, useState } from 'react';
import { MARKERS, markerByKey } from '@/lib/labMarkers';

const TREND_LABEL = {
  up: { ml: 'വർധിക്കുന്നു', en: 'rising' }, down: { ml: 'കുറയുന്നു', en: 'falling' },
  stable: { ml: 'സ്ഥിരം', en: 'stable' }, none: { ml: '', en: '' }
};

export default function LabTrendChart({ locale = 'ml' }) {
  const ml = locale === 'ml';
  const [param, setParam] = useState('hba1c');
  const [points, setPoints] = useState([]);
  const [meta, setMeta] = useState({ trend: 'none', band: {} });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`/api/patient/lab-reports/trends?parameter=${param}`)
      .then((r) => r.json()).then((j) => { if (alive) { setPoints(j.data || []); setMeta(j.meta || { trend: 'none', band: {} }); } })
      .catch(() => {}).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [param]);

  const marker = markerByKey(param);
  const W = 320, H = 120, pad = 24;
  const vals = points.map((p) => p.value);
  const band = meta.band || {};
  const allNums = [...vals, band.min, band.max].filter((n) => n != null && Number.isFinite(Number(n))).map(Number);
  const lo = allNums.length ? Math.min(...allNums) : 0;
  const hi = allNums.length ? Math.max(...allNums) : 1;
  const span = hi - lo || 1;
  const x = (i) => pad + (points.length > 1 ? (i / (points.length - 1)) : 0.5) * (W - pad * 2);
  const y = (v) => pad + (H - pad * 2) - ((v - lo) / span) * (H - pad * 2);
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-700">📊 {ml ? 'ട്രെൻഡുകൾ' : 'Trends'}</h2>
        <select value={param} onChange={(e) => setParam(e.target.value)} className="rounded-lg border border-gray-300 px-2 py-1 text-sm">
          {MARKERS.map((m) => <option key={m.key} value={m.key}>{ml ? m.ml : m.en}</option>)}
        </select>
      </div>

      {loading ? <p className="py-8 text-center text-sm text-gray-400">…</p>
        : points.length === 0 ? <p className="py-8 text-center text-sm text-gray-400">{ml ? 'ഈ പാരാമീറ്ററിന് ഡാറ്റ ഇല്ല.' : 'No data for this parameter yet.'}</p>
        : (
          <div className="mt-2">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="trend chart">
              {band.min != null && band.max != null && (
                <rect x={pad} y={y(band.max)} width={W - pad * 2} height={Math.max(0, y(band.min) - y(band.max))} fill="#dcfce7" />
              )}
              {band.max != null && <line x1={pad} x2={W - pad} y1={y(band.max)} y2={y(band.max)} stroke="#86efac" strokeDasharray="3 3" />}
              {band.min != null && <line x1={pad} x2={W - pad} y1={y(band.min)} y2={y(band.min)} stroke="#86efac" strokeDasharray="3 3" />}
              <path d={path} fill="none" stroke="#0d9488" strokeWidth="2" strokeLinejoin="round" />
              {points.map((p, i) => <circle key={i} cx={x(i)} cy={y(p.value)} r={p.out ? 4 : 3} fill={p.out ? '#dc2626' : '#0d9488'} />)}
            </svg>
            <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
              <span>{points[0].date} → {points[points.length - 1].date}</span>
              <span>{ml ? 'ഏറ്റവും പുതിയത്' : 'Latest'}: <b className={points[points.length - 1].out ? 'text-red-600' : 'text-gray-800'}>{points[points.length - 1].value} {marker?.unit}</b> · {ml ? TREND_LABEL[meta.trend].ml : TREND_LABEL[meta.trend].en}</span>
            </div>
          </div>
        )}
      <p className="mt-2 text-[11px] text-gray-400">{ml ? `സാധാരണ പരിധി: ${marker?.normal.min ?? '–'}–${marker?.normal.max ?? '∞'} ${marker?.unit || ''}` : `Normal: ${marker?.normal.min ?? '–'}–${marker?.normal.max ?? '∞'} ${marker?.unit || ''}`}</p>
    </div>
  );
}
