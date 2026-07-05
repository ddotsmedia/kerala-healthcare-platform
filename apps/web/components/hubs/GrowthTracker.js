'use client';

// GrowthTracker — rough weight-for-age band (hardcoded, no package/API).
// Educational only; not a clinical growth assessment.
import { useState, use } from 'react';
import { resolveLocale } from '@/lib/i18n';

// Approx healthy weight (kg) midpoints by age in months (WHO-ish, simplified).
const REF = [
  [0, 3.3], [3, 6.0], [6, 7.5], [12, 9.5], [24, 12.5], [36, 14.5], [48, 16.5], [60, 18.5],
  [84, 23], [108, 30], [144, 40]
];
function expected(months) {
  let prev = REF[0];
  for (const r of REF) { if (r[0] >= months) { return interp(prev, r, months); } prev = r; }
  return REF[REF.length - 1][1];
}
function interp(a, b, x) {
  if (b[0] === a[0]) return b[1];
  return a[1] + (b[1] - a[1]) * ((x - a[0]) / (b[0] - a[0]));
}

export default function GrowthTracker(props) {
  const params = use(props.params);
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const [months, setMonths] = useState('');
  const [weight, setWeight] = useState('');
  const [band, setBand] = useState(null);

  function calc(e) {
    e.preventDefault();
    const m = parseInt(months, 10), w = parseFloat(weight);
    if (!(m >= 0 && m <= 216) || !(w > 0)) { setBand(null); return; }
    const exp = expected(m);
    const ratio = w / exp;
    if (ratio < 0.85) setBand({ k: 'under', ml: 'ഭാരക്കുറവ്', en: 'Underweight', cls: 'text-orange-600' });
    else if (ratio > 1.2) setBand({ k: 'over', ml: 'അമിതഭാരം', en: 'Overweight', cls: 'text-orange-600' });
    else setBand({ k: 'normal', ml: 'സാധാരണം', en: 'Normal', cls: 'text-green-600' });
  }
  const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-base';

  return (
    <div className="mx-auto max-w-sm space-y-3">
      <form onSubmit={calc} className="space-y-3">
        <label className="block text-sm">{ml ? 'പ്രായം (മാസം)' : 'Age (months)'}
          <input className={inp} inputMode="numeric" value={months} onChange={(e) => setMonths(e.target.value)} required /></label>
        <label className="block text-sm">{ml ? 'ഭാരം (kg)' : 'Weight (kg)'}
          <input className={inp} inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} required /></label>
        <button className="w-full rounded-lg bg-brand px-4 py-2 font-medium text-white">{ml ? 'പരിശോധിക്കുക' : 'Check'}</button>
      </form>
      {band && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className={`text-xl font-bold ${band.cls}`}>{ml ? band.ml : band.en}</p>
        </div>
      )}
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">{ml ? 'കൃത്യമായ വളർച്ചാ വിലയിരുത്തലിന് നിങ്ങളുടെ ഡോക്ടറെ സമീപിക്കുക.' : 'Consult your doctor for accurate growth assessment.'}</p>
    </div>
  );
}
