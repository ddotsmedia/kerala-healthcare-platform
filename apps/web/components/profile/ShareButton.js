'use client';

// Copy-URL share button. Uses navigator.clipboard (no package); falls back to
// the Web Share API on mobile when available.
import { useState } from 'react';

export default function ShareButton({ locale = 'ml', title }) {
  const [done, setDone] = useState(false);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title: title || document.title, url }); return; }
      await navigator.clipboard.writeText(url);
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } catch { /* user cancelled or blocked — no-op */ }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-brand hover:text-brand"
    >
      <span aria-hidden="true">🔗</span>
      {done ? (locale === 'ml' ? 'പകർത്തി!' : 'Copied!') : (locale === 'ml' ? 'പങ്കിടുക' : 'Share')}
    </button>
  );
}

/** Copy arbitrary text (e.g. an address). */
export function CopyButton({ text, locale = 'ml' }) {
  const [done, setDone] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1800); } catch { /* no-op */ }
  }
  return (
    <button type="button" onClick={copy} className="text-xs font-medium text-brand hover:underline">
      {done ? (locale === 'ml' ? 'പകർത്തി!' : 'Copied!') : (locale === 'ml' ? '📋 പകർത്തുക' : '📋 Copy')}
    </button>
  );
}
