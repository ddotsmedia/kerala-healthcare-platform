'use client';

import { useState } from 'react';
import { resolveLocale, t } from '@/lib/i18n';

const ML_PER_KG = 35;

export default function WaterIntakeCalculator({ params }) {
  const locale = resolveLocale(params.locale);
  const [w, setW] = useState('');
  const [litres, setLitres] = useState(null);

  function calc(e) {
    e.preventDefault();
    const kg = parseFloat(w);
    if (!(kg > 0)) { setLitres(null); return; }
    setLitres(Math.round((kg * ML_PER_KG) / 100) / 10);
  }
  const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-base';

  return (
    <div className="mx-auto max-w-sm space-y-4 py-4">
      <h1 className="text-xl font-bold">{t(locale, 'water_intake')}</h1>
      <form onSubmit={calc} className="space-y-3">
        <label className="block text-sm">{t(locale, 'weight')} (kg)
          <input className={inp} inputMode="decimal" value={w} onChange={(e) => setW(e.target.value)} required /></label>
        <button className="w-full rounded-lg bg-brand px-4 py-2 font-medium text-white">{t(locale, 'calculate')}</button>
      </form>
      {litres != null && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-xs uppercase text-gray-500">{t(locale, 'daily_water')}</p>
          <p className="text-3xl font-bold text-brand">{litres} L</p>
        </div>
      )}
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">{t(locale, 'consult_advice')}</p>
    </div>
  );
}
