'use client';

// ChatThread.js — async message thread + composer. Polls for new messages.
import { useEffect, useRef, useState } from 'react';

const fmt = (d) => { try { return new Date(d).toLocaleString(); } catch { return ''; } };

export default function ChatThread({ apiBase, initialMessages = [], myUserId, locale = 'ml' }) {
  const ml = locale === 'ml';
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  useEffect(() => {
    const t = setInterval(async () => {
      try { const r = await fetch(apiBase); if (r.ok) { const { data } = await r.json(); if (Array.isArray(data)) setMessages(data); } } catch { /* noop */ }
    }, 12000);
    return () => clearInterval(t);
  }, [apiBase]);

  async function send(e) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setBusy(true);
    try {
      const r = await fetch(apiBase, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: body }) });
      if (r.ok) { const { data } = await r.json(); setMessages((m) => [...m, data]); setText(''); }
    } finally { setBusy(false); }
  }

  return (
    <div className="flex h-[60vh] flex-col rounded-xl border border-gray-200 bg-white">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 && <p className="mt-8 text-center text-sm text-gray-400">{ml ? 'സന്ദേശങ്ങളൊന്നുമില്ല. ഒരു ഫോളോ-അപ്പ് ചോദ്യം അയക്കൂ.' : 'No messages yet. Send a follow-up question.'}</p>}
        {messages.map((m) => {
          const mine = m.sender_id === myUserId;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${mine ? 'bg-brand text-white' : 'bg-gray-100 text-gray-800'}`}>
                <p className="whitespace-pre-wrap">{m.message}</p>
                <p className={`mt-0.5 text-[10px] ${mine ? 'text-white/70' : 'text-gray-400'}`}>{fmt(m.created_at)}</p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="flex gap-2 border-t border-gray-100 p-3">
        <input value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} placeholder={ml ? 'സന്ദേശം ടൈപ്പ് ചെയ്യുക…' : 'Type a message…'}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <button type="submit" disabled={busy || !text.trim()} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{ml ? 'അയക്കുക' : 'Send'}</button>
      </form>
    </div>
  );
}
