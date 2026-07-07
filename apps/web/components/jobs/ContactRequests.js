'use client';

// Candidate view of incoming contact requests — accept (reveal) or reject.
import { useState } from 'react';

export default function ContactRequests({ requests: initial = [], locale = 'ml' }) {
  const ml = locale === 'ml';
  const [reqs, setReqs] = useState(initial);
  const [busy, setBusy] = useState(null);

  async function respond(id, action) {
    setBusy(id);
    try {
      const r = await fetch(`/api/candidate/contact-requests/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action })
      });
      if (r.ok) { const { data } = await r.json(); setReqs((a) => a.map((x) => x.id === id ? { ...x, status: data.status } : x)); }
    } finally { setBusy(null); }
  }

  if (!reqs.length) {
    return <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
      <div className="text-3xl">📭</div><p className="mt-2">{ml ? 'കോൺടാക്റ്റ് അഭ്യർത്ഥനകൾ ഇല്ല.' : 'No contact requests yet.'}</p></div>;
  }

  return (
    <ul className="space-y-3">
      {reqs.map((r) => (
        <li key={r.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-gray-900">{r.org_name}{r.verified ? ' ✓' : ''}</h3>
              {r.org_type && <p className="text-xs text-gray-500">{r.org_type}</p>}
              {r.message && <p className="mt-2 text-sm text-gray-700">&ldquo;{r.message}&rdquo;</p>}
            </div>
            {r.status === 'pending' ? (
              <div className="flex shrink-0 gap-2">
                <button disabled={busy === r.id} onClick={() => respond(r.id, 'accept')} className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50">{ml ? 'സ്വീകരിക്കുക' : 'Accept'}</button>
                <button disabled={busy === r.id} onClick={() => respond(r.id, 'reject')} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50">{ml ? 'നിരസിക്കുക' : 'Reject'}</button>
              </div>
            ) : (
              <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${r.status === 'accepted' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {r.status === 'accepted' ? (ml ? 'സ്വീകരിച്ചു' : 'Accepted') : (ml ? 'നിരസിച്ചു' : 'Rejected')}
              </span>
            )}
          </div>
          {r.status === 'accepted' && (
            <p className="mt-2 text-xs text-green-700">{ml ? 'നിങ്ങളുടെ കോൺടാക്റ്റ് വിവരങ്ങൾ ഈ റിക്രൂട്ടറുമായി പങ്കിട്ടു.' : 'Your contact details have been shared with this recruiter.'}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
