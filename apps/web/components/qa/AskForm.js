'use client';

// AskForm.js — ask a question with a pre-submit diagnosis-request checker.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { looksLikeDiagnosisRequest, REDIRECT_MSG } from '@/lib/qaSafety';

export default function AskForm({ specialties = [], locale = 'ml' }) {
  const ml = locale === 'ml';
  const router = useRouter();
  const [form, setForm] = useState({});
  const [state, setState] = useState('idle');
  const [msg, setMsg] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const flagged = looksLikeDiagnosisRequest(`${form.title || ''} ${form.body || ''}`);

  async function submit(e) {
    e.preventDefault();
    if (!form.title || !form.body) { setMsg(ml ? 'ശീർഷകവും വിവരണവും നൽകുക' : 'Title and description are required'); return; }
    if (flagged) { setMsg(ml ? REDIRECT_MSG.ml : REDIRECT_MSG.en); return; }
    setState('busy'); setMsg('');
    try {
      const r = await fetch('/api/qa/questions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, body: form.body, specialty_id: form.specialty_id || null, is_anonymous: !!form.anon })
      });
      if (r.status === 401) { window.location.href = `/${locale}/login?returnUrl=/${locale}/ask/new`; return; }
      if (r.status === 422) { setState('idle'); setMsg(ml ? REDIRECT_MSG.ml : REDIRECT_MSG.en); return; }
      if (r.ok) { setState('done'); }
      else { setState('idle'); setMsg(ml ? 'സമർപ്പിക്കാനായില്ല' : 'Could not submit'); }
    } catch { setState('idle'); setMsg(ml ? 'പിശക്' : 'Something went wrong'); }
  }

  if (state === 'done') {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <div className="text-3xl">✅</div>
        <p className="mt-2 font-semibold text-green-800">{ml ? 'ചോദ്യം ലഭിച്ചു!' : 'Question submitted!'}</p>
        <p className="mt-1 text-sm text-green-700">{ml ? 'മോഡറേഷന് ശേഷം ഇത് പ്രസിദ്ധീകരിക്കും.' : 'It will be published after moderation.'}</p>
        <button onClick={() => router.push(`/${locale}/ask`)} className="mt-3 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">{ml ? 'ചോദ്യങ്ങൾ കാണുക' : 'Browse questions'}</button>
      </div>
    );
  }

  const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';
  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5">
      <label className="block text-sm"><span className="text-gray-700">{ml ? 'ശീർഷകം *' : 'Title *'}</span>
        <input value={form.title || ''} onChange={(e) => set('title', e.target.value)} maxLength={200} placeholder={ml ? 'ഹ്രസ്വമായ ചോദ്യം' : 'A short question'} className={`mt-1 ${inp}`} /></label>
      <label className="block text-sm"><span className="text-gray-700">{ml ? 'വിശദമായ വിവരണം *' : 'Detailed description *'}</span>
        <textarea value={form.body || ''} onChange={(e) => set('body', e.target.value)} rows={5} maxLength={4000} className={`mt-1 ${inp}`} /></label>
      <label className="block text-sm"><span className="text-gray-700">{ml ? 'സ്പെഷ്യാലിറ്റി' : 'Specialty'}</span>
        <select value={form.specialty_id || ''} onChange={(e) => set('specialty_id', e.target.value)} className={`mt-1 ${inp}`}>
          <option value="">{ml ? 'തിരഞ്ഞെടുക്കുക' : 'Select…'}</option>
          {specialties.map((s) => <option key={s.id} value={s.id}>{ml ? s.name_ml : s.name_en}</option>)}
        </select></label>
      <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={!!form.anon} onChange={(e) => set('anon', e.target.checked)} /> {ml ? 'അജ്ഞാതമായി പോസ്റ്റ് ചെയ്യുക' : 'Post anonymously'}</label>

      {flagged && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">⚠️ {ml ? REDIRECT_MSG.ml : REDIRECT_MSG.en}</p>}
      {msg && !flagged && <p className="text-sm text-red-600">{msg}</p>}
      <button type="submit" disabled={state === 'busy' || flagged} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
        {state === 'busy' ? (ml ? 'സമർപ്പിക്കുന്നു…' : 'Submitting…') : (ml ? 'ചോദ്യം സമർപ്പിക്കുക' : 'Submit question')}
      </button>
    </form>
  );
}
