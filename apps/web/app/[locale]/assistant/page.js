'use client';

import { useState, useRef } from 'react';
import { resolveLocale, t } from '@/lib/i18n';

export default function Assistant({ params }) {
  const locale = resolveLocale(params.locale);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const sid = useRef(null);
  if (!sid.current) sid.current = (globalThis.crypto?.randomUUID?.() || String(Math.random())).slice(0, 24);

  async function send(e) {
    e.preventDefault();
    const message = input.trim();
    if (!message || busy) return;
    setBusy(true);
    setMsgs((m) => [...m, { role: 'user', text: message }]);
    setInput('');
    const r = await fetch('/api/ai/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, locale, sessionId: sid.current })
    });
    const j = await r.json();
    if (r.status === 429) setMsgs((m) => [...m, { role: 'ai', text: 'Rate limit reached. Try again later.' }]);
    else setMsgs((m) => [...m, { role: 'ai', text: j.data?.response, sources: j.data?.sources || [] }]);
    setBusy(false);
  }

  return (
    <div className="flex min-h-[70vh] flex-col">
      <div className="rounded-lg bg-red-600 px-4 py-2 text-center text-sm font-semibold text-white">{t(locale, 'emergency_banner')}</div>
      <h1 className="my-3 text-xl font-bold">{t(locale, 'assistant')}</h1>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
            <div className={`inline-block max-w-[85%] rounded-2xl px-4 py-2 text-sm ${m.role === 'user' ? 'bg-brand text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
              <p className="whitespace-pre-wrap">{m.text}</p>
              {m.sources && m.sources.length > 0 && (
                <div className="mt-2 border-t border-gray-100 pt-1 text-xs text-gray-500">
                  {t(locale, 'sources')}: {m.sources.map((s, k) => <a key={k} href={s.url} className="mr-2 text-brand underline">{s.title}</a>)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">{t(locale, 'ai_disclaimer')}</p>
        <form onSubmit={send} className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t(locale, 'ask_health')}
            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-2 text-base focus:border-brand focus:outline-none" />
          <button disabled={busy} className="shrink-0 rounded-lg bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark">{t(locale, 'send')}</button>
        </form>
      </div>
    </div>
  );
}
