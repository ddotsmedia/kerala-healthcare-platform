'use client';

import { useState } from 'react';
import { resolveLocale, t } from '@/lib/i18n';

const CM_PER_IN = 2.54, KG_PER_LB = 0.453592;

export default function BmiCalculator({ params }) {
  const locale = resolveLocale(params.locale);
  const [unit, setUnit] = useState('metric');
  const [h, setH] = useState('');
  const [w, setW] = useState('');
  const [bmi, setBmi] = useState(null);

  function calc(e) {
    e.preventDefault();
    let cm = parseFloat(h), kg = parseFloat(w);
    if (unit === 'imperial') { cm = parseFloat(h) * CM_PER_IN; kg = parseFloat(w) * KG_PER_LB; }
    if (!(cm > 0) || !(kg > 0)) { setBmi(null); return; }
    const m = cm / 100;
    setBmi(Math.round((kg / (m * m)) * 10) / 10);
  }

  const category = bmi == null ? '' : bmi < 18.5 ? 'underweight' : bmi < 25 ? 'normal_weight' : bmi < 30 ? 'overweight' : 'obese';
  const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-base';

  return (
    <div className="mx-auto max-w-sm space-y-4 py-4">
      <h1 className="text-xl font-bold">{t(locale, 'bmi')}</h1>
      <div className="flex gap-2 text-sm">
        {['metric', 'imperial'].map((u) => (
          <button key={u} onClick={() => setUnit(u)} className={`rounded-full px-3 py-1 ${unit === u ? 'bg-brand text-white' : 'border border-gray-300'}`}>{t(locale, u)}</button>
        ))}
      </div>
      <form onSubmit={calc} className="space-y-3">
        <label className="block text-sm">{t(locale, 'height')} ({unit === 'metric' ? 'cm' : 'in'})
          <input className={inp} inputMode="decimal" value={h} onChange={(e) => setH(e.target.value)} required /></label>
        <label className="block text-sm">{t(locale, 'weight')} ({unit === 'metric' ? 'kg' : 'lb'})
          <input className={inp} inputMode="decimal" value={w} onChange={(e) => setW(e.target.value)} required /></label>
        <button className="w-full rounded-lg bg-brand px-4 py-2 font-medium text-white">{t(locale, 'calculate')}</button>
      </form>
      {bmi != null && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-3xl font-bold text-brand">{bmi}</p>
          <p className="text-sm text-gray-700">{t(locale, category)}</p>
        </div>
      )}
      <p className="text-xs text-gray-500">{t(locale, 'bmi_note')}</p>
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">{t(locale, 'consult_advice')}</p>
    </div>
  );
}
