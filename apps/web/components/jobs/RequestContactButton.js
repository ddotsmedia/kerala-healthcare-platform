'use client';

// Request contact with a candidate. POST /api/employer/candidates/[id]/request-contact.
import { useState } from 'react';

export default function RequestContactButton({ candidateId, locale = 'ml', initialStatus = null }) {
  const ml = locale === 'ml';
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [state, setState] = useState(initialStatus ? 'sent' : 'idle'); // idle|sending|sent|error

  async function send(e) {
    e.preventDefault();
    setState('sending');
    try {
      const r = await fetch(`/api/employer/candidates/${candidateId}/request-contact`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message })
      });
      setState(r.ok ? 'sent' : 'error');
      if (r.ok) setOpen(false);
    } catch { setState('error'); }
  }

  if (state === 'sent' || initialStatus === 'pending' || initialStatus === 'accepted') {
    const label = initialStatus === 'accepted' ? (ml ? 'കോൺടാക്റ്റ് ലഭ്യം' : 'Contact unlocked') : (ml ? 'അഭ്യർത്ഥന അയച്ചു' : 'Request sent');
    return <span className="inline-block rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-600">✓ {label}</span>;
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white">
        {ml ? 'കോൺടാക്റ്റ് അഭ്യർത്ഥിക്കുക' : 'Request contact'}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm rounded-t-2xl bg-white p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={send} className="space-y-3">
              <h3 className="text-base font-semibold text-gray-900">{ml ? 'കോൺടാക്റ്റ് അഭ്യർത്ഥന' : 'Request contact'}</h3>
              <p className="text-xs text-gray-500">{ml ? 'ഉദ്യോഗാർത്ഥി അംഗീകരിച്ചാൽ കോൺടാക്റ്റ് വിവരങ്ങൾ ലഭിക്കും.' : 'Contact details are shared only if the candidate accepts.'}</p>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} maxLength={1000}
                placeholder={ml ? 'നിങ്ങളുടെ സന്ദേശം (ഓപ്ഷണൽ)' : 'Your message (optional)'}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              {state === 'error' && <p className="text-sm text-red-600">{ml ? 'അയക്കാനായില്ല.' : 'Could not send.'}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={state === 'sending'} className="flex-1 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white disabled:opacity-50">
                  {state === 'sending' ? (ml ? 'അയക്കുന്നു…' : 'Sending…') : (ml ? 'അയക്കുക' : 'Send request')}
                </button>
                <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">{ml ? 'റദ്ദാക്കുക' : 'Cancel'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
