'use client';

// ResultsEditor.js — enter values for tracked lab markers. Controlled by parent.
// results = { hba1c: {value, unit, normal_min, normal_max}, ... }
import { MARKERS } from '@/lib/labMarkers';

export default function ResultsEditor({ results = {}, onChange, locale = 'ml' }) {
  const ml = locale === 'ml';
  const set = (key, field, v) => onChange({ ...results, [key]: { ...(results[key] || {}), [field]: v } });
  const inp = 'rounded-lg border border-gray-300 px-2 py-1 text-sm';

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-gray-600">{ml ? 'ഫലങ്ങൾ (പൂരിപ്പിക്കുന്നവ മാത്രം സേവ് ചെയ്യും)' : 'Results (only filled markers are saved)'}</p>
      <div className="space-y-1">
        {MARKERS.map((m) => {
          const r = results[m.key] || {};
          return (
            <div key={m.key} className="flex items-center gap-1.5">
              <span className="w-28 shrink-0 truncate text-xs text-gray-600">{ml ? m.ml : m.en}</span>
              <input type="number" step="0.01" inputMode="decimal" value={r.value ?? ''} onChange={(e) => set(m.key, 'value', e.target.value)}
                placeholder={ml ? 'മൂല്യം' : 'value'} className={`${inp} w-20`} />
              <input value={r.unit ?? m.unit} onChange={(e) => set(m.key, 'unit', e.target.value)} className={`${inp} w-16`} />
              <span className="hidden text-[10px] text-gray-400 sm:inline">{m.normal.min ?? '–'}–{m.normal.max ?? '∞'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
