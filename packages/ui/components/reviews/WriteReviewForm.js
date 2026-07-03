'use client';

// WriteReviewForm — star picker + title + body + anonymous, POST /api/reviews.
import { useState } from 'react';

const MIN_BODY = 20;
const MAX_BODY = 500;

export default function WriteReviewForm({ entityType, entityId, locale = 'ml', loginPath = '/ml/login', onSubmitted }) {
  const ml = locale === 'ml';
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [anon, setAnon] = useState(false);
  const [state, setState] = useState('idle'); // idle|busy|done|already|login|error
  const [msg, setMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (rating < 1) { setMsg(ml ? 'റേറ്റിംഗ് തിരഞ്ഞെടുക്കൂ' : 'Please select a rating'); return; }
    if (body.trim().length < MIN_BODY) { setMsg(ml ? `കുറഞ്ഞത് ${MIN_BODY} അക്ഷരങ്ങൾ` : `At least ${MIN_BODY} characters`); return; }
    setState('busy'); setMsg('');
    try {
      const r = await fetch('/api/reviews', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity_type: entityType, entity_id: entityId, rating, title, body, is_anonymous: anon })
      });
      if (r.status === 401) { setState('login'); return; }
      if (r.status === 409) { setState('already'); setMsg(ml ? 'നിങ്ങൾ ഇതിനകം റിവ്യൂ ചെയ്തിട്ടുണ്ട്' : 'You have already reviewed this'); return; }
      if (r.status === 201) {
        setState('done'); setMsg(ml ? 'റിവ്യൂ സമർപ്പിച്ചു — അംഗീകാരത്തിനായി കാത്തിരിക്കുന്നു' : 'Review submitted — pending approval');
        setRating(0); setTitle(''); setBody(''); setAnon(false);
        if (onSubmitted) onSubmitted();
        return;
      }
      setState('error'); setMsg(ml ? 'സമർപ്പിക്കാൻ കഴിഞ്ഞില്ല' : 'Could not submit');
    } catch { setState('error'); setMsg(ml ? 'ഒരു പിശക് സംഭവിച്ചു' : 'Something went wrong'); }
  }

  if (state === 'login') {
    return (
      <div className="rounded-lg bg-teal-50 p-4 text-sm text-gray-700">
        {ml ? 'റിവ്യൂ എഴുതാൻ ലോഗിൻ ചെയ്യുക. ' : 'Please log in to write a review. '}
        <a href={loginPath} className="font-semibold text-brand hover:underline">{ml ? 'ലോഗിൻ →' : 'Log in →'}</a>
      </div>
    );
  }
  if (state === 'done') return <p className="rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700">{msg}</p>;

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-1" role="radiogroup" aria-label={ml ? 'റേറ്റിംഗ്' : 'Rating'}
        onMouseLeave={() => setHover(0)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); setRating((r) => Math.min(5, r + 1)); }
          if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); setRating((r) => Math.max(1, r - 1)); }
        }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" role="radio" aria-checked={rating === i}
            tabIndex={rating === i || (rating === 0 && i === 1) ? 0 : -1}
            onClick={() => setRating(i)} onMouseEnter={() => setHover(i)}
            aria-label={`${i} ${ml ? 'നക്ഷത്രം' : 'star'}`}
            className={`text-2xl leading-none ${(hover || rating) >= i ? 'text-brand' : 'text-gray-300'}`}>★</button>
        ))}
      </div>
      <input type="text" maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)}
        placeholder={ml ? 'തലക്കെട്ട് (ഓപ്ഷണൽ)' : 'Title (optional)'}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none" />
      <textarea rows={4} maxLength={MAX_BODY} value={body} onChange={(e) => setBody(e.target.value)}
        placeholder={ml ? 'നിങ്ങളുടെ അനുഭവം (20–500 അക്ഷരങ്ങൾ)' : 'Your experience (20–500 characters)'}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none" />
      <div className="flex items-center justify-between text-xs text-gray-500">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} />
          {ml ? 'അജ്ഞാതമായി പോസ്റ്റ് ചെയ്യുക' : 'Post anonymously'}
        </label>
        <span>{body.length}/{MAX_BODY}</span>
      </div>
      <button type="submit" disabled={state === 'busy'}
        className="w-full rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60 sm:w-auto">
        {state === 'busy' ? (ml ? 'സമർപ്പിക്കുന്നു…' : 'Submitting…') : (ml ? 'റിവ്യൂ സമർപ്പിക്കുക' : 'Submit Review')}
      </button>
      {msg && <p className="text-sm text-gray-600">{msg}</p>}
    </form>
  );
}
