'use client';

import { useState } from 'react';
import { resolveLocale, t } from '@/lib/i18n';

export default function DueDateCalculator({ params }) {
  const locale = resolveLocale(params.locale);
  const [lmp, setLmp] = useState('');
  const [res, setRes] = useState(null);

  function calc(e) {
    e.preventDefault();
    if (!lmp) { setRes(null); return; }
    const start = new Date(`${lmp}T00:00:00Z`);
    if (isNaN(start)) { setRes(null); return; }
    const due = new Date(start.getTime() + 280 * 24 * 3600 * 1000);
    const weeks = Math.floor((Date.now() - start.getTime()) / (7 * 24 * 3600 * 1000));
    const tri = weeks < 13 ? 1 : weeks < 27 ? 2 : 3;
    setRes({ due: due.toISOString().slice(0, 10), weeks: Math.max(0, weeks), tri });
  }
  const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-base';

  return (
    <div className="mx-auto max-w-sm space-y-4 py-4">
      <h1 className="text-xl font-bold">{t(locale, 'due_date')}</h1>
      <form onSubmit={calc} className="space-y-3">
        <label className="block text-sm">{t(locale, 'lmp')}
          <input type="date" className={inp} value={lmp} onChange={(e) => setLmp(e.target.value)} required /></label>
        <button className="w-full rounded-lg bg-brand px-4 py-2 font-medium text-white">{t(locale, 'calculate')}</button>
      </form>
      {res && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-xs uppercase text-gray-500">{t(locale, 'estimated_due')}</p>
          <p className="text-2xl font-bold text-brand">{res.due}</p>
          <p className="mt-1 text-sm text-gray-700">{t(locale, 'trimester')} {res.tri} · {res.weeks} weeks</p>
        </div>
      )}
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">{t(locale, 'consult_advice')}</p>
    </div>
  );
}
