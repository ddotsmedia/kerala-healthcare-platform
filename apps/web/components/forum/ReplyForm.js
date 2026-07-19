'use client';

// Reply to a forum post -> POST /api/forum/posts/[id]/reply. 401 -> login.
import { useState } from 'react';

export default function ReplyForm({ postId, locale = 'ml', loginPath = '/ml/login' }) {
  const ml = locale === 'ml';
  const [state, setState] = useState('idle');
  const [msg, setMsg] = useState('');

  async function submit(e) {
    e.preventDefault(); const f = e.target;
    setState('busy'); setMsg('');
    try {
      const r = await fetch(`/api/forum/posts/${postId}/reply`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: f.body.value, is_anonymous: f.anon.checked })
      });
      if (r.status === 401) { window.location.href = loginPath; return; }
      if (r.status === 201) { setState('done'); setMsg(ml ? 'മറുപടി സമർപ്പിച്ചു — അംഗീകാരത്തിനായി കാത്തിരിക്കുന്നു' : 'Reply submitted — pending approval'); f.reset(); }
      else { setState('idle'); setMsg(ml ? 'മറുപടി ചെറുതാണ്' : 'Reply too short'); }
    } catch { setState('idle'); setMsg(ml ? 'പിശക് സംഭവിച്ചു' : 'Something went wrong'); }
  }

  if (state === 'done') return <p className="rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">{msg}</p>;
  return (
    <form onSubmit={submit} className="space-y-2 rounded-xl border border-gray-200 bg-white p-4">
      <textarea name="body" required rows={3} placeholder={ml ? 'നിങ്ങളുടെ മറുപടി…' : 'Your reply…'}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-brand focus:outline-none" />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" name="anon" /> {ml ? 'അജ്ഞാതം' : 'Anonymous'}</label>
        <button type="submit" disabled={state === 'busy'} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {state === 'busy' ? '…' : (ml ? 'മറുപടി അയയ്ക്കുക' : 'Reply')}
        </button>
      </div>
      {msg && <p className="text-sm text-gray-600">{msg}</p>}
    </form>
  );
}
