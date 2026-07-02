'use client';

import { useState } from 'react';

export default function ApplyBox({ jobId, authed, loginHref, labels }) {
  const [cover, setCover] = useState('');
  const [state, setState] = useState('idle');

  if (!authed) {
    return <a href={loginHref} className="inline-block rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">{labels.login}</a>;
  }
  if (state === 'done') return <p className="rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{labels.applied}</p>;

  async function apply(e) {
    e.preventDefault();
    setState('sending');
    const r = await fetch(`/api/jobs/${jobId}/apply`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cover_letter: cover })
    });
    setState(r.ok ? 'done' : 'error');
  }

  return (
    <form onSubmit={apply} className="space-y-2 rounded-xl border border-gray-200 bg-white p-4">
      <textarea value={cover} onChange={(e) => setCover(e.target.value)} rows={3}
        placeholder={labels.cover} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      <button disabled={state === 'sending'} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
        {labels.apply}
      </button>
      {state === 'error' && <p className="text-xs text-red-600">{labels.error}</p>}
    </form>
  );
}
