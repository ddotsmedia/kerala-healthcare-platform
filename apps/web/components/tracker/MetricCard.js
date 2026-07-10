'use client';

// MetricCard.js — one metric: latest value, normal range, out-of-range highlight,
// 30-day sparkline, inline add form. kind = single | bp | sugar | mood.
import { useState } from 'react';
import { UNIT, RANGE_TEXT, isOutOfRange } from '@/lib/metricConfig';
import Sparkline from './Sparkline';

const MOODS = ['😢', '🙁', '😐', '🙂', '😄'];
const TREND = { up: '↑', down: '↓', stable: '→', none: '' };
const fmtDate = (d) => (d ? String(d).slice(0, 10) : '');

export default function MetricCard({ card, data, locale = 'ml', onAdd }) {
  const ml = locale === 'ml';
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({});
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(payloads) {
    setBusy(true);
    try { await onAdd(payloads); setForm({}); } finally { setBusy(false); }
  }

  const rangeText = RANGE_TEXT[card.kind === 'bp' ? 'systolic_bp' : card.kind === 'sugar' ? 'blood_sugar_fasting' : card.key];
  const inp = 'w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm';

  // --- latest display ---
  let latestEl;
  if (card.kind === 'bp') {
    const s = data.systolic_bp.stats, d = data.diastolic_bp.stats;
    const bad = isOutOfRange('systolic_bp', s.latest) === true || isOutOfRange('diastolic_bp', d.latest) === true;
    latestEl = <span className={bad ? 'text-red-600' : 'text-gray-900'}>{s.latest ?? '—'}/{d.latest ?? '—'} <span className="text-xs font-normal text-gray-400">mmHg</span></span>;
  } else if (card.kind === 'sugar') {
    const f = data.blood_sugar_fasting.stats, p = data.blood_sugar_pp.stats;
    latestEl = <span className="text-gray-900 text-base">F {f.latest ?? '—'} · PP {p.latest ?? '—'} <span className="text-xs font-normal text-gray-400">mg/dL</span></span>;
  } else if (card.kind === 'mood') {
    const v = data.mood.stats.latest;
    latestEl = <span className="text-gray-900">{v ? MOODS[Math.min(4, Math.max(0, Math.round(v) - 1))] : '—'}</span>;
  } else {
    const st = data[card.key].stats;
    const bad = isOutOfRange(card.key, st.latest) === true;
    latestEl = <span className={bad ? 'text-red-600' : 'text-gray-900'}>{st.latest ?? '—'} <span className="text-xs font-normal text-gray-400">{UNIT[card.key]}</span></span>;
  }

  const primary = card.kind === 'bp' ? 'systolic_bp' : card.kind === 'sugar' ? 'blood_sugar_fasting' : card.key;
  const st = data[primary].stats;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">{card.icon} {ml ? card.ml : card.en}</h3>
          <p className="mt-0.5 text-xl font-bold">{latestEl} {st.trend !== 'none' && <span className="text-xs text-gray-400">{TREND[st.trend]}</span>}</p>
          {rangeText && <p className="text-[11px] text-gray-400">{ml ? rangeText.ml : rangeText.en}</p>}
        </div>
        {st.count > 0 && <span className="text-[11px] text-gray-400">{st.count} {ml ? 'റീഡിംഗ്' : 'readings'}</span>}
      </div>

      <div className="mt-2"><Sparkline readings={data[primary].readings} type={primary} /></div>

      {/* Add form */}
      {card.kind === 'bp' && (
        <div className="mt-2 flex items-end gap-2">
          <input type="number" inputMode="numeric" placeholder={ml ? 'സിസ്റ്റോളിക്' : 'Systolic'} value={form.sys || ''} onChange={(e) => set('sys', e.target.value)} className={inp} />
          <input type="number" inputMode="numeric" placeholder={ml ? 'ഡയസ്റ്റോളിക്' : 'Diastolic'} value={form.dia || ''} onChange={(e) => set('dia', e.target.value)} className={inp} />
          <button disabled={busy || !form.sys || !form.dia} onClick={() => submit([{ metric_type: 'systolic_bp', value: form.sys }, { metric_type: 'diastolic_bp', value: form.dia }])}
            className="shrink-0 rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50">+</button>
        </div>
      )}
      {card.kind === 'sugar' && (
        <div className="mt-2 flex items-end gap-2">
          <select value={form.stype || 'blood_sugar_fasting'} onChange={(e) => set('stype', e.target.value)} className={inp}>
            <option value="blood_sugar_fasting">{ml ? 'ഫാസ്റ്റിംഗ്' : 'Fasting'}</option>
            <option value="blood_sugar_pp">{ml ? 'PP' : 'Post-prandial'}</option>
          </select>
          <input type="number" inputMode="numeric" placeholder="mg/dL" value={form.val || ''} onChange={(e) => set('val', e.target.value)} className={inp} />
          <button disabled={busy || !form.val} onClick={() => submit([{ metric_type: form.stype || 'blood_sugar_fasting', value: form.val }])}
            className="shrink-0 rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50">+</button>
        </div>
      )}
      {card.kind === 'mood' && (
        <div className="mt-2 flex items-center justify-between">
          {MOODS.map((m, i) => (
            <button key={i} disabled={busy} onClick={() => submit([{ metric_type: 'mood', value: i + 1 }])}
              className="rounded-lg px-1.5 py-1 text-2xl hover:bg-gray-100 disabled:opacity-50" aria-label={`mood ${i + 1}`}>{m}</button>
          ))}
        </div>
      )}
      {card.kind === 'single' && (
        <div className="mt-2 flex items-end gap-2">
          <input type="number" inputMode="decimal" step={card.step} placeholder={UNIT[card.key]} value={form.val || ''} onChange={(e) => set('val', e.target.value)} className={inp} />
          <button disabled={busy || !form.val} onClick={() => submit([{ metric_type: card.key, value: form.val }])}
            className="shrink-0 rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50">+</button>
        </div>
      )}
      {st.latestAt && <p className="mt-1 text-[10px] text-gray-300">{ml ? 'അവസാനം' : 'Last'}: {fmtDate(st.latestAt)}</p>}
    </div>
  );
}
