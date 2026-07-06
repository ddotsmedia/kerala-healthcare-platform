'use client';

// Manage saved job alerts: toggle on/off, change frequency, test-send, delete.
import { useState } from 'react';

const FREQS = (ml) => [
  ['instant', ml ? 'തൽക്ഷണം' : 'Instant'],
  ['daily', ml ? 'ദിവസേന' : 'Daily'],
  ['weekly', ml ? 'ആഴ്ചയിൽ' : 'Weekly']
];

function chips(filters, ml) {
  const f = filters || {};
  const out = [];
  if (f.term) out.push(`"${f.term}"`);
  if (f.job_type) out.push(f.job_type.replace('_', ' '));
  if (f.role_category) out.push(f.role_category);
  if (f.is_remote) out.push(ml ? 'റിമോട്ട്' : 'Remote');
  if (f.is_urgent) out.push(ml ? 'അടിയന്തരം' : 'Urgent');
  if (f.salary_min) out.push(`₹${Number(f.salary_min).toLocaleString('en-IN')}+`);
  return out.length ? out : [ml ? 'എല്ലാ ജോലികളും' : 'All jobs'];
}

export default function AlertsManager({ alerts: initial = [], locale = 'ml' }) {
  const ml = locale === 'ml';
  const [alerts, setAlerts] = useState(initial);
  const [busy, setBusy] = useState(null);
  const [flash, setFlash] = useState(null);

  async function patch(id, body) {
    setBusy(id);
    try {
      const r = await fetch(`/api/jobs/alerts/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (r.ok) { const { data } = await r.json(); setAlerts((a) => a.map((x) => x.id === id ? { ...x, ...data } : x)); }
    } finally { setBusy(null); }
  }

  async function remove(id) {
    setBusy(id);
    try {
      const r = await fetch(`/api/jobs/alerts/${id}`, { method: 'DELETE' });
      if (r.ok) setAlerts((a) => a.filter((x) => x.id !== id));
    } finally { setBusy(null); }
  }

  async function test(id) {
    setBusy(id);
    try {
      const r = await fetch(`/api/jobs/alerts/${id}/test`, { method: 'POST' });
      setFlash({ id, ok: r.ok });
      setTimeout(() => setFlash(null), 3000);
    } finally { setBusy(null); }
  }

  if (!alerts.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
        <div className="text-3xl">🔔</div>
        <p className="mt-2">{ml ? 'സേവ് ചെയ്ത അലേർട്ടുകൾ ഇല്ല.' : 'No saved alerts yet.'}</p>
        <a href={`/${locale}/jobs`} className="mt-3 inline-block text-sm font-medium text-brand">{ml ? 'ജോലികൾ തിരയുക →' : 'Search jobs →'}</a>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {alerts.map((a) => (
        <li key={a.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-gray-900">{a.name}</h3>
              <div className="mt-1 flex flex-wrap gap-1">
                {chips(a.filters, ml).map((c, i) => <span key={i} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{c}</span>)}
              </div>
            </div>
            <button type="button" role="switch" aria-checked={a.is_active} disabled={busy === a.id}
              onClick={() => patch(a.id, { is_active: !a.is_active })}
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${a.is_active ? 'bg-brand' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${a.is_active ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select value={a.frequency} disabled={busy === a.id} onChange={(e) => patch(a.id, { frequency: e.target.value })}
              className="rounded-lg border border-gray-300 px-2 py-1 text-sm">
              {FREQS(ml).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <button type="button" disabled={busy === a.id} onClick={() => test(a.id)}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:border-brand hover:text-brand">
              {ml ? 'ടെസ്റ്റ് ഇമെയിൽ' : 'Test email'}
            </button>
            <button type="button" disabled={busy === a.id} onClick={() => remove(a.id)}
              className="rounded-lg border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50">
              {ml ? 'ഇല്ലാതാക്കുക' : 'Delete'}
            </button>
            {flash && flash.id === a.id && (
              <span className={`text-sm ${flash.ok ? 'text-green-600' : 'text-red-600'}`}>
                {flash.ok ? (ml ? 'അയച്ചു ✓' : 'Sent ✓') : (ml ? 'പരാജയപ്പെട്ടു' : 'Failed')}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
