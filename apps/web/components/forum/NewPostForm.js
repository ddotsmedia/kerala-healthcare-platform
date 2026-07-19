'use client';

// New forum post -> POST /api/forum/posts. Collapsible; 401 -> login.
import { useState } from 'react';

export default function NewPostForm({ categoryId, locale = 'ml', loginPath = '/ml/login' }) {
  const ml = locale === 'ml';
  const [open, setOpen] = useState(false);
  const [state, setState] = useState('idle');
  const [msg, setMsg] = useState('');

  async function submit(e) {
    e.preventDefault(); const f = e.target;
    setState('busy'); setMsg('');
    try {
      const r = await fetch('/api/forum/posts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: categoryId, title: f.title.value, body: f.body.value, is_anonymous: f.anon.checked })
      });
      if (r.status === 401) { window.location.href = loginPath; return; }
      if (r.status === 201) { setState('done'); setMsg(ml ? 'പോസ്റ്റ് സമർപ്പിച്ചു — അംഗീകാരത്തിനായി കാത്തിരിക്കുന്നു' : 'Post submitted — pending approval'); f.reset(); }
      else { setState('idle'); setMsg(ml ? 'തലക്കെട്ട്/ഉള്ളടക്കം പരിശോധിക്കുക' : 'Check title/body length'); }
    } catch { setState('idle'); setMsg(ml ? 'പിശക് സംഭവിച്ചു' : 'Something went wrong'); }
  }

  const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-brand focus:outline-none';
  if (state === 'done') return <p className="rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">{msg}</p>;

  return (
    <div>
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
        {open ? (ml ? 'അടയ്ക്കുക' : 'Close') : (ml ? '+ പുതിയ പോസ്റ്റ്' : '+ New Post')}
      </button>
      {open && (
        <form onSubmit={submit} className="mt-3 space-y-2 rounded-xl border border-gray-200 bg-white p-4">
          <input name="title" required placeholder={ml ? 'തലക്കെട്ട്' : 'Title'} className={inp} />
          <textarea name="body" required rows={4} placeholder={ml ? 'നിങ്ങളുടെ അനുഭവം പങ്കിടുക…' : 'Share your experience…'} className={inp} />
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" name="anon" /> {ml ? 'അജ്ഞാതമായി പോസ്റ്റ് ചെയ്യുക' : 'Post anonymously'}
          </label>
          <button type="submit" disabled={state === 'busy'} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {state === 'busy' ? '…' : (ml ? 'സമർപ്പിക്കുക' : 'Submit')}
          </button>
          {msg && <p className="text-sm text-gray-600">{msg}</p>}
        </form>
      )}
    </div>
  );
}
