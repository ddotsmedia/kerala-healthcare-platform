'use client';

// "Save this search" → modal (name + frequency) → POST /api/jobs/alerts.
import { useState } from 'react';

const FREQS = (ml) => [
  ['instant', ml ? 'തൽക്ഷണം' : 'Instant'],
  ['daily', ml ? 'ദിവസേന' : 'Daily'],
  ['weekly', ml ? 'ആഴ്ചയിൽ' : 'Weekly']
];

export default function SaveSearchButton({ filters = {}, locale = 'ml', loginPath = '/ml/login', defaultName = '' }) {
  const ml = locale === 'ml';
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName);
  const [frequency, setFrequency] = useState('daily');
  const [state, setState] = useState('idle'); // idle|saving|done|error

  async function save(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setState('saving');
    try {
      const r = await fetch('/api/jobs/alerts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), filters, frequency })
      });
      if (r.status === 401) { window.location.href = loginPath; return; }
      setState(r.ok ? 'done' : 'error');
    } catch { setState('error'); }
  }

  return (
    <>
      <button type="button" onClick={() => { setOpen(true); setState('idle'); }}
        className="inline-flex items-center gap-1 rounded-lg border border-brand bg-teal-50 px-3 py-2 text-sm font-medium text-brand hover:bg-teal-100">
        🔔 {ml ? 'ഈ തിരയൽ സേവ് ചെയ്യുക' : 'Save this search'}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            {state === 'done' ? (
              <div className="text-center">
                <div className="text-3xl">✅</div>
                <p className="mt-2 font-medium text-gray-900">{ml ? 'അലേർട്ട് സേവ് ചെയ്തു' : 'Alert saved'}</p>
                <p className="mt-1 text-sm text-gray-600">{ml ? 'യോജിക്കുന്ന ജോലികൾ ഇമെയിലിൽ ലഭിക്കും.' : 'Matching jobs will be emailed to you.'}</p>
                <div className="mt-4 flex gap-2">
                  <a href={`/${locale}/jobs/alerts`} className="flex-1 rounded-lg bg-brand px-3 py-2 text-center text-sm font-medium text-white">{ml ? 'അലേർട്ടുകൾ' : 'My alerts'}</a>
                  <button onClick={() => setOpen(false)} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm">{ml ? 'അടയ്ക്കുക' : 'Close'}</button>
                </div>
              </div>
            ) : (
              <form onSubmit={save} className="space-y-3">
                <h3 className="text-base font-semibold text-gray-900">{ml ? 'ജോലി അലേർട്ട് സൃഷ്ടിക്കുക' : 'Create job alert'}</h3>
                <label className="block text-sm">
                  <span className="text-gray-700">{ml ? 'അലേർട്ട് പേര്' : 'Alert name'}</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoFocus
                    placeholder={ml ? 'ഉദാ: കൊച്ചിയിലെ ICU നഴ്സ്' : 'e.g. ICU Nurse Jobs Kochi'}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-base" />
                </label>
                <label className="block text-sm">
                  <span className="text-gray-700">{ml ? 'ആവൃത്തി' : 'Frequency'}</span>
                  <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    {FREQS(ml).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </label>
                {state === 'error' && <p className="text-sm text-red-600">{ml ? 'സേവ് ചെയ്യാനായില്ല. വീണ്ടും ശ്രമിക്കുക.' : 'Could not save. Try again.'}</p>}
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={state === 'saving' || !name.trim()}
                    className="flex-1 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white disabled:opacity-50">
                    {state === 'saving' ? (ml ? 'സേവ് ചെയ്യുന്നു…' : 'Saving…') : (ml ? 'സേവ് ചെയ്യുക' : 'Save alert')}
                  </button>
                  <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">{ml ? 'റദ്ദാക്കുക' : 'Cancel'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
