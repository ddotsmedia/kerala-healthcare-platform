'use client';

import { useState, use } from 'react';
import { resolveLocale } from '@/lib/i18n';

export default function HeartRate(props) {
  const params = use(props.params);
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const [age, setAge] = useState('');
  const [max, setMax] = useState(null);

  function calc(e) {
    e.preventDefault();
    const a = parseInt(age, 10);
    if (!(a > 0 && a < 120)) { setMax(null); return; }
    setMax(220 - a);
  }
  const zone = (lo, hi) => max ? `${Math.round(max * lo)}–${Math.round(max * hi)} bpm` : '';
  const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-base';

  return (
    <div className="mx-auto max-w-sm space-y-4 py-4">
      <h1 className="text-xl font-bold">{ml ? 'ഹൃദയമിടിപ്പ് സോണുകൾ' : 'Heart Rate Zones'}</h1>
      <form onSubmit={calc} className="space-y-3">
        <label className="block text-sm">{ml ? 'വയസ്സ്' : 'Age'}
          <input className={inp} inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} required /></label>
        <button className="w-full rounded-lg bg-brand px-4 py-2 font-medium text-white">{ml ? 'കണക്കാക്കുക' : 'Calculate'}</button>
      </form>
      {max != null && (
        <div className="space-y-2 rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-center text-sm text-gray-600">{ml ? 'പരമാവധി ഹൃദയമിടിപ്പ്' : 'Max heart rate'}: <span className="text-2xl font-bold text-brand">{max}</span> bpm</p>
          {[[ml ? 'വാം-അപ്' : 'Warm-up', 0.5, 0.6], [ml ? 'ഫാറ്റ് ബേൺ' : 'Fat burn', 0.6, 0.7], [ml ? 'എയ്‌റോബിക്' : 'Aerobic', 0.7, 0.8], [ml ? 'തീവ്രം' : 'Peak', 0.8, 0.9]].map(([lbl, lo, hi], i) => (
            <div key={i} className="flex justify-between text-sm"><span className="text-gray-700">{lbl}</span><span className="font-medium">{zone(lo, hi)}</span></div>
          ))}
        </div>
      )}
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">{ml ? 'ഇത് ഏകദേശ കണക്ക് മാത്രം. വ്യായാമത്തിന് മുൻപ് ഡോക്ടറെ സമീപിക്കുക.' : 'Estimate only. Consult a doctor before starting exercise.'}</p>
    </div>
  );
}
