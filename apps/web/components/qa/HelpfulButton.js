'use client';

// HelpfulButton.js — "Was this helpful?" vote on a Q&A answer (+1).
import { useState } from 'react';

export default function HelpfulButton({ answerId, initialCount = 0, locale = 'ml' }) {
  const ml = locale === 'ml';
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(false);

  async function vote() {
    if (voted) return;
    setVoted(true); setCount((c) => c + 1);
    try {
      const r = await fetch(`/api/qa/answers/${answerId}/helpful`, { method: 'POST' });
      if (r.ok) { const { data } = await r.json(); if (data?.helpful_count != null) setCount(data.helpful_count); }
    } catch { /* keep optimistic */ }
  }

  return (
    <button type="button" onClick={vote} disabled={voted}
      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium ${voted ? 'border-brand bg-teal-50 text-brand' : 'border-gray-300 text-gray-600 hover:border-brand hover:text-brand'}`}>
      👍 {ml ? 'സഹായകരം' : 'Helpful'} · {count}
    </button>
  );
}
