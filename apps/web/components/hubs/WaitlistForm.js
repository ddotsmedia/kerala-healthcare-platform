'use client';

// WaitlistForm — email -> POST /api/waitlist { email, topic }.
import { useState } from 'react';

export default function WaitlistForm({ topic = 'general', locale = 'ml', label }) {
  const ml = locale === 'ml';
  const [state, setState] = useState('idle');
  const [msg, setMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    const email = e.target.email.value;
    setState('busy');
    try {
      const r = await fetch('/api/waitlist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, topic, locale })
      });
      if (r.ok) { setState('done'); setMsg(ml ? 'നന്ദി! ലഭ്യമാകുമ്പോൾ അറിയിക്കാം.' : "Thanks! We'll notify you when it's ready."); }
      else if (r.status === 429) { setState('idle'); setMsg(ml ? 'വളരെയധികം ശ്രമങ്ങൾ.' : 'Too many attempts.'); }
      else { setState('idle'); setMsg(ml ? 'സാധുവായ ഇമെയിൽ നൽകുക.' : 'Enter a valid email.'); }
    } catch { setState('idle'); setMsg(ml ? 'പിശക് സംഭവിച്ചു' : 'Something went wrong'); }
  }

  if (state === 'done') return <p className="rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">{msg}</p>;
  return (
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
      <input name="email" type="email" required aria-label="Email"
        placeholder={ml ? 'നിങ്ങളുടെ ഇമെയിൽ' : 'Your email'}
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base focus:border-brand focus:outline-none" />
      <button type="submit" disabled={state === 'busy'}
        className="shrink-0 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
        {state === 'busy' ? '…' : (label || (ml ? 'ചേരുക' : 'Join'))}
      </button>
      {msg && <p className="text-sm text-gray-600">{msg}</p>}
    </form>
  );
}
