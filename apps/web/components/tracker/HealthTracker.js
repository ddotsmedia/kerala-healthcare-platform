'use client';

// HealthTracker.js — grid of metric cards. Posts readings to the API, then
// refreshes server data. Range/day toggle (7 / 30 days).
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CARDS } from '@/lib/metricConfig';
import MetricCard from './MetricCard';

export default function HealthTracker({ data, locale = 'ml', days = 30 }) {
  const ml = locale === 'ml';
  const router = useRouter();
  const [error, setError] = useState('');

  async function add(payloads) {
    setError('');
    try {
      for (const p of payloads) {
        const r = await fetch('/api/patient/health-metrics', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p)
        });
        if (r.status === 401) { window.location.href = `/${locale}/login`; return; }
        if (!r.ok) { setError(ml ? 'സേവ് ചെയ്യാനായില്ല' : 'Could not save'); return; }
      }
      router.refresh();
    } catch { setError(ml ? 'പിശക് സംഭവിച്ചു' : 'Something went wrong'); }
  }

  function setDays(d) {
    const url = new URL(window.location.href);
    url.searchParams.set('days', String(d));
    window.location.href = url.toString();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">{ml ? 'കാഴ്ച:' : 'View:'}</span>
        {[7, 30].map((d) => (
          <button key={d} onClick={() => setDays(d)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${Number(days) === d ? 'bg-brand text-white' : 'border border-gray-300 text-gray-600'}`}>
            {d} {ml ? 'ദിവസം' : 'days'}
          </button>
        ))}
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card) => <MetricCard key={card.key} card={card} data={data} locale={locale} onAdd={add} />)}
      </div>
    </div>
  );
}
