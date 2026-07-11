'use client';

// FeedbackForm.js — star picker + what-went-well / improve + anonymous. Submits
// to /api/feedback/[token], creating a pending review.
import { useState } from 'react';

export default function FeedbackForm({ token, initialRating = 0, locale = 'ml' }) {
  const ml = locale === 'ml';
  const [rating, setRating] = useState(initialRating);
  const [wentWell, setWentWell] = useState('');
  const [improve, setImprove] = useState('');
  const [anon, setAnon] = useState(false);
  const [state, setState] = useState('idle'); // idle|busy|done|error
  const [msg, setMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (!(rating >= 1)) { setMsg(ml ? 'ദയവായി ഒരു റേറ്റിംഗ് തിരഞ്ഞെടുക്കുക' : 'Please pick a rating'); return; }
    setState('busy'); setMsg('');
    try {
      const r = await fetch(`/api/feedback/${token}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, went_well: wentWell, improve, anonymous: anon })
      });
      if (r.ok) { setState('done'); return; }
      if (r.status === 409) { setState('done'); return; }
      const j = await r.json().catch(() => ({}));
      setState('error'); setMsg((j.errors && j.errors[0]) || (ml ? 'സമർപ്പിക്കാനായില്ല' : 'Could not submit'));
    } catch { setState('error'); setMsg(ml ? 'പിശക്' : 'Something went wrong'); }
  }

  if (state === 'done') {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <div className="text-3xl">🙏</div>
        <p className="mt-2 font-semibold text-green-800">{ml ? 'നന്ദി! നിങ്ങളുടെ റിവ്യൂ മറ്റുള്ളവരെ സഹായിക്കുന്നു.' : 'Thank you! Your review helps others.'}</p>
        <p className="mt-1 text-sm text-green-700">{ml ? 'മോഡറേഷന് ശേഷം ഇത് പ്രസിദ്ധീകരിക്കും.' : 'It will be published after moderation.'}</p>
      </div>
    );
  }

  const ta = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';
  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="text-center">
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}
              className={`text-4xl transition ${n <= rating ? 'text-amber-400' : 'text-gray-200'} hover:scale-110`}>★</button>
          ))}
        </div>
      </div>
      <label className="block text-sm">
        <span className="text-gray-700">{ml ? 'എന്ത് നന്നായി?' : 'What went well?'}</span>
        <textarea value={wentWell} onChange={(e) => setWentWell(e.target.value)} rows={3} className={`mt-1 ${ta}`} />
      </label>
      <label className="block text-sm">
        <span className="text-gray-700">{ml ? 'എന്ത് മെച്ചപ്പെടുത്താം?' : 'What could be improved?'}</span>
        <textarea value={improve} onChange={(e) => setImprove(e.target.value)} rows={3} className={`mt-1 ${ta}`} />
      </label>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} /> {ml ? 'അജ്ഞാതമായി പോസ്റ്റ് ചെയ്യുക' : 'Post anonymously'}
      </label>
      {msg && <p className="text-sm text-red-600">{msg}</p>}
      <button type="submit" disabled={state === 'busy'} className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
        {state === 'busy' ? (ml ? 'സമർപ്പിക്കുന്നു…' : 'Submitting…') : (ml ? 'റിവ്യൂ സമർപ്പിക്കുക' : 'Submit review')}
      </button>
    </form>
  );
}
